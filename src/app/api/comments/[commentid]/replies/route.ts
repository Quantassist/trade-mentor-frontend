import { getCommentReplies } from "@/data/groups"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commentid: string }> }
) {
  try {
    const { commentid } = await params

    const result = await getCommentReplies(commentid)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in comment replies API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
