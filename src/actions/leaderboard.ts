"use server"

import { POINT_VALUES } from "@/constants/points"
import { isUUID } from "@/lib/id-utils"
import { client } from "@/lib/prisma"
import { ActivityType } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Helper to resolve group slug to UUID
const resolveGroupId = async (groupIdOrSlug: string): Promise<string | null> => {
  if (isUUID(groupIdOrSlug)) return groupIdOrSlug
  const group = await client.group.findFirst({
    where: { slug: groupIdOrSlug },
    select: { id: true },
  })
  return group?.id ?? null
}

// Helper to get current month date range
const getCurrentMonthRange = () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { startOfMonth, endOfMonth }
}

export const onGetGroupLeaderboard = async (
  groupIdOrSlug: string,
  limit: number = 20,
  offset: number = 0,
) => {
  try {
    const groupId = await resolveGroupId(groupIdOrSlug)
    if (!groupId) return { status: 404, message: "Group not found" }

    const { startOfMonth, endOfMonth } = getCurrentMonthRange()

    // Read from UserPoints table (pre-aggregated by hourly cron job)
    // UserPoints only contains current month data, already ordered by points desc
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
      leaderboard: leaderboard.map((entry, index) => ({
        rank: offset + index + 1,
        id: entry.id,
        userId: entry.userId,
        points: entry.points,
        user: entry.User,
      })),
      total: totalMembers,
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      },
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return { status: 400, message: "Failed to fetch leaderboard" }
  }
}

export const onGetUserRank = async (userId: string, groupIdOrSlug: string) => {
  try {
    const groupId = await resolveGroupId(groupIdOrSlug)
    if (!groupId) return { status: 404, message: "Group not found" }

    // Read from UserPoints table (pre-aggregated by hourly cron job)
    const userPointsRecord = await client.userPoints.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    })

    if (!userPointsRecord || userPointsRecord.points === 0) {
      return { status: 200, rank: null, points: 0 }
    }

    // Count users with more points than current user
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
    return { status: 400, message: "Failed to fetch user rank" }
  }
}

export const onGetUserPointActivities = async (
  userId: string,
  groupIdOrSlug: string,
  limit: number = 20,
) => {
  try {
    const groupId = await resolveGroupId(groupIdOrSlug)
    if (!groupId) return { status: 404, message: "Group not found" }

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
}

export const onAwardPoints = async (
  userId: string,
  groupIdOrSlug: string,
  activityType: ActivityType,
  referenceId?: string,
  description?: string,
) => {
  try {
    const groupId = await resolveGroupId(groupIdOrSlug)
    if (!groupId) return { status: 404, message: "Group not found" }

    const points = POINT_VALUES[activityType]

    // Create activity record - leaderboard reads directly from PointActivity for current month
    // UserPoints table is populated by cron job as a cache/snapshot
    await client.pointActivity.create({
      data: {
        userId,
        groupId,
        activityType,
        points,
        referenceId,
        description,
      },
    })

    revalidatePath(`/group/${groupId}/leaderboard`)
    return { status: 200, pointsAwarded: points, activityType, description }
  } catch (error) {
    console.error("Error awarding points:", error)
    return { status: 400, message: "Failed to award points" }
  }
}

export const onTrackDailyLogin = async (userId: string, groupIdOrSlug: string) => {
  try {
    const groupId = await resolveGroupId(groupIdOrSlug)
    if (!groupId) return { status: 404, message: "Group not found" }

    // Check if user already got daily login points today for this group
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const existingToday = await client.pointActivity.findFirst({
      where: {
        userId,
        groupId,
        activityType: "DAILY_LOGIN",
        createdAt: { gte: today },
      },
    })

    if (existingToday) {
      return { status: 200, alreadyAwarded: true, message: "Daily login already tracked" }
    }

    // Award daily login points
    await onAwardPoints(userId, groupId, "DAILY_LOGIN", undefined, "Daily login bonus")
    
    return { status: 200, alreadyAwarded: false, message: "Daily login tracked" }
  } catch (error) {
    console.error("Error tracking daily login:", error)
    return { status: 400, message: "Failed to track daily login" }
  }
}

