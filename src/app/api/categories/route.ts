import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { categorySchema } from "@/lib/validations"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const categories = await db.category.findMany({
    where: { userId: session.user.id },
    include: { group: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(
    categories.map((cat) => ({
      ...cat,
      createdAt: cat.createdAt.toISOString(),
      group: cat.group ? { ...cat.group, createdAt: cat.group.createdAt.toISOString() } : null,
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const category = await db.category.create({
    data: {
      userId: session.user.id,
      name: data.name,
      color: data.color ?? null,
      type: data.type,
      groupId: data.groupId ?? null,
    },
    include: { group: true },
  })

  return NextResponse.json(
    {
      ...category,
      createdAt: category.createdAt.toISOString(),
      group: category.group
        ? { ...category.group, createdAt: category.group.createdAt.toISOString() }
        : null,
    },
    { status: 201 }
  )
}
