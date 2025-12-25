/**
 * Data Access Layer - Groups
 * Pure data fetching functions that can be used by API routes and Server Components
 */

import { defaultLocale } from "@/i18n/config"
import { isUUID } from "@/lib/id-utils"
import { client } from "@/lib/prisma"
import { cache } from "react"

/**
 * Get group info by ID or slug
 * Supports both UUID lookup (legacy) and slug lookup (new)
 */
export const getGroupInfo = cache(async (groupIdOrSlug: string, locale?: string, userId?: string) => {
  try {
    // Support both UUID and slug lookups
    const group = await client.group.findFirst({
      where: isUUID(groupIdOrSlug) 
        ? { id: groupIdOrSlug } 
        : { slug: groupIdOrSlug },
    })

    if (!group) {
      return { status: 404, message: "Group not found" }
    }

    // Get user role if userId provided
    let role: string | undefined
    let isSuperAdmin = false
    let isOwner = false

    // Use resolved group.id for all subsequent queries
    const groupId = group.id

    if (userId) {
      const user = await client.appUser.findUnique({
        where: { id: userId },
        select: { isSuperAdmin: true },
      })
      isSuperAdmin = user?.isSuperAdmin ?? false
      isOwner = group.userId === userId

      // If user is group owner, they have OWNER role (same logic as onGetUserGroupRole)
      if (isOwner) {
        role = "OWNER"
      } else {
        // Check membership role
        const membership = await client.members.findFirst({
          where: { userId, groupId },
          select: { role: true },
        })
        role = membership?.role ?? undefined
      }
    }

    // Handle translations
    if (locale && locale !== defaultLocale) {
      const translation = await client.groupTranslation.findUnique({
        where: { groupId_locale: { groupId, locale } },
      })
      const effective = {
        ...group,
        name: translation?.name ?? group.name,
        htmlDescription: translation?.descriptionHtml ?? group.htmlDescription ?? undefined,
        jsonDescription:
          translation?.descriptionJson !== undefined && translation?.descriptionJson !== null
            ? JSON.stringify(translation.descriptionJson)
            : group.jsonDescription ?? undefined,
      }
      return {
        status: 200,
        group: effective,
        groupOwner: isOwner,
        isSuperAdmin,
        role,
      }
    }

    return {
      status: 200,
      group,
      groupOwner: isOwner,
      isSuperAdmin,
      role,
    }
  } catch (error) {
    console.error("Error fetching group info:", error)
    return { status: 400, message: "Failed to fetch group info" }
  }
})

export const getExploreGroups = cache(async (category: string, paginate: number = 0) => {
  try {
    const groups = await client.group.findMany({
      where: {
        category,
        NOT: {
          description: null,
          thumbnail: null,
        },
      },
      take: 6,
      skip: paginate,
    })

    if (groups && groups.length > 0) {
      return { status: 200, groups }
    }

    return { status: 404, message: "No groups found for this category" }
  } catch (error) {
    console.error("Error fetching explore groups:", error)
    return { status: 400, message: "Failed to fetch groups" }
  }
})

export const searchGroups = cache(async (mode: "GROUPS" | "POSTS", query: string, paginate: number = 0) => {
  try {
    if (mode === "GROUPS") {
      const groups = await client.group.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 6,
        skip: paginate,
      })

      if (groups && groups.length > 0) {
        return { status: 200, groups }
      }
      return { status: 404, message: "No groups found" }
    }
    return { status: 400, message: "Invalid mode" }
  } catch (error) {
    console.error("Error searching groups:", error)
    return { status: 400, message: "Failed to search groups" }
  }
})

export const getUserGroups = cache(async (userId: string) => {
  try {
    const groups = await client.appUser.findUnique({
      where: { id: userId },
      select: {
        group: {
          select: {
            id: true,
            slug: true,
            name: true,
            icon: true,
            channel: {
              where: { name: "general" },
              select: { id: true, slug: true },
            },
          },
        },
        membership: {
          select: {
            Group: {
              select: {
                id: true,
                slug: true,
                icon: true,
                name: true,
                channel: {
                  where: { name: "general" },
                  select: { id: true, slug: true },
                },
              },
            },
          },
        },
      },
    })

    if (groups && (groups.group.length > 0 || groups.membership.length > 0)) {
      return { status: 200, groups: groups.group, members: groups.membership }
    }

    return { status: 404, message: "No groups found" }
  } catch (error) {
    console.error("Error fetching user groups:", error)
    return { status: 400, message: "Failed to fetch user groups" }
  }
})

