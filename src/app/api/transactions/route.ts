import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { transactionSchema } from "@/lib/validations"
import { expandRecurring, BaseTransaction } from "@/lib/recurring"
import { startOfDay, endOfDay } from "date-fns"

function serializeTx(tx: Record<string, unknown>) {
  return {
    ...tx,
    amount: tx.amount?.toString(),
    date: tx.date instanceof Date ? tx.date.toISOString() : tx.date,
    recurrenceEndDate:
      tx.recurrenceEndDate instanceof Date
        ? tx.recurrenceEndDate.toISOString()
        : tx.recurrenceEndDate,
    createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
    category: tx.category
      ? {
          ...(tx.category as Record<string, unknown>),
          createdAt:
            (tx.category as Record<string, unknown>).createdAt instanceof Date
              ? ((tx.category as Record<string, unknown>).createdAt as Date).toISOString()
              : (tx.category as Record<string, unknown>).createdAt,
          group: (tx.category as Record<string, unknown>).group
            ? {
                ...((tx.category as Record<string, unknown>).group as Record<string, unknown>),
                createdAt:
                  ((tx.category as Record<string, unknown>).group as Record<string, unknown>)
                    .createdAt instanceof Date
                    ? (
                        ((tx.category as Record<string, unknown>).group as Record<string, unknown>)
                          .createdAt as Date
                      ).toISOString()
                    : ((tx.category as Record<string, unknown>).group as Record<string, unknown>)
                        .createdAt,
              }
            : null,
        }
      : null,
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const type = searchParams.get("type")
  const categoryId = searchParams.get("categoryId")
  const groupId = searchParams.get("groupId")

  const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const toDate = to ? new Date(to) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59)

  // Fetch all recurring transactions that started before 'to' date
  // plus all non-recurring transactions in range
  const where: Record<string, unknown> = {
    userId: session.user.id,
    OR: [
      // Non-recurring: fetch within range
      {
        isRecurring: false,
        date: { gte: startOfDay(fromDate), lte: endOfDay(toDate) },
      },
      // Recurring: fetch all that started at or before 'to' date
      {
        isRecurring: true,
        date: { lte: endOfDay(toDate) },
      },
    ],
  }

  if (type === "INCOME" || type === "EXPENSE") {
    where.type = type
    // Need to restructure OR with type filter
    delete where.OR
    where.type = type
    where.OR = [
      {
        isRecurring: false,
        date: { gte: startOfDay(fromDate), lte: endOfDay(toDate) },
      },
      {
        isRecurring: true,
        date: { lte: endOfDay(toDate) },
      },
    ]
  }

  const transactions = await db.transaction.findMany({
    where: {
      userId: session.user.id,
      ...(type === "INCOME" || type === "EXPENSE" ? { type } : {}),
      OR: [
        {
          isRecurring: false,
          date: { gte: startOfDay(fromDate), lte: endOfDay(toDate) },
        },
        {
          isRecurring: true,
          date: { lte: endOfDay(toDate) },
        },
      ],
    },
    include: {
      category: {
        include: { group: true },
      },
    },
    orderBy: { date: "desc" },
  })

  // Expand recurring transactions
  const expanded = expandRecurring(transactions as unknown as BaseTransaction[], fromDate, toDate)

  // Apply category/group filters after expansion
  let filtered = expanded
  if (categoryId) {
    filtered = filtered.filter((tx) => tx.categoryId === categoryId)
  }
  if (groupId) {
    filtered = filtered.filter((tx) => tx.category?.groupId === groupId)
  }

  return NextResponse.json(filtered.map((tx) => serializeTx(tx as unknown as Record<string, unknown>)))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = transactionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const tx = await db.transaction.create({
    data: {
      userId: session.user.id,
      type: data.type,
      amount: data.amount,
      description: data.description,
      categoryId: data.categoryId ?? null,
      date: new Date(data.date),
      isRecurring: data.isRecurring,
      recurrenceRule: data.recurrenceRule ?? null,
      recurrenceEndDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : null,
    },
    include: { category: { include: { group: true } } },
  })

  return NextResponse.json(serializeTx(tx as unknown as Record<string, unknown>), { status: 201 })
}
