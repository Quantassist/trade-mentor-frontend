import { onAuthenticatedUser } from "@/actions/auth"
import { onClapPress } from "@/actions/groups"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, userId, count } = body

    if (!postId || !count) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user is authenticated
    const user = await onAuthenticatedUser()
    if (!user.id || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await onClapPress(postId, userId, count)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in clap-post API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
