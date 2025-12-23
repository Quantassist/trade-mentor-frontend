import { getMentorProfiles } from "@/data/courses"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const result = await getMentorProfiles()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in mentor profiles API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
