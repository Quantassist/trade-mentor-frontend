import { getGroupEvents } from "@/data/events"
import { getAppUserId } from "@/lib/get-app-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupid: string }> }
) {
  try {
    const { groupid } = await params
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get("upcoming") === "true"
    const published = searchParams.has("published") ? searchParams.get("published") === "true" : undefined
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined
    const userId = await getAppUserId()

    const result = await getGroupEvents(groupid, { upcoming, published, limit, userId })
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in group events API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
