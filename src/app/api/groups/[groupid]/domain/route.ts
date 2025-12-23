import { getDomainConfig } from "@/data/groups"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupid: string }> }
) {
  try {
    const { groupid } = await params

    const result = await getDomainConfig(groupid)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in domain config API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
