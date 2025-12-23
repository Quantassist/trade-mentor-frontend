import { checkEventRegistration } from "@/data/events"
import { getAppUserId } from "@/lib/get-app-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventid: string }> }
) {
  try {
    const { eventid } = await params
    const userId = await getAppUserId()
    
    if (!userId) {
      return NextResponse.json({ status: 401, message: "Unauthorized" }, { status: 401 })
    }

    const result = await checkEventRegistration(eventid, userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in event registration API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
