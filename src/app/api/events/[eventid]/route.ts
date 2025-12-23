import { getEventById } from "@/data/events"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventid: string }> }
) {
  try {
    const { eventid } = await params

    const result = await getEventById(eventid)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in event API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
