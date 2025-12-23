import { getGroupCourses } from "@/data/courses"
import { getAppUserId } from "@/lib/get-app-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupid: string }> }
) {
  try {
    const { groupid } = await params
    const { searchParams } = new URL(request.url)
    const filter = (searchParams.get("filter") || "all") as "all" | "in_progress" | "completed" | "unpublished" | "buckets"
    const locale = searchParams.get("locale") || undefined
    const userId = await getAppUserId()

    const result = await getGroupCourses(groupid, filter, locale, userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in group courses API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
