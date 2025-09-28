"use server"

import { client } from "@/lib/prisma"
import { onAuthenticatedUser } from "./auth"
import { defaultLocale } from "@/i18n/config"

export const onCreateNewChannel = async (
  groupid: string,
  data: {
    id: string
    name: string
    icon: string
  },
) => {
  try {
    const channel = await client.group.update({
      where: {
        id: groupid,
      },
      data: {
        channel: {
          create: {
            ...data,
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
  channelid: string,
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

    const basePayload =
      payloads.find((p) => p.locale === defaultLocale) ?? payloads[0]

    const post = await client.post.create({
      data: {
        id: postid,
        authorId: user.id!,
        channelId: channelid,
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
      return { status: 200, message: "Post created successfully" }
    }
    return { status: 404, message: "Post not found!" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onGetGroupChannels = async (groupid: string) => {
  try {
    const channels = await client.channel.findMany({
      where: {
        groupId: groupid,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return { status: 200, channels }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

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

export const onGetChannelInfo = async (channelid: string, locale?: string) => {
  try {
    const user = await onAuthenticatedUser()
    const channel = await client.channel.findUnique({
      where: {
        id: channelid,
      },
      include: {
        posts: {
          take: 3,
          orderBy: {
            createdAt: "desc",
          },
          include: {
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
                name: true,
              },
            },
            author: {
              select: {
                firstname: true,
                lastname: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
            likes: {
              where: {
                userId: user.id,
              },
              select: {
                id: true,
                userId: true,
              },
            },
          },
        },
      },
    })
    if (!channel) return channel

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
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

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
    const post = await client.post.create({
      data: {
        id: postid,
        authorId: user.id!,
        channelId: channelid,
        title,
        content,
        htmlContent,
        jsonContent,
      },
    })

    if (post) {
      return { status: 200, message: "Post created successfully" }
    }

    return { status: 404, message: "Post not found!" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onLikeChannelPost = async (postid: string) => {
  try {
    const user = await onAuthenticatedUser()

    // Toggle like based on current user and post
    const existing = await client.like.findFirst({
      where: {
        postId: postid,
        userId: user.id!,
      },
    })

    if (existing) {
      await client.like.delete({
        where: {
          id: existing.id,
        },
      })
      return { status: 200, message: "You unliked this post" }
    }

    await client.like.create({
      data: {
        postId: postid,
        userId: user.id!,
      },
    })
    return { status: 200, message: "You liked this post" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onCreateNewComment = async (
  postid: string,
  content: string,
  commentid: string,
) => {
  try {
    const user = await onAuthenticatedUser()
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
      return { status: 200, message: "Reply created successfully" }
    }

    return { status: 404, message: "Reply not found!" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}
