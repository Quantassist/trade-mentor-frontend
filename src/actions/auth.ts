"use server"

import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import type { GroupRole } from "@prisma/client"
import { Prisma } from "@prisma/client"

// Internal helpers (not exported) to centralize DB fetch logic
const getCurrentUserBase = async () => {
  const clerk = await currentUser()
  if (!clerk) return null

  return client.user.findUnique({
    where: { clerkId: clerk.id },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      image: true,
      isSuperAdmin: true,
    },
  })
}

const getCurrentUserWithGroup = async (groupId: string) => {
  const clerk = await currentUser()
  if (!clerk) return null

  return client.user.findUnique({
    where: { clerkId: clerk.id },
    select: {
      id: true,
      isSuperAdmin: true,
      group: {
        where: { id: groupId },
        select: { userId: true },
      },
      membership: {
        where: { groupId },
        select: { role: true },
      },
    },
  })
}

export const onSignUpUser = async (data: {
  firstname: string
  lastname: string
  clerkId: string
  image: string | null
  locale?: string | null
}) => {
  try {
    // Sanitize inputs (avoid null/undefined and trim)
    const firstname = (data.firstname ?? "").trim() || "User"
    const lastname = (data.lastname ?? "").trim()
    const clerkId = data.clerkId
    const image = data.image

    // If user already exists, return it (handles double-callbacks)
    const existing = await client.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })
    if (existing) {
      return {
        status: 200,
        message: "User already exists",
        id: existing.id,
      }
    }

    const createdUser = await client.user.create({
      data: {
        firstname,
        lastname,
        clerkId,
        image,
        locale: data.locale ?? "en",
        // subscription: { create: {} },
      },
    })

    if (createdUser) {
      return {
        status: 200,
        message: "User successfully created",
        id: createdUser.id,
      }
    }

    return {
      status: 400,
      message: "User could not be created! Try again",
    }
  } catch (error: any) {
    // Log exact error for debugging
    console.error("onSignUpUser error:", error?.code || error?.name, error?.message)
    // Handle unique constraint race condition (P2002)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      try {
        const user = await client.user.findUnique({
          where: { clerkId: data.clerkId },
          select: { id: true },
        })
        if (user) {
          return {
            status: 200,
            message: "User already exists",
            id: user.id,
          }
        }
      } catch (innerError) {
        console.error("Follow-up lookup after P2002 failed:", innerError)
      }
    }
    return {
      status: 400,
      message: "Oops! something went wrong. Try again",
    }
  }
}

export const onAuthenticatedUser = async () => {
  try {
    const user = await getCurrentUserBase()
    if (!user) return { status: 404 as const }

    return {
      status: 200 as const,
      id: user.id,
      username: `${user.firstname} ${user.lastname}`,
      image: user.image,
      isSuperAdmin: user.isSuperAdmin,
    }
  } catch (error) {
    return { status: 400 as const }
  }
}

export const onSignInUser = async (clerkId: string) => {
  try {
    const loggedInUser = (await client.user.findUnique({
      where: {
        clerkId,
      },
      select: {
        id: true,
        locale: true,
        group: {
          select: {
            id: true,
            channel: {
              select: {
                id: true,
              },
              take: 1,
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    })) as {
      id: string
      locale?: string | null
      group: { id: string; channel: { id: string }[] }[]
    } | null

    if (loggedInUser) {
      if (loggedInUser.group.length > 0) {
        return {
          status: 207,
          id: loggedInUser.id,
          locale: loggedInUser.locale ?? "en",
          groupId: loggedInUser.group[0].id,
          channelId: loggedInUser.group[0].channel[0].id,
        }
      }

      return {
        status: 200,
        message: "User successfully logged in",
        id: loggedInUser.id,
        locale: loggedInUser.locale ?? "en",
      }
    }

    return {
      status: 400,
      message: "User could not be logged in! Try again",
    }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong. Try again",
    }
  }
}

/**
 * Get user's role and permissions in a specific group
 */
export const onGetUserGroupRole = async (
  groupId: string,
): Promise<{
  status: number
  role?: GroupRole
  isSuperAdmin?: boolean
  isOwner?: boolean
  message?: string
}> => {
  try {
    const user = await getCurrentUserWithGroup(groupId)
    if (!user) return { status: 401, message: "Unauthorized" }
    
    // Check if user is the group owner
    const isOwner = user.group.length > 0 && user.group[0].userId === user.id

    // If user is group owner, they have OWNER role
    if (isOwner) {
      return {
        status: 200,
        role: "OWNER" as GroupRole,
        isSuperAdmin: user.isSuperAdmin,
        isOwner: true,
      }
    }

    // Check membership role
    if (user.membership.length > 0) {
      return {
        status: 200,
        role: user.membership[0].role,
        isSuperAdmin: user.isSuperAdmin,
        isOwner: false,
      }
    }

    // User is not a member of this group
    return {
      status: 403,
      message: "User is not a member of this group",
      isSuperAdmin: user.isSuperAdmin,
    }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}
