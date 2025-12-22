"use server"

import { POINT_VALUES } from "@/constants/points"
import { client } from "@/lib/prisma"
import { ActivityType } from "@prisma/client"
import { revalidatePath } from "next/cache"

export const onGetGroupLeaderboard = async (
  groupId: string,
  limit: number = 20,
  offset: number = 0,
) => {
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
      leaderboard: leaderboard.map((entry, index) => ({
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
}

export const onGetUserRank = async (userId: string, groupId: string) => {
  try {
    const userPoints = await client.userPoints.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    })

    if (!userPoints) {
      return { status: 200, rank: null, points: 0 }
    }

    const higherRanked = await client.userPoints.count({
      where: {
        groupId,
        points: { gt: userPoints.points },
      },
    })

    return {
      status: 200,
      rank: higherRanked + 1,
      points: userPoints.points,
    }
  } catch (error) {
    console.error("Error fetching user rank:", error)
    return { status: 400, message: "Failed to fetch user rank" }
  }
}

export const onGetUserPointActivities = async (
  userId: string,
  groupId: string,
  limit: number = 20,
) => {
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
}

export const onAwardPoints = async (
  userId: string,
  groupId: string,
  activityType: ActivityType,
  referenceId?: string,
  description?: string,
) => {
  try {
    const points = POINT_VALUES[activityType]

    // Create activity record
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

    // Update or create user points
    await client.userPoints.upsert({
      where: {
        userId_groupId: { userId, groupId },
      },
      update: {
        points: { increment: points },
      },
      create: {
        userId,
        groupId,
        points,
      },
    })

    revalidatePath(`/group/${groupId}/leaderboard`)
    return { status: 200, pointsAwarded: points }
  } catch (error) {
    console.error("Error awarding points:", error)
    return { status: 400, message: "Failed to award points" }
  }
}

export const onMarkPostUseful = async (
  postId: string,
  userId: string,
  groupId: string,
) => {
  try {
    // Check if already marked
    const existing = await client.postUseful.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    })

    if (existing) {
      return { status: 400, message: "Already marked as useful" }
    }

    // Get post author
    const post = await client.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!post) {
      return { status: 404, message: "Post not found" }
    }

    // Create useful mark
    await client.postUseful.create({
      data: { postId, userId },
    })

    // Award points to post author
    await onAwardPoints(
      post.authorId,
      groupId,
      "POST_USEFUL_RECEIVED",
      postId,
      "Someone found your post useful",
    )

    // Award points to the user who marked it
    await onAwardPoints(
      userId,
      groupId,
      "POST_USEFUL_GIVEN",
      postId,
      "Marked a post as useful",
    )

    revalidatePath(`/group/${groupId}`)
    return { status: 200, message: "Post marked as useful" }
  } catch (error) {
    console.error("Error marking post useful:", error)
    return { status: 400, message: "Failed to mark post as useful" }
  }
}

export const onUnmarkPostUseful = async (
  postId: string,
  userId: string,
) => {
  try {
    await client.postUseful.delete({
      where: {
        postId_userId: { postId, userId },
      },
    })

    return { status: 200, message: "Removed useful mark" }
  } catch (error) {
    console.error("Error unmarking post useful:", error)
    return { status: 400, message: "Failed to remove useful mark" }
  }
}

export const onGetPostUsefulCount = async (postId: string) => {
  try {
    const count = await client.postUseful.count({
      where: { postId },
    })

    return { status: 200, count }
  } catch (error) {
    return { status: 400, count: 0 }
  }
}

export const onCheckPostUseful = async (postId: string, userId: string) => {
  try {
    const existing = await client.postUseful.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    })

    return { status: 200, isUseful: !!existing }
  } catch (error) {
    return { status: 400, isUseful: false }
  }
}
