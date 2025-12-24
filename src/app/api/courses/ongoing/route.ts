import { getOngoingCourses } from "@/data/courses"
import { getAppUserId } from "@/lib/get-app-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get("limit") || "3", 10)
  const userId = await getAppUserId()
  
  const result = await getOngoingCourses(limit, userId)
  return NextResponse.json(result)
}
