/**
 * Data Access Layer - Channels
 * Pure data fetching functions that can be used by API routes and Server Components
 */

import { defaultLocale } from "@/i18n/config"
import { isUUID } from "@/lib/id-utils"
import { client } from "@/lib/prisma"
import { cache } from "react"

export const getGroupChannels = cache(async (groupId: string) => {
  try {
    const channels = await client.channel.findMany({
      where: { groupId },
      orderBy: { createdAt: "asc" },
    })

    return { status: 200, channels }
  } catch (error) {
    console.error("Error fetching group channels:", error)
    return { status: 400, message: "Failed to fetch channels" }
  }
})

/**
 * Get channel info by ID or slug
 * For slug lookup, groupId is required to scope the search
 */
export const getChannelInfo = cache(async (
  channelIdOrSlug: string, 
  locale?: string, 
  userId?: string,
  groupIdOrSlug?: string
) => {
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

    // Build the include object for posts
    const postsInclude = {
      posts: {
        orderBy: { createdAt: "desc" as const },
        select: {
          id: true,
          publicId: true,
          authorId: true,
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
            select: { id: true, name: true, slug: true },
          },
          author: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              image: true,
            },
          },
          claps: {
            select: { id: true, userId: true, count: true },
          },
          _count: {
            select: { claps: true, comments: true },
          },
        },
      },
    }

    // Support both UUID and slug lookups
    let channel
    if (isUUID(channelIdOrSlug)) {
      channel = await client.channel.findUnique({
        where: { id: channelIdOrSlug },
        include: postsInclude,
      })
    } else {
      // Slug lookup - use resolved groupId if provided for scoping, otherwise search globally
      channel = await client.channel.findFirst({
        where: resolvedGroupId 
          ? { slug: channelIdOrSlug, groupId: resolvedGroupId }
          : { slug: channelIdOrSlug },
        include: postsInclude,
      })
    }

    if (!channel) {
      return null
    }

    // Map translations if locale is provided
    if (locale && locale !== defaultLocale) {
      const mapped = channel.posts.map((p: any) => {
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
        return p
      })
      return { ...channel, posts: mapped }
    }

    return channel
  } catch (error: any) {
    const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error))
    console.error("Error fetching channel info:", errorMessage)
    return { status: 400, message: "Failed to fetch channel" }
  }
})

/**
 * Get post with all locale translations
 * Supports both UUID and publicId lookups
 */
export const getPostAllLocales = cache(async (postIdOrPublicId: string) => {
  try {
    // Support both UUID and publicId lookups
    const post = isUUID(postIdOrPublicId)
      ? await client.post.findUnique({ where: { id: postIdOrPublicId } })
      : await client.post.findFirst({ where: { publicId: postIdOrPublicId } })
    
    if (!post) {
      return { status: 404, message: "Post not found" }
    }

    // Fetch with full includes
    const fullPost = await client.post.findUnique({
      where: { id: post.id },
      include: {
        translations: true,
        author: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            image: true,
          },
        },
      },
    })

    if (!fullPost) {
      return { status: 404, message: "Post not found" }
    }

    // Build translations map
    const translations: Record<string, any> = {}
    for (const t of (fullPost as any).translations || []) {
      translations[t.locale] = {
        title: t.title,
        html: t.contentHtml,
        json: t.contentJson ? JSON.stringify(t.contentJson) : null,
        content: t.content,
      }
    }

    return {
      status: 200,
      post: {
        id: fullPost.id,
        publicId: fullPost.publicId,
        title: fullPost.title,
        htmlContent: fullPost.htmlContent,
        jsonContent: fullPost.jsonContent,
        content: fullPost.content,
        author: fullPost.author,
        translations,
      },
    }
  } catch (error) {
    console.error("Error fetching post all locales:", error)
    return { status: 400, message: "Failed to fetch post" }
  }
})

export const getPostClaps = cache(async (postId: string) => {
  try {
    const claps = await client.clap.findMany({
      where: { postId },
      select: { id: true, userId: true, count: true },
    })

    const total = claps.reduce((sum, c) => sum + (c.count || 0), 0)

    return { status: 200, claps, total }
  } catch (error) {
    console.error("Error fetching post claps:", error)
    return { status: 400, message: "Failed to fetch claps" }
  }
})

export const getCommentClaps = cache(async (commentId: string) => {
  try {
    const claps = await client.clap.findMany({
      where: { commentId },
      select: { id: true, userId: true, count: true },
    })

    const total = claps.reduce((sum: number, c: { count: number }) => sum + (c.count || 0), 0)

    return { status: 200, claps, total }
  } catch (error) {
    console.error("Error fetching comment claps:", error)
    return { status: 400, message: "Failed to fetch claps" }
  }
})
