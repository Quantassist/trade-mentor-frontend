import { getPostComments } from "@/data/groups"
import { getAppUserId } from "@/lib/get-app-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postid: string }> }
) {
  try {
    const { postid } = await params
    const userId = await getAppUserId()

    const result = await getPostComments(postid, userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in post comments API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
