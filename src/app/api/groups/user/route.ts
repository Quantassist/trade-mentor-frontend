import { getUserGroups } from "@/data/groups"
import { getAppUserId } from "@/lib/get-app-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = await getAppUserId()
    
    if (!userId) {
      return NextResponse.json({ status: 401, message: "Unauthorized" }, { status: 401 })
    }

    const result = await getUserGroups(userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in user groups API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
