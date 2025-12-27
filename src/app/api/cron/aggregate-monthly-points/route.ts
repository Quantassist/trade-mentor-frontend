import { client } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// This endpoint aggregates points from PointActivity into UserPoints for the current month
// Runs hourly via cron job to keep UserPoints in sync with PointActivity
// UserPoints table only contains current month data for optimal query performance

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET

export async function POST(req: NextRequest) {
  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization")
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Get all groups
    const groups = await client.group.findMany({
      select: { id: true },
    })

    let totalUpdated = 0
    let totalDeleted = 0

    for (const group of groups) {
      // Aggregate points for each user in this group for current month
      const monthlyPoints = await client.pointActivity.groupBy({
        by: ["userId"],
        where: {
          groupId: group.id,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: {
          points: true,
        },
      })

      const activeUserIds = monthlyPoints.map((e) => e.userId)

      // Update UserPoints for each user with points this month
      for (const entry of monthlyPoints) {
        const points = entry._sum.points ?? 0
        
        await client.userPoints.upsert({
          where: {
            userId_groupId: {
              userId: entry.userId,
              groupId: group.id,
            },
          },
          update: {
            points,
            updatedAt: new Date(),
          },
          create: {
            userId: entry.userId,
            groupId: group.id,
            points,
          },
        })
        totalUpdated++
      }

      // Delete UserPoints records for users who have no points this month
      // This keeps the table clean and only contains current month data
      const deleted = await client.userPoints.deleteMany({
        where: {
          groupId: group.id,
          userId: {
            notIn: activeUserIds,
          },
        },
      })
      totalDeleted += deleted.count
    }

    return NextResponse.json({
      success: true,
      message: `Aggregated points for ${totalUpdated} users, removed ${totalDeleted} inactive records`,
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      },
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("Error aggregating monthly points:", error)
    return NextResponse.json(
      { error: "Failed to aggregate points" },
      { status: 500 }
    )
  }
}

// Also support GET for Vercel Cron
export async function GET(req: NextRequest) {
  return POST(req)
}