export const getGroupSubscription = cache(async (groupId: string) => {
  try {
    const subscription = await client.subscription.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
    })

    const count = await client.members.count({
      where: { groupId },
    })

    if (subscription.length > 0) {
      return { status: 200, subscription, count }
    }

    return { status: 404, message: "No subscription found for this group" }
  } catch (error) {
    console.error("Error fetching group subscription:", error)
    return { status: 400, message: "Failed to fetch subscription" }
  }
})

export const getGroupSubscriptions = cache(async (groupId: string) => {
  try {
    const subscriptions = await client.subscription.findMany({
      where: { groupId },
      include: {
        Group: {
          select: { member: true },
        },
      },
    })

    const subscriptionsWithMemberCount = subscriptions.map((sub) => ({
      ...sub,
      memberCount: sub.Group?.member?.length ?? 0,
    }))

    if (subscriptions.length > 0) {
      return {
        status: 200,
        subscriptions: subscriptionsWithMemberCount,
        count: subscriptions.length,
      }
    }
    return { status: 404, message: "No subscriptions found" }
  } catch (error) {
    console.error("Error fetching group subscriptions:", error)
    return { status: 400, message: "Failed to fetch subscriptions" }
  }
})

export const getAllGroupMembers = cache(async (groupId: string, excludeUserId?: string) => {
  try {
    const members = await client.members.findMany({
      where: {
        groupId,
        ...(excludeUserId ? { NOT: { userId: excludeUserId } } : {}),
      },
      include: { User: true },
    })

    if (members && members.length > 0) {
      return { status: 200, members }
    }

    return { status: 404, message: "No members found for this group" }
  } catch (error) {
    console.error("Error fetching group members:", error)
    return { status: 400, message: "Failed to fetch members" }
  }
})

