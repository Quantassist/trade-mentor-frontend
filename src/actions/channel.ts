"use server"

import { defaultLocale } from "@/i18n/config"
import { generatePublicId, isUUID } from "@/lib/id-utils"
import { generateUniqueChannelSlug } from "@/lib/id-utils.server"
import { client } from "@/lib/prisma"
import { cache } from "react"
import { onAuthenticatedUser } from "./auth"
import { onAwardPoints } from "./leaderboard"

export const onCreateNewChannel = async (
  groupIdOrSlug: string,
  data: {
    id: string
    name: string
    icon: string
  },
) => {
  try {
    // Resolve group ID from slug if needed
    let groupId = groupIdOrSlug
    if (!isUUID(groupIdOrSlug)) {
      const group = await client.group.findFirst({
        where: { slug: groupIdOrSlug },
        select: { id: true },
      })
      if (!group) {
        return { status: 404, message: "Group not found" }
      }
      groupId = group.id
    }

    // Generate slug from channel name
    const slug = await generateUniqueChannelSlug(data.name, groupId)
    
    const channel = await client.group.update({
      where: {
        id: groupId,
      },
      data: {
        channel: {
          create: {
            ...data,
            slug,
          },
        },
      },
      select: {
        channel: true,
      },
    })

    if (channel) {
      return { status: 200, channel: channel.channel }
    }

    return {
      status: 404,
      message: "Channel could not be created",
    }
  } catch (error) {
    console.error("Error creating channel:", error)
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

// Update a post with content for multiple locales in one request.
export const onUpdateChannelPostMulti = async (
  postid: string,
  payloads: Array<{
    locale: string
    title?: string
    content?: string | null
    htmlcontent?: string | null
    jsoncontent?: string | null
  }>,
) => {
  try {
    const user = await onAuthenticatedUser()
    const existing = await client.post.findUnique({ where: { id: postid }, select: { authorId: true, channelId: true } })
    if (!existing) return { status: 404, message: "Post not found" }
    if (existing.authorId !== user.id) return { status: 403, message: "Not authorized to edit this post" }

    const basePayload = payloads.find((p) => p.locale === defaultLocale)
    if (basePayload) {
      await client.post.update({
        where: { id: postid },
        data: {
          ...(typeof basePayload.title !== "undefined" ? { title: basePayload.title ?? "" } : {}),
          ...(typeof basePayload.content !== "undefined" ? { content: (basePayload.content ?? "") as unknown as any } : {}),
          ...(typeof basePayload.htmlcontent !== "undefined" ? { htmlContent: basePayload.htmlcontent ?? "" } : {}),
          ...(typeof basePayload.jsoncontent !== "undefined" ? { jsonContent: basePayload.jsoncontent ?? "" } : {}),
        },
      })
    }

    const others = payloads.filter((p) => p.locale !== defaultLocale)
    if (others.length > 0) {
      await client.$transaction(
        others.map((p) => {
          let parsed: any = null
          try {
            parsed = p.jsoncontent ? JSON.parse(p.jsoncontent) : null
          } catch (_) {
            parsed = null
          }
          return client.postTranslation.upsert({
            where: { postId_locale: { postId: postid, locale: p.locale } },
            create: {
              postId: postid,
              locale: p.locale,
              title: p.title ?? null,
              contentHtml: p.htmlcontent ?? null,
              contentJson: parsed,
            },
            update: {
              title: p.title ?? null,
              contentHtml: p.htmlcontent ?? null,
              contentJson: parsed,
            },
          })
        }),
      )
    }

    return { status: 200, message: "Post updated successfully" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

// Fetch a post with all locale translations. Used for edit modal to preload per-locale data.
export const onGetPostAllLocales = async (postid: string) => {
  try {
    const post = await client.post.findUnique({
      where: { id: postid },
      include: {
        translations: true,
      },
    })
    if (!post) return { status: 404, message: "Post not found" }

    // Shape translations by locale
    const byLocale: Record<string, { title?: string | null; html?: string | null; json?: string | null; content?: string | null }> = {}
    for (const t of post.translations) {
      byLocale[t.locale] = {
        title: t.title ?? null,
        html: t.contentHtml ?? null,
        json: t.contentJson !== undefined && t.contentJson !== null ? JSON.stringify(t.contentJson) : null,
        content: null,
      }
    }

    return {
      status: 200,
      post: {
        id: post.id,
        title: post.title,
        htmlContent: post.htmlContent,
        jsonContent: post.jsonContent,
        content: post.content as unknown as string | null,
        translations: byLocale,
      },
    }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

// Create a post with content for multiple locales in one request.
// The default locale content is stored on the base Post row.
// All non-default locales are saved in PostTranslation with upsert semantics.
export const onCreateChannelPostMulti = async (
  channelIdOrSlug: string,
  postid: string,
  payloads: Array<{
    locale: string
    title?: string
    content?: string | null
    htmlcontent?: string | null
    jsoncontent?: string | null
  }>,
) => {
  try {
    const user = await onAuthenticatedUser()
    
    // Resolve channel ID and get groupId from slug if needed
    let channelId = channelIdOrSlug
    let groupId: string | null = null
    if (!isUUID(channelIdOrSlug)) {
      const channel = await client.channel.findFirst({
        where: { slug: channelIdOrSlug },
        select: { id: true, groupId: true },
      })
      if (!channel) {
        return { status: 404, message: "Channel not found" }
      }
      channelId = channel.id
      groupId = channel.groupId
    } else {
      const channel = await client.channel.findUnique({
        where: { id: channelId },
        select: { groupId: true },
      })
      groupId = channel?.groupId ?? null
    }
    
    // Generate publicId for URL-friendly short ID
    const publicId = generatePublicId()

    const basePayload =
      payloads.find((p) => p.locale === defaultLocale) ?? payloads[0]

    const post = await client.post.create({
      data: {
        id: postid,
        publicId,
        authorId: user.id!,
        channelId: channelId,
        title: basePayload?.title ?? "",
        content: (basePayload?.content ?? "") as unknown as any,
        htmlContent: basePayload?.htmlcontent ?? "",
        jsonContent: basePayload?.jsoncontent ?? "",
      },
    })

    const others = payloads.filter((p) => p.locale !== defaultLocale)
    if (others.length > 0) {
      await client.$transaction(
        others.map((p) => {
          let parsed: any = null
          try {
            parsed = p.jsoncontent ? JSON.parse(p.jsoncontent) : null
          } catch (_) {
            parsed = null
          }
          return client.postTranslation.upsert({
            where: { postId_locale: { postId: postid, locale: p.locale } },
            create: {
              postId: postid,
              locale: p.locale,
              title: p.title ?? null,
              contentHtml: p.htmlcontent ?? null,
              contentJson: parsed,
            },
            update: {
              title: p.title ?? null,
              contentHtml: p.htmlcontent ?? null,
              contentJson: parsed,
            },
          })
        }),
      )
    }

    if (post) {
      // Award points for creating a post
      if (groupId && user.id) {
        onAwardPoints(user.id, groupId, "POST_CREATED", post.id, "Created a post").catch(() => {})
      }
      return { status: 200, message: "Post created successfully" }
    }
    return { status: 404, message: "Post not found!" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

/**
 * Get group channels by group ID or slug
 */
export const onGetGroupChannels = cache(async (groupIdOrSlug: string) => {
  try {
    // Resolve group ID from slug if needed
    let groupId = groupIdOrSlug
    if (!isUUID(groupIdOrSlug)) {
      const group = await client.group.findFirst({
        where: { slug: groupIdOrSlug },
        select: { id: true },
      })
      if (!group) {
        return { status: 404, message: "Group not found", channels: [] }
      }
      groupId = group.id
    }

    const channels = await client.channel.findMany({
      where: {
        groupId,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return { status: 200, channels }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
})

export const onUpdateChannelInfo = async (
  channelid: string,
  name?: string,
  icon?: string,
) => {
  try {
    if (name) {
      // console.log(name, channelid)
      const channel = await client.channel.update({
        where: {
          id: channelid,
        },
        data: {
          name,
        },
      })

      if (channel) {
        return {
          status: 200,
          message: "Channel name successfully updated",
        }
      }
      return {
        status: 404,
        message: "Channel not found! try again later",
      }
    }
    if (icon) {
      const channel = await client.channel.update({
        where: {
          id: channelid,
        },
        data: {
          icon,
        },
      })
      if (channel) {
        return {
          status: 200,
          message: "Channel icon successfully updated",
        }
      }
      return {
        status: 404,
        message: "Channel not found! try again later",
      }
    } else {
      const channel = await client.channel.update({
        where: {
          id: channelid,
        },
        data: {
          icon,
          name,
        },
      })
      if (channel) {
        return {
          status: 200,
          message: "Channel successfully updated",
        }
      }
      return {
        status: 404,
        message: "Channel not found! try again later",
      }
    }
  } catch (error) {
    console.log(error)
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onGetChannelInfo = cache(async (
  channelIdOrSlug: string, 
  locale?: string,
  groupId?: string
) => {
  try {
    const user = await onAuthenticatedUser()
    
    // Support both UUID and slug lookups
    // For slug lookup, groupId is required to scope the search
    const channel = isUUID(channelIdOrSlug)
      ? await client.channel.findUnique({
          where: { id: channelIdOrSlug },
        })
      : groupId
        ? await client.channel.findFirst({
            where: { slug: channelIdOrSlug, groupId },
          })
        : null
    
    if (!channel) return null
    
    // Fetch full channel with posts using resolved channel.id
    const fullChannel = await client.channel.findUnique({
      where: { id: channel.id },
      include: {
        posts: {
          orderBy: {
            createdAt: "desc",
          },
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
                  select: {
                    locale: true,
                    title: true,
                    contentHtml: true,
                    contentJson: true,
                  },
                }
              : false,
            channel: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            author: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                image: true,
              },
            },
            _count: {
              select: {
                claps: true,
                comments: true,
              },
            },
            claps: {
              select: {
                id: true,
                userId: true,
                count: true,
              },
            },
          },
        },
      },
    })
    if (!fullChannel) return null

    if (locale && locale !== defaultLocale) {
      const mapped = fullChannel.posts.map((p: any) => {
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
      return { ...fullChannel, posts: mapped }
    }
    return fullChannel
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
})

export const onDeleteChannel = async (channelId: string) => {
  try {
    const channel = await client.channel.delete({
      where: {
        id: channelId,
      },
    })

    if (channel) {
      return { status: 200, message: "Channel deleted successfully" }
    }

    return { status: 404, message: "Channel not found!" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onCreateChannelPost = async (
  channelid: string,
  title: string,
  content: string,
  htmlContent: string,
  jsonContent: string,
  postid: string,
) => {
  try {
    const user = await onAuthenticatedUser()
    // Generate publicId for URL-friendly short ID
    const publicId = generatePublicId()
    
    const post = await client.post.create({
      data: {
        id: postid,
        publicId,
        authorId: user.id!,
        channelId: channelid,
        title,
        content,
        htmlContent,
        jsonContent,
      },
    })

    if (post) {
      return { status: 200, message: "Post created successfully", publicId }
    }

    return { status: 404, message: "Post not found!" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onClapPost = async (postid: string, clapCount: number) => {
  try {
    const user = await onAuthenticatedUser()

    // Get post author and groupId for awarding points
    const post = await client.post.findUnique({
      where: { id: postid },
      select: { authorId: true, channel: { select: { groupId: true } } },
    })
    const postAuthorId = post?.authorId
    const groupId = post?.channel?.groupId

    // Check if this is the first clap from this user on this post
    const existing = await client.clap.findUnique({
      where: {
        postId_userId: {
          postId: postid,
          userId: user.id!,
        },
      },
    })

    const isFirstClap = !existing

    if (existing) {
      await client.clap.update({
        where: { id: existing.id },
        data: { count: { increment: clapCount } },
      })
    } else {
      await client.clap.create({
        data: {
          postId: postid,
          userId: user.id!,
          count: clapCount,
        },
      })
    }

    // Award points to post author ONLY on first clap from this user (prevents spam)
    // Each unique user clapping = 1 point, regardless of clap count
    if (isFirstClap && groupId && postAuthorId && postAuthorId !== user.id) {
      onAwardPoints(postAuthorId, groupId, "CLAP_RECEIVED", `${postid}_${user.id}`, "Received a clap on post").catch(() => {})
    }

    return { status: 200, message: "Clapped!", newClaps: clapCount }
  } catch (error) {
    console.error("Error clapping post:", error)
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onGetPostClaps = async (postid: string, userId?: string) => {
  try {
    const totalClaps = await client.clap.aggregate({
      where: { postId: postid },
      _sum: { count: true },
    })

    let myClaps = 0
    if (userId) {
      const myClap = await client.clap.findUnique({
        where: {
          postId_userId: {
            postId: postid,
            userId,
          },
        },
        select: { count: true },
      })
      myClaps = myClap?.count ?? 0
    }

    return {
      status: 200,
      totalClaps: totalClaps._sum.count ?? 0,
      myClaps,
    }
  } catch (error) {
    return { status: 400, totalClaps: 0, myClaps: 0 }
  }
}

export const onCreateNewComment = async (
  postid: string,
  content: string,
  commentid: string,
) => {
  try {
    const user = await onAuthenticatedUser()
    
    // Get groupId from post's channel
    const post = await client.post.findUnique({
      where: { id: postid },
      select: { channel: { select: { groupId: true } } },
    })
    const groupId = post?.channel?.groupId
    
    const comment = await client.post.update({
      where: {
        id: postid,
      },
      data: {
        comments: {
          create: {
            id: commentid,
            userId: user.id!,
            content,
          },
        },
      },
    })

    if (comment) {
      // Award points for creating a comment
      if (groupId && user.id) {
        onAwardPoints(user.id, groupId, "COMMENT_CREATED", commentid, "Created a comment").catch(() => {})
      }
      return { status: 200, message: "Comment created successfully" }
    }

    return { status: 404, message: "Comment not found!" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onCreateCommentReply = async (
  postid: string,
  commentid: string,
  comment: string,
  replyid: string,
) => {
  try {
    const user = await onAuthenticatedUser()
    
    // Get groupId from post's channel
    const post = await client.post.findUnique({
      where: { id: postid },
      select: { channel: { select: { groupId: true } } },
    })
    const groupId = post?.channel?.groupId
    
    const reply = await client.comment.update({
      where: {
        id: commentid,
      },
      data: {
        reply: {
          create: {
            content: comment,
            id: replyid,
            userId: user.id!,
            postId: postid,
            replied: true,
          },
        },
      },
    })

    if (reply) {
      // Award points for creating a reply (counts as a comment)
      if (groupId && user.id) {
        onAwardPoints(user.id, groupId, "COMMENT_CREATED", replyid, "Replied to a comment").catch(() => {})
      }
      return { status: 200, message: "Reply created successfully" }
    }

    return { status: 404, message: "Reply not found!" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onClapComment = async (commentId: string, clapCount: number) => {
  try {
    const user = await onAuthenticatedUser()

    // Get comment author and groupId for awarding points
    const comment = await client.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, post: { select: { channel: { select: { groupId: true } } } } },
    })
    const commentAuthorId = comment?.userId
    const groupId = comment?.post?.channel?.groupId

    // Check if this is the first clap from this user on this comment
    const existing = await client.clap.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: user.id!,
        },
      },
    })

    const isFirstClap = !existing

    if (existing) {
      await client.clap.update({
        where: { id: existing.id },
        data: { count: { increment: clapCount } },
      })
    } else {
      await client.clap.create({
        data: {
          commentId,
          userId: user.id!,
          count: clapCount,
        },
      })
    }

    // Award points to comment author ONLY on first clap from this user (prevents spam)
    // Each unique user clapping = 1 point, regardless of clap count
    if (isFirstClap && groupId && commentAuthorId && commentAuthorId !== user.id) {
      onAwardPoints(commentAuthorId, groupId, "COMMENT_CLAP_RECEIVED", `${commentId}_${user.id}`, "Received a clap on comment").catch(() => {})
    }

    return { status: 200, message: "Clapped!", newClaps: clapCount }
  } catch (error) {
    console.error("Error clapping comment:", error)
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onGetCommentClaps = async (commentId: string, userId?: string) => {
  try {
    const totalClaps = await client.clap.aggregate({
      where: { commentId },
      _sum: { count: true },
    })

    let myClaps = 0
    if (userId) {
      const myClap = await client.clap.findUnique({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
        select: { count: true },
      })
      myClaps = myClap?.count ?? 0
    }

    return {
      status: 200,
      totalClaps: totalClaps._sum.count ?? 0,
      myClaps,
    }
  } catch (error) {
    return { status: 400, totalClaps: 0, myClaps: 0 }
  }
}
