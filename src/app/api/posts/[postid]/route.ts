import { getPostInfo } from "@/data/groups"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postid: string }> }
) {
  try {
    const { postid } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get("locale") || undefined

    const result = await getPostInfo(postid, locale)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in post info API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