export const getGroupMentors = cache(async (groupId: string) => {
  try {
    const members = await client.members.findMany({
      where: { groupId, role: { in: ["OWNER", "ADMIN", "INSTRUCTOR"] as any } },
      select: {
        User: { select: { id: true, firstname: true, lastname: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    const mentors = members
      .map((m) => m.User)
      .filter(Boolean)
      .map((u) => ({ id: u!.id, name: `${u!.firstname} ${u!.lastname}`, image: u!.image ?? null }))

    return { status: 200, mentors }
  } catch (error) {
    console.error("Error fetching group mentors:", error)
    return { status: 400, message: "Failed to fetch mentors" }
  }
})

export const getDomainConfig = cache(async (groupId: string) => {
  try {
    const domain = await client.group.findUnique({
      where: { id: groupId },
      select: { domain: true },
    })

    if (domain && domain.domain) {
      // Note: The actual Vercel API call should be done in the API route
      // This just returns the domain from the database
      return { status: 200, domain: domain.domain }
    }

    return { status: 404, message: "No domain found" }
  } catch (error) {
    console.error("Error fetching domain config:", error)
    return { status: 400, message: "Failed to fetch domain config" }
  }
})

export const getAffiliateInfo = cache(async (affiliateId: string) => {
  try {
    const affiliateInfo = await client.affiliate.findUnique({
      where: { id: affiliateId },
      select: {
        group: {
          select: {
            User: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                stripeId: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (affiliateInfo) {
      return { status: 200, user: affiliateInfo }
    }

    return { status: 404, message: "No affiliate found for this id" }
  } catch (error) {
    console.error("Error fetching affiliate info:", error)
    return { status: 400, message: "Failed to fetch affiliate info" }
  }
})

export const getAffiliateLink = cache(async (groupId: string) => {
  try {
    const affiliate = await client.affiliate.findUnique({
      where: { groupId },
      select: { id: true },
    })

    return { status: 200, affiliate }
  } catch (error) {
    console.error("Error fetching affiliate link:", error)
    return { status: 400, message: "Failed to fetch affiliate link" }
  }
})

export const verifyAffiliateLink = cache(async (affiliateId: string) => {
  try {
    const link = await client.affiliate.findUnique({
      where: { id: affiliateId },
    })

    if (link) {
      return { status: 200 }
    }

    return { status: 404 }
  } catch (error) {
    return { status: 400 }
  }
})

export const getChannelPosts = cache(async (channelIdOrSlug: string, locale?: string, groupIdOrSlug?: string) => {
  try {
    // Resolve groupId from slug if needed
    let resolvedGroupId: string | undefined = groupIdOrSlug
    if (groupIdOrSlug && !isUUID(groupIdOrSlug)) {
      const group = await client.group.findFirst({
        where: { slug: groupIdOrSlug },
        select: { id: true },
      })
      resolvedGroupId = group?.id
    }

    // Resolve channel ID from slug if needed
    let channelId = channelIdOrSlug
    if (!isUUID(channelIdOrSlug)) {
      const channel = resolvedGroupId
        ? await client.channel.findFirst({
            where: { slug: channelIdOrSlug, groupId: resolvedGroupId },
            select: { id: true },
          })
        : await client.channel.findFirst({
            where: { slug: channelIdOrSlug },
            select: { id: true },
          })
      if (!channel) {
        return { status: 404, message: "Channel not found", posts: [] }
      }
      channelId = channel.id
    }

    const posts = await client.post.findMany({
      where: { channelId },
      select: {
        id: true,
        title: true,
        htmlContent: true,
        jsonContent: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        translations: locale
          ? {
              where: { locale },
              select: { locale: true, title: true, contentHtml: true, contentJson: true },
            }
          : false,
        channel: {
          select: { id: true, name: true },
        },
        author: {
          select: { id: true, firstname: true, lastname: true },
        },
        claps: {
          select: { id: true, userId: true, count: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const mapped = posts.map((p: any) => {
      if (locale && locale !== defaultLocale) {
        const t = Array.isArray(p.translations) ? p.translations[0] : undefined
        if (t) {
          return {
            ...p,
            title: t.title ?? p.title,
            htmlContent: t.contentHtml ?? p.htmlContent,
            jsonContent:
              typeof t.contentJson !== "undefined" && t.contentJson !== null
                ? JSON.stringify(t.contentJson)
                : p.jsonContent,
          }
        }
      }
      return p
    })

    return { status: 200, posts: mapped }
  } catch (error) {
    console.error("Error fetching channel posts:", error)
    return { status: 500, message: "Internal server error" }
  }
})

/**
 * Get post info by ID or publicId (NanoID)
 * Supports both UUID lookup (legacy) and publicId lookup (new)
 */
export const getPostInfo = cache(async (postIdOrPublicId: string, locale?: string) => {
  try {
    const postInclude = {
      translations: locale
        ? {
            where: { locale },
            select: {
              locale: true,
              title: true,
              contentHtml: true,
              contentJson: true,
            },
          }
        : false,
      channel: {
        select: { name: true },
      },
      author: {
        select: {
          firstname: true,
          lastname: true,
          image: true,
        },
      },
      _count: {
        select: { comments: true },
      },
      claps: {
        select: { userId: true, id: true, count: true },
      },
      comments: true,
    }

    // Support both UUID and publicId lookups
    const post = isUUID(postIdOrPublicId)
      ? await client.post.findUnique({
          where: { id: postIdOrPublicId },
          include: postInclude,
        })
      : await client.post.findFirst({
          where: { publicId: postIdOrPublicId },
          include: postInclude,
        })

    if (!post) {
      return { status: 404, message: "Post not found" }
    }

    if (locale && locale !== defaultLocale) {
      const t = Array.isArray((post as any).translations)
        ? (post as any).translations[0]
        : undefined
      if (t) {
        const mapped = {
          ...post,
          title: t.title ?? post.title,
          htmlContent: t.contentHtml ?? post.htmlContent,
          jsonContent:
            typeof t.contentJson !== "undefined" && t.contentJson !== null
              ? JSON.stringify(t.contentJson)
              : post.jsonContent,
        }
        return { status: 200, post: mapped }
      }
    }

    return { status: 200, post }
  } catch (error) {
    console.error("Error fetching post info:", error)
    return { status: 500, message: "Internal server error" }
  }
})

/**
 * Get post comments by post ID or publicId (NanoID)
 * Supports both UUID lookup (legacy) and publicId lookup (new)
 */
export const getPostComments = cache(async (postIdOrPublicId: string, userId?: string) => {
  try {
    // Resolve post ID from publicId if needed
    let postId = postIdOrPublicId
    if (!isUUID(postIdOrPublicId)) {
      const post = await client.post.findFirst({
        where: { publicId: postIdOrPublicId },
        select: { id: true },
      })
      if (!post) {
        return { status: 404, message: "Post not found", comments: [] }
      }
      postId = post.id
    }

    const comments = await client.comment.findMany({
      where: {
        postId,
        replied: false,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        claps: {
          select: { id: true, count: true, userId: true },
        },
        _count: {
          select: { reply: true },
        },
      },
    })

    return { status: 200, comments: comments || [] }
  } catch (error) {
    console.error("Error fetching post comments:", error)
    return { status: 500, message: "Internal server error" }
  }
})

export const getCommentReplies = cache(async (commentId: string, userId?: string) => {
  try {
    const replies = await client.comment.findUnique({
      where: { id: commentId },
      select: {
        reply: {
          include: {
            user: true,
            claps: {
              select: { id: true, userId: true, count: true },
            },
          },
        },
      },
    })

    if (replies && replies.reply.length > 0) {
      return { status: 200, replies: replies.reply }
    }

    return { status: 404, message: "No replies found" }
  } catch (error) {
    console.error("Error fetching comment replies:", error)
    return { status: 400, message: "Failed to fetch replies" }
  }
})
