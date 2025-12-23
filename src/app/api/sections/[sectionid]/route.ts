import { getSectionInfo } from "@/data/courses"
import { getAppUserId } from "@/lib/get-app-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sectionid: string }> }
) {
  try {
    const { sectionid } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get("locale") || undefined
    const userId = await getAppUserId()

    const result = await getSectionInfo(sectionid, locale, userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in section info API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
