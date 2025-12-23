import { getChannelInfo } from "@/data/channels"
import { getAppUserId } from "@/lib/get-app-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelid: string }> }
) {
  try {
    const { channelid } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get("locale") || undefined
    const userId = await getAppUserId()

    const result = await getChannelInfo(channelid, locale, userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in channel info API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
