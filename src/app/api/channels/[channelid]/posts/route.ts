import { getChannelPosts } from "@/data/groups"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelid: string }> }
) {
  try {
    const { channelid } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get("locale") || undefined

    const result = await getChannelPosts(channelid, locale)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in channel posts API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
