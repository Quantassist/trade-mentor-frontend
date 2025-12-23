import { onAuthenticatedUser } from "@/actions/auth"
import { onClapComment } from "@/actions/channel"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commentId, count } = body

    if (!commentId || !count) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user is authenticated
    const user = await onAuthenticatedUser()
    if (!user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await onClapComment(commentId, count)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in clap-comment API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
