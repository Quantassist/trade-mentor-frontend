/**
 * Data Access Layer - Auth
 * Pure data fetching functions that can be used by API routes and Server Components
 */

import { client } from "@/lib/prisma"
import { cache } from "react"

export const getUserById = cache(async (userId: string) => {
  try {
    const user = await client.appUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        image: true,
        isSuperAdmin: true,
      },
    })

    if (!user) {
      return { status: 404, message: "User not found" }
    }

    return { status: 200, user }
  } catch (error) {
    console.error("Error fetching user:", error)
    return { status: 400, message: "Failed to fetch user" }
  }
})

export const getUserGroupRole = cache(async (groupId: string, userId: string) => {
  try {
    const user = await client.appUser.findUnique({
      where: { id: userId },
      select: { isSuperAdmin: true },
    })

    const group = await client.group.findUnique({
      where: { id: groupId },
      select: { userId: true },
    })

    const membership = await client.members.findFirst({
      where: { userId, groupId },
      select: { role: true },
    })

    const isOwner = group?.userId === userId
    const isSuperAdmin = user?.isSuperAdmin ?? false
    const role = membership?.role ?? (isOwner ? "OWNER" : undefined)

    return {
      status: 200,
      role,
      isSuperAdmin,
      isOwner,
    }
  } catch (error) {
    console.error("Error fetching user group role:", error)
    return { status: 400, message: "Failed to fetch role" }
  }
})
