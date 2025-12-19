import { auth } from "@/lib/auth"
import { client } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { locale } = await req.json()
    if (!locale || typeof locale !== "string") {
      return NextResponse.json({ error: "locale required" }, { status: 400 })
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    await client.appUser.update({ where: { betterAuthId: session.user.id }, data: { locale } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: "failed to update locale" }, { status: 500 })
  }
}
