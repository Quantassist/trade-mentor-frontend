import { getUserPointActivities } from "@/data/leaderboard"
import { getAppUserId } from "@/lib/get-app-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupid: string }> }
) {
  try {
    const { groupid } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const userId = await getAppUserId()
    
    if (!userId) {
      return NextResponse.json({ status: 401, message: "Unauthorized" }, { status: 401 })
    }

    const result = await getUserPointActivities(groupid, userId, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in user activities API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
