import { getPostAllLocales } from "@/data/channels"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postid: string }> }
) {
  try {
    const { postid } = await params

    const result = await getPostAllLocales(postid)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in post locales API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
