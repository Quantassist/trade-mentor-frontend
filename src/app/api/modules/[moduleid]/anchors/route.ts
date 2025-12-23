import { getModuleAnchors } from "@/data/courses"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleid: string }> }
) {
  try {
    const { moduleid } = await params

    const result = await getModuleAnchors(moduleid)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in module anchors API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
