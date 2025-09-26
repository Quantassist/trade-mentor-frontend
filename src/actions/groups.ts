"use server"

import { CreateGroupSchema } from "@/components/form/create-group/schema"
import { client } from "@/lib/prisma"
import axios from "axios"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"
import { onAuthenticatedUser } from "./auth"
import { defaultLocale } from "@/i18n/config"

export const onGetAffiliateInfo = async (id: string) => {
  try {
    const affiliateInfo = await client.affiliate.findUnique({
      where: {
        id,
      },
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

    return {
      status: 404,
      message: "No affiliate found for this id",
    }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onGetAffiliateLink = async (groupid: string) => {
  try {
    const affiliate = await client.affiliate.findUnique({
      where: {
        groupId: groupid,
      },
      select: {
        id: true,
      },
    })

    return { status: 200, affiliate }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onVerifyAffiliateLink = async (id: string) => {
  try {
    const link = await client.affiliate.findUnique({
      where: {
        id,
      },
    })

    if (link) {
      return { status: 200 }
    }

    return { status: 404 }
  } catch (error) {
    return { status: 400 }
  }
}

export const onGetExploreGroup = async (category: string, paginate: number) => {
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

    return {
      status: 404,
      message: "No groups found for this category",
    }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onCreateNewGroup = async (
  userId: string,
  data: z.infer<typeof CreateGroupSchema>,
) => {
  try {
    const created = await client.user.update({
      where: {
        id: userId,
      },
      data: {
        group: {
          create: {
            ...data,
            affiliate: {
              create: {
                id: uuidv4(),
              },
            },
            member: {
              create: {
                userId,
              },
            },
            channel: {
              create: [
                {
                  id: uuidv4(),
                  name: "general",
                  icon: "general",
                },
                {
                  id: uuidv4(),
                  name: "announcements",
                  icon: "announcement",
                },
              ],
            },
          },
        },
      },
      select: {
        id: true,
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
    })

    if (created) {
      return {
        status: 200,
        data: created,
        message: "Group created successfully",
      }
    }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! group creation failed, try again later",
    }
  }
}

export const onSearchGroups = async (
  mode: "GROUPS" | "POSTS",
  query: string,
  paginate?: number,
) => {
  try {
    if (mode === "GROUPS") {
      const fetchedGroups = await client.group.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 6,
        skip: paginate || 0,
      })

      if (fetchedGroups) {
        if (fetchedGroups.length > 0) {
          return {
            status: 200,
            groups: fetchedGroups,
          }
        }

        return { status: 404 }
      }
    }
    if (mode === "POSTS") {
    }
  } catch (error) {
    return { status: "400", message: "Oops! something went wrong" }
  }
}

export const onGetUserGroups = async (id: string) => {
  try {
    const groups = await client.user.findUnique({
      where: {
        id,
      },
      select: {
        group: {
          select: {
            id: true,
            name: true,
            icon: true,
            channel: {
              where: {
                name: "general",
              },
              select: {
                id: true,
              },
            },
          },
        },
        membership: {
          select: {
            Group: {
              select: {
                id: true,
                icon: true,
                name: true,
                channel: {
                  where: {
                    name: "general",
                  },
                  select: {
                    id: true,
                  },
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

    return {
      status: 404,
    }
  } catch (error) {
    return { status: 400 }
  }
}

export const onGetGroupSubscription = async (groupid: string) => {
  try {
    const subscription = await client.subscription.findMany({
      where: {
        groupId: groupid,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const count = await client.members.count({
      where: {
        groupId: groupid,
      },
    })

    if (subscription.length > 0) {
      return { status: 200, subscription, count }
    }

    return { status: 404, message: "No subscription found for this group" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onUpDateGroupSettings = async (
  groupid: string,
  type:
    | "IMAGE"
    | "ICON"
    | "NAME"
    | "DESCRIPTION"
    | "JSONDESCRIPTION"
    | "HTMLDESCRIPTION",
  content: string,
  path: string,
  locale?: string,
) => {
  try {
    if (type === "IMAGE") {
      await client.group.update({
        where: {
          id: groupid,
        },
        data: {
          thumbnail: content,
        },
      })
    }
    if (type === "ICON") {
      await client.group.update({
        where: {
          id: groupid,
        },
        data: {
          icon: content,
        },
      })
      console.log("uploaded image")
    }
    if (type === "DESCRIPTION") {
      // Only update base field for default locale; no separate translation text column
      if (!locale || locale === defaultLocale) {
        await client.group.update({
          where: { id: groupid },
          data: { description: content },
        })
      } else {
        // No-op for non-default locale; HTML/JSON should carry the translated content
      }
    }
    if (type === "NAME") {
      await client.group.update({
        where: {
          id: groupid,
        },
        data: {
          name: content,
        },
      })
    }
    if (type === "JSONDESCRIPTION") {
      if (locale && locale !== defaultLocale) {
        await client.groupTranslation.upsert({
          where: { groupId_locale: { groupId: groupid, locale } },
          update: {
            descriptionJson: JSON.parse(content),
          },
          create: {
            groupId: groupid,
            locale,
            descriptionJson: JSON.parse(content),
          },
        })
      } else {
        await client.group.update({
          where: { id: groupid },
          data: { jsonDescription: content },
        })
      }
    }
    if (type === "HTMLDESCRIPTION") {
      if (locale && locale !== defaultLocale) {
        await client.groupTranslation.upsert({
          where: { groupId_locale: { groupId: groupid, locale } },
          update: {
            descriptionHtml: content,
          },
          create: {
            groupId: groupid,
            locale,
            descriptionHtml: content,
          },
        })
      } else {
        await client.group.update({
          where: { id: groupid },
          data: { htmlDescription: content },
        })
      }
    }
    revalidatePath(path)
    return { status: 200 }
  } catch (error) {
    console.log(error)
    return { status: 400 }
  }
}

export const onGetGroupInfo = async (groupid: string, locale?: string) => {
  // console.log(groupid)
  try {
    const user = await onAuthenticatedUser()
    const group = await client.group.findUnique({
      where: {
        id: groupid,
      },
      // include: {
      //     channel: true,
      // },
    })

    if (group) {
      if (locale && locale !== defaultLocale) {
        const translation = await client.groupTranslation.findUnique({
          where: { groupId_locale: { groupId: groupid, locale } },
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
          groupOwner: user.id === group.userId ? true : false,
        }
      }
      return {
        status: 200,
        group,
        groupOwner: user.id === group.userId ? true : false,
      }
    }

    return { status: 404 }
  } catch (error) {
    return { status: 400 }
  }
}

export const onUpdateGroupGallery = async (
  groupid: string,
  content: string,
) => {
  try {
    const mediaLimit = await client.group.findUnique({
      where: {
        id: groupid,
      },
      select: {
        gallery: true,
      },
    })

    if (mediaLimit && mediaLimit?.gallery.length < 6) {
      await client.group.update({
        where: {
          id: groupid,
        },
        data: {
          gallery: {
            push: content,
          },
        },
      })
      revalidatePath(`/about/${groupid}`)
      return { status: 200 }
    }

    return {
      status: 400,
      message: "Looks like your gallery has the maximum media allowed",
    }
  } catch (error) {
    return { status: 400, message: "Looks like something went wrong" }
  }
}

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

// export const createNewPost = async (
//     userid: string,
//     content: string,
//     htmlContent: string,
//     channelId: string,
// ) => {
//     try {
//         const newPost = await client.post.create({
//             data: {
//                 content,
//                 htmlContent,

//                 author: {
//                     connect: {
//                         id: userid,
//                     },
//                 },
//                 channel: {
//                     connect: {
//                         id: channelId,
//                     },
//                 },
//             },
//         })

//         if (newPost) {
//             return {
//                 status: 200,
//                 message: "Post created successfully",
//             }
//         }

//         return {
//             status: 404,
//             message: "Post could not be created",
//         }
//     } catch (error) {
//         console.log(error)
//         return {
//             status: 400,
//             message: "Failed to create post",
//         }
//     }
// }

export const inGetChannelPosts = async (channelId: string) => {
  try {
    const posts = await client.post.findMany({
      where: {
        channelId,
      },
      select: {
        id: true,
        htmlContent: true,
        createdAt: true,
        updatedAt: true,
        channel: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (posts.length > 0) {
      return { status: 200, posts }
    } else {
      return { status: 200, message: "No posts found", posts: [] }
    }
  } catch (error) {
    console.error("Error fetching channel posts:", error)
    return { status: 500, message: "Internal server error" }
  }
}

export const onGetPostInfo = async (postid: string) => {
  try {
    const user = await onAuthenticatedUser()
    const post = await client.post.findUnique({
      where: {
        id: postid,
      },
      include: {
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
            userId: user.id!,
          },
          select: {
            userId: true,
            id: true,
          },
        },
        comments: true,
      },
    })

    if (post) {
      return { status: 200, post }
    } else {
      return { status: 404, message: "Post not found" }
    }
  } catch (error) {
    console.error("Error fetching post info:", error)
    return { status: 500, message: "Internal server error" }
  }
}

export const onGetPostComments = async (postid: string) => {
  try {
    const comments = await client.comment.findMany({
      where: {
        postId: postid,
        replied: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        _count: {
          select: {
            reply: true,
          },
        },
      },
    })

    if (comments && comments.length > 0) {
      return { status: 200, comments }
    } else {
      return { status: 200, message: "No comments found", comments: [] }
    }
  } catch (error) {
    console.error("Error fetching post comments:", error)
    return { status: 500, message: "Internal server error" }
  }
}

export const onUpdatePost = async (
  postid: string,
  title: string,
  htmlContent?: string,
  jsonContent?: string,
  content?: string,
) => {
  try {
    const user = await onAuthenticatedUser()
    const post = await client.post.findUnique({
      where: { id: postid },
      select: { authorId: true },
    })
    if (!post) return { status: 404, message: "Post not found" }
    if (post.authorId !== user.id)
      return { status: 403, message: "Not authorized to edit this post" }

    await client.post.update({
      where: { id: postid },
      data: {
        title,
        ...(typeof htmlContent !== "undefined" ? { htmlContent } : {}),
        ...(typeof jsonContent !== "undefined" ? { jsonContent } : {}),
        ...(typeof content !== "undefined" ? { content } : {}),
      },
    })

    return { status: 200, message: "Post updated successfully" }
  } catch (error) {
    console.error("Error updating post:", error)
    return { status: 500, message: "Internal server error" }
  }
}

export const onDeletePost = async (postid: string) => {
  try {
    const user = await onAuthenticatedUser()
    const post = await client.post.findUnique({
      where: { id: postid },
      select: { authorId: true },
    })
    if (!post) return { status: 404, message: "Post not found" }
    if (post.authorId !== user.id)
      return { status: 403, message: "Not authorized to delete this post" }

    await client.post.delete({ where: { id: postid } })
    return { status: 200, message: "Post deleted successfully" }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { status: 500, message: "Internal server error" }
  }
}

export const onLikePress = async (postid: string, userid: string) => {
  try {
    const like = await client.like.findFirst({
      where: {
        postId: postid,
        userId: userid,
      },
    })

    if (like) {
      await client.like.delete({
        where: {
          id: like.id,
        },
      })
      return { status: 200, message: "Like removed" }
    } else {
      await client.like.create({
        data: {
          postId: postid,
          userId: userid,
        },
      })
      return { status: 200, message: "Like added" }
    }
  } catch (error) {
    console.error("Error pressing like:", error)
    return { status: 500, message: "Internal server error" }
  }
}

export const onGetAllGroupMembers = async (groupid: string) => {
  try {
    const user = await onAuthenticatedUser()
    const members = await client.members.findMany({
      where: {
        groupId: groupid,
        NOT: {
          userId: user.id,
        },
      },
      include: {
        User: true,
      },
    })

    if (members && members.length > 0) {
      return { status: 200, members }
    }

    return { status: 404, message: "No members found for this group" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onGetPaginatedPosts = async (
  identifier: string,
  paginate: number,
) => {
  try {
    const user = await onAuthenticatedUser()
    const posts = await client.post.findMany({
      where: {
        channelId: identifier,
      },
      take: 2,
      skip: paginate,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        channel: {
          select: {
            name: true,
          },
        },
        author: {
          select: {
            image: true,
            firstname: true,
            lastname: true,
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
            userId: user.id!,
          },
          select: {
            id: true,
            userId: true,
          },
        },
      },
    })

    if (posts && posts.length > 0) {
      return { status: 200, posts }
    }

    return { status: 404, message: "No posts found for this group" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onJoinGroup = async (groupid: string) => {
  try {
    const user = await onAuthenticatedUser()
    const member = await client.group.update({
      where: {
        id: groupid,
      },
      data: {
        member: {
          create: {
            userId: user.id,
          },
        },
      },
    })
    if (member) {
      return { status: 200 }
    }
    return { status: 404, message: "Oops! something went wrong" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onGetGroupSubscriptions = async (groupid: string) => {
  try {
    const subscriptions = await client.subscription.findMany({
      where: {
        groupId: groupid,
      },
      include: {
        Group: {
          select: {
            member: true,
          },
        },
      },
    })
    const subscriptionsWithMemberCount = subscriptions.map((sub) => ({
      ...sub,
      memberCount: sub.Group?.member?.length ?? 0,
    }))

    if (subscriptions && subscriptions.length > 0) {
      return {
        status: 200,
        subscriptions: subscriptionsWithMemberCount,
        count: subscriptions.length,
      }
    }
    return { status: 404 }
  } catch (error) {
    return { status: 400 }
  }
}

export const onGetUserFromMembership = async (membershipid: string) => {
  try {
    const member = await client.members.findUnique({
      where: {
        id: membershipid,
      },
      select: {
        User: true,
      },
    })

    if (member) {
      return { status: 200, member }
    }
    return { status: 404 }
  } catch (error) {
    return { status: 400 }
  }
}

export const onGetAllUserMessages = async (recieverid: string) => {
  try {
    const messages = await client.message.findMany({
      where: {
        receiverId: recieverid,
      },
      include: {
        sender: true,
      },
    })
    if (messages) {
      return { status: 200, messages }
    }
    return { status: 404 }
  } catch (error) {
    return { status: 400 }
  }
}

export const onGetCommentReplies = async (commentid: string) => {
  try {
    const replies = await client.comment.findUnique({
      where: {
        id: commentid,
      },
      select: {
        reply: {
          include: {
            user: true,
          },
        },
      },
    })
    if (replies && replies.reply.length > 0) {
      return { status: 200, replies: replies.reply }
    }
    return { status: 404, message: "No replies found" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onGetDomainConfig = async (groupid: string) => {
  try {
    const domain = await client.group.findUnique({
      where: {
        id: groupid,
      },
      select: {
        domain: true,
      },
    })

    if (domain && domain.domain) {
      const status = await axios.get(
        `https://api/vercel.com/v10/domains/${domain.domain}/config?teamId=${process.env.VERCEL_TEAM_ID}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      )
      return { status: status.data, domain: domain.domain }
    }

    return { status: 404, message: "No domain found" }
  } catch (error) {
    console.error("Error fetching domain config:", error)
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onAddCustomDomain = async (groupid: string, domain: string) => {
  try {
    const addDomainHttpUrl = `https://api/vercel.com/v10/projects/${process.env.PROJECT_ID_VERCEL}/domains?teamId=${process.env.TEAM_ID_VERCEL}`

    const response = await axios.post(
      addDomainHttpUrl,
      {
        name: domain,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (response) {
      const newDomain = await client.group.update({
        where: {
          id: groupid,
        },
        data: {
          domain: domain,
        },
      })

      if (newDomain) {
        return { status: 200, message: "Domain added successfully" }
      }
    }

    return { status: 404, message: "Oops! something went wrong" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}
