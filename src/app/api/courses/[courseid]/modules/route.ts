import { getCourseModules } from "@/data/courses"
import { getAppUserId } from "@/lib/get-app-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseid: string }> }
) {
  try {
    const { courseid } = await params
    const userId = await getAppUserId()

    const result = await getCourseModules(courseid, userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in course modules API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
