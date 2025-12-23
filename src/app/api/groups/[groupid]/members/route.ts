import { getAllGroupMembers } from "@/data/groups"
import { getAppUserId } from "@/lib/get-app-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupid: string }> }
) {
  try {
    const { groupid } = await params
    const userId = await getAppUserId()

    const result = await getAllGroupMembers(groupid, userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in group members API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
