/**
 * Data Access Layer - Channels
 * Pure data fetching functions that can be used by API routes and Server Components
 */

import { defaultLocale } from "@/i18n/config"
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

export const getChannelInfo = cache(async (channelId: string, locale?: string, userId?: string) => {
  try {
    const channel = await client.channel.findUnique({
      where: { id: channelId },
      include: {
        posts: {
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            translations: locale
              ? {
                  where: { locale },
                  select: { locale: true, title: true, contentHtml: true, contentJson: true },
                }
              : false,
            channel: {
              select: { name: true },
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
      },
    })

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
    console.error("Error fetching channel info:", error?.message || error)
    return { status: 400, message: error?.message || "Failed to fetch channel" }
  }
})

export const getPostAllLocales = cache(async (postId: string) => {
  try {
    const post = await client.post.findUnique({
      where: { id: postId },
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

    if (!post) {
      return { status: 404, message: "Post not found" }
    }

    // Build translations map
    const translations: Record<string, any> = {}
    for (const t of (post as any).translations || []) {
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
        id: post.id,
        title: post.title,
        htmlContent: post.htmlContent,
        jsonContent: post.jsonContent,
        content: post.content,
        author: post.author,
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
