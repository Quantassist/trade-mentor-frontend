import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { locale } = await req.json()
    if (!locale || typeof locale !== "string") {
      return NextResponse.json({ error: "locale required" }, { status: 400 })
    }

    const clerk = await currentUser()
    if (!clerk) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    console.log(clerk.id)


    await client.user.update({ where: { clerkId: clerk.id }, data: { locale } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: "failed to update locale" }, { status: 500 })
  }
}
