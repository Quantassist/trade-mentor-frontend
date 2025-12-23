import { getGroupLeaderboard } from "@/data/leaderboard"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupid: string }> }
) {
  try {
    const { groupid } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    const result = await getGroupLeaderboard(groupid, limit, offset)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in group leaderboard API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
