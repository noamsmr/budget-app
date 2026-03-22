import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { transactionSchema } from "@/lib/validations"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  // Strip instance suffix if present (e.g. "abc123_2026-03-01T...")
  const baseId = id.includes("_") ? id.split("_")[0] : id

  const existing = await db.transaction.findFirst({
    where: { id: baseId, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = transactionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const tx = await db.transaction.update({
    where: { id: baseId },
    data: {
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

  return NextResponse.json({
    ...tx,
    amount: tx.amount.toString(),
    date: tx.date.toISOString(),
    recurrenceEndDate: tx.recurrenceEndDate?.toISOString() ?? null,
    createdAt: tx.createdAt.toISOString(),
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const baseId = id.includes("_") ? id.split("_")[0] : id

  const existing = await db.transaction.findFirst({
    where: { id: baseId, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.transaction.delete({ where: { id: baseId } })
  return NextResponse.json({ success: true })
}
