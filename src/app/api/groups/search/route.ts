import { searchGroups } from "@/data/groups"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = (searchParams.get("mode") || "GROUPS") as "GROUPS" | "POSTS"
    const query = searchParams.get("query") || ""
    const paginate = parseInt(searchParams.get("paginate") || "0", 10)

    const result = await searchGroups(mode, query, paginate)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in search groups API:", error)
    return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 })
  }
}
