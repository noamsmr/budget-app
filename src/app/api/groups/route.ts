import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { groupSchema } from "@/lib/validations"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const groups = await db.group.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(
    groups.map((grp) => ({ ...grp, createdAt: grp.createdAt.toISOString() }))
  )
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = groupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const group = await db.group.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
    },
  })

  return NextResponse.json({ ...group, createdAt: group.createdAt.toISOString() }, { status: 201 })
}
