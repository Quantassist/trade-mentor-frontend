/**
 * Data Access Layer - Leaderboard
 * Pure data fetching functions that can be used by API routes and Server Components
 */

import { client } from "@/lib/prisma"
import { cache } from "react"

export const getGroupLeaderboard = cache(async (groupId: string, limit: number = 20, offset: number = 0) => {
  try {
    const leaderboard = await client.userPoints.findMany({
      where: { groupId },
      orderBy: { points: "desc" },
      take: limit,
      skip: offset,
      include: {
        User: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            image: true,
          },
        },
      },
    })

    const totalMembers = await client.userPoints.count({
      where: { groupId },
    })

    return {
      status: 200,
      leaderboard: leaderboard.map((entry: any, index: number) => ({
        rank: offset + index + 1,
        id: entry.id,
        userId: entry.userId,
        points: entry.points,
        user: entry.User,
      })),
      total: totalMembers,
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return { status: 400, message: "Failed to fetch leaderboard" }
  }
})

export const getUserRank = cache(async (groupId: string, userId: string) => {
  try {
    const userPointsRecord = await client.userPoints.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    })

    if (!userPointsRecord) {
      return { status: 200, rank: null, points: 0 }
    }

    // Count users with more points
    const higherRanked = await client.userPoints.count({
      where: {
        groupId,
        points: { gt: userPointsRecord.points },
      },
    })

    return {
      status: 200,
      rank: higherRanked + 1,
      points: userPointsRecord.points,
    }
  } catch (error) {
    console.error("Error fetching user rank:", error)
    return { status: 400, message: "Failed to fetch rank" }
  }
})

export const getUserPointActivities = cache(async (groupId: string, userId: string, limit: number = 20) => {
  try {
    const activities = await client.pointActivity.findMany({
      where: { userId, groupId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return { status: 200, activities }
  } catch (error) {
    console.error("Error fetching point activities:", error)
    return { status: 400, message: "Failed to fetch activities" }
  }
})
