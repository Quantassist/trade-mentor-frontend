import { getExploreGroups } from "@/data/groups"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || ""
    const paginate = parseInt(searchParams.get("paginate") || "0", 10)

    const result = await getExploreGroups(category, paginate)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in explore groups API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
