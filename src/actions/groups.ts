"use server"

import { CreateGroupSchema } from "@/components/form/create-group/schema"
import { defaultLocale } from "@/i18n/config"
import { generateId, isUUID } from "@/lib/id-utils"
import { generateUniqueGroupSlug } from "@/lib/id-utils.server"
import { client } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import axios from "axios"
import { revalidatePath } from "next/cache"
import { cache } from "react"
import { z } from "zod"
import { onAuthenticatedUser, onGetUserGroupRole } from "./auth"

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

// List possible mentors (group members who can be selected as mentors)
export const onGetGroupMentors = async (groupid: string) => {
  try {
    const members = await client.members.findMany({
      where: { groupId: groupid, role: { in: ["OWNER", "ADMIN", "INSTRUCTOR"] as any } },
      select: {
        User: { select: { id: true, firstname: true, lastname: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    const mentors = members
      .map((m) => m.User)
      .filter(Boolean)
      .map((u) => ({ id: u!.id, name: `${u!.firstname} ${u!.lastname}`, image: u!.image ?? null }))

    return { status: 200 as const, mentors }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
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
      include: {
        _count: {
          select: {
            channel: true,
            courses: true,
          },
        },
      },
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
    // Generate slug from group name
    const groupSlug = await generateUniqueGroupSlug(data.name)
    // Generate a temporary group ID to create channel slugs
    const tempGroupId = generateId()
    
    const created = await client.appUser.update({
      where: {
        id: userId,
      },
      data: {
        group: {
          create: {
            ...data,
            slug: groupSlug,
            affiliate: {
              create: {
                id: generateId(),
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
                  id: generateId(),
                  name: "general",
                  icon: "general",
                  slug: "general",
                },
                {
                  id: generateId(),
                  name: "announcements",
                  icon: "announcement",
                  slug: "announcements",
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
            slug: true,
            channel: {
              select: {
                id: true,
                slug: true,
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

export const onGetUserGroups = cache(async (id: string) => {
  try {
    const groups = await client.appUser.findUnique({
      where: {
        id,
      },
      select: {
        group: {
          select: {
            id: true,
            slug: true,
            name: true,
            icon: true,
            channel: {
              where: {
                name: "general",
              },
              select: {
                id: true,
                slug: true,
              },
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
                  where: {
                    name: "general",
                  },
                  select: {
                    id: true,
                    slug: true,
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
})

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
    | "HTMLDESCRIPTION"
    | "PRIVACY",
  content: string,
  path: string,
  locale?: string,
) => {
  try {
    // Resolve group by id or slug
    const group = await client.group.findFirst({
      where: isUUID(groupid) ? { id: groupid } : { slug: groupid },
      select: { id: true },
    })
    
    if (!group) {
      return { status: 404, message: "Group not found" }
    }
    
    const resolvedGroupId = group.id
    
    if (type === "PRIVACY") {
      await client.group.update({
        where: { id: resolvedGroupId },
        data: { privacy: content === "true" ? "PRIVATE" : "PUBLIC" },
      })
    }
    if (type === "IMAGE") {
      await client.group.update({
        where: {
          id: resolvedGroupId,
        },
        data: {
          thumbnail: content,
        },
      })
    }
    if (type === "ICON") {
      await client.group.update({
        where: {
          id: resolvedGroupId,
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
          where: { id: resolvedGroupId },
          data: { description: content },
        })
      } else {
        // No-op for non-default locale; HTML/JSON should carry the translated content
      }
    }
    if (type === "NAME") {
      await client.group.update({
        where: {
          id: resolvedGroupId,
        },
        data: {
          name: content,
        },
      })
    }
    if (type === "JSONDESCRIPTION") {
      if (locale && locale !== defaultLocale) {
        await client.groupTranslation.upsert({
          where: { groupId_locale: { groupId: resolvedGroupId, locale } },
          update: {
            descriptionJson: JSON.parse(content),
          },
          create: {
            groupId: resolvedGroupId,
            locale,
            descriptionJson: JSON.parse(content),
          },
        })
      } else {
        await client.group.update({
          where: { id: resolvedGroupId },
          data: { jsonDescription: content },
        })
      }
    }
    if (type === "HTMLDESCRIPTION") {
      if (locale && locale !== defaultLocale) {
        await client.groupTranslation.upsert({
          where: { groupId_locale: { groupId: resolvedGroupId, locale } },
          update: {
            descriptionHtml: content,
          },
          create: {
            groupId: resolvedGroupId,
            locale,
            descriptionHtml: content,
          },
        })
      } else {
        await client.group.update({
          where: { id: resolvedGroupId },
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

export const onGetGroupInfo = cache(async (groupIdOrSlug: string, locale?: string) => {
  // console.log(groupIdOrSlug)
  try {
    const user = await onAuthenticatedUser()
    
    // Support both UUID and slug lookups
    const group = await client.group.findFirst({
      where: isUUID(groupIdOrSlug)
        ? { id: groupIdOrSlug }
        : { slug: groupIdOrSlug },
    })
    
    if (!group) {
      return { status: 404 }
    }
    
    // Use resolved group.id for role lookup
    const roleInfo = await onGetUserGroupRole(group.id)

    if (locale && locale !== defaultLocale) {
      const translation = await client.groupTranslation.findUnique({
        where: { groupId_locale: { groupId: group.id, locale } },
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
        // RBAC context for UI gating
        isSuperAdmin: roleInfo.isSuperAdmin ?? false,
        role: roleInfo.role,
      }
    }
    
    return {
      status: 200,
      group,
      groupOwner: user.id === group.userId ? true : false,
      // RBAC context for UI gating
      isSuperAdmin: roleInfo.isSuperAdmin ?? false,
      role: roleInfo.role,
    }
  } catch (error) {
    return { status: 400 }
  }
})

export const onUpdateGroupGallery = async (
  groupIdOrSlug: string,
  content: string,
) => {
  try {
    // Resolve group by id or slug
    const group = await client.group.findFirst({
      where: isUUID(groupIdOrSlug) ? { id: groupIdOrSlug } : { slug: groupIdOrSlug },
      select: { id: true, gallery: true },
    })

    if (!group) {
      return { status: 404, message: "Group not found" }
    }

    if (group.gallery.length < 6) {
      await client.group.update({
        where: {
          id: group.id,
        },
        data: {
          gallery: {
            push: content,
          },
        },
      })
      revalidatePath(`/about/${groupIdOrSlug}`)
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

export const onDeleteGroupGalleryItem = async (
  groupIdOrSlug: string,
  mediaUrl: string,
) => {
  try {
    // Resolve group by id or slug
    const group = await client.group.findFirst({
      where: isUUID(groupIdOrSlug) ? { id: groupIdOrSlug } : { slug: groupIdOrSlug },
      select: { id: true, gallery: true },
    })

    if (!group) {
      return { status: 404, message: "Group not found" }
    }

    const updatedGallery = group.gallery.filter((item) => item !== mediaUrl)

    await client.group.update({
      where: {
        id: group.id,
      },
      data: {
        gallery: updatedGallery,
      },
    })

    revalidatePath(`/about/${groupIdOrSlug}`)
    return { status: 200, message: "Gallery item deleted successfully" }
  } catch (error) {
    return { status: 400, message: "Failed to delete gallery item" }
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
    // Generate slug from channel name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'channel'
    
    const channel = await client.group.update({
      where: {
        id: groupid,
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

/**
 * Get channel posts by channel ID or slug
 * For slug lookup, groupId is required to scope the search
 */
export const inGetChannelPosts = cache(async (channelIdOrSlug: string, locale?: string, groupIdOrSlug?: string) => {
  try {
    // Resolve group ID from slug if needed
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
      // Slug lookup - need groupId to scope
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
        return { status: 404, message: "Channel not found" }
      }
      channelId = channel.id
    }

    const posts = await client.post.findMany({
      where: {
        channelId,
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
              select: { locale: true, title: true, contentHtml: true, contentJson: true },
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
        claps: {
          select: {
            id: true,
            userId: true,
            count: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
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

    if (mapped.length > 0) {
      return { status: 200, posts: mapped }
    } else {
      return { status: 200, message: "No posts found", posts: [] }
    }
  } catch (error) {
    console.error("Error fetching channel posts:", error)
    return { status: 500, message: "Internal server error" }
  }
})

/**
 * Get post info by ID or publicId (NanoID)
 * Supports both UUID lookup (legacy) and publicId lookup (new)
 */
export const onGetPostInfo = cache(async (postIdOrPublicId: string, locale?: string) => {
  try {
    const user = await onAuthenticatedUser()
    
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
          comments: true,
        },
      },
      claps: {
        select: {
          userId: true,
          id: true,
          count: true,
        },
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

    if (post) {
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
    } else {
      return { status: 404, message: "Post not found" }
    }
  } catch (error) {
    console.error("Error fetching post info:", error)
    return { status: 500, message: "Internal server error" }
  }
})

/**
 * Get post comments by post ID or publicId (NanoID)
 */
export const onGetPostComments = cache(async (postIdOrPublicId: string, userId?: string) => {
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
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        claps: {
          select: { id: true, count: true, userId: true },
        },
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
})

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

export const onClapPress = async (postid: string, userid: string, clapCount: number) => {
  try {
    const existing = await client.clap.findUnique({
      where: {
        postId_userId: {
          postId: postid,
          userId: userid,
        },
      },
    })

    if (existing) {
      await client.clap.update({
        where: { id: existing.id },
        data: { count: { increment: clapCount } },
      })
    } else {
      await client.clap.create({
        data: {
          postId: postid,
          userId: userid,
          count: clapCount,
        },
      })
    }

    return { status: 200, message: "Clapped!", newClaps: clapCount }
  } catch (error) {
    console.error("Error clapping:", error)
    return { status: 500, message: "Internal server error" }
  }
}

export const onGetAllGroupMembers = cache(async (groupid: string) => {
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
})

export const onGetPaginatedPosts = async (
  identifier: string,
  paginate: number,
  locale?: string,
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
        translations: locale
          ? {
              where: { locale },
              select: { locale: true, title: true, contentHtml: true, contentJson: true },
            }
          : false,
        _count: {
          select: {
            claps: true,
            comments: true,
          },
        },
        claps: {
          where: {
            userId: user.id!,
          },
          select: {
            id: true,
            userId: true,
            count: true,
          },
        },
      },
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

    if (mapped && mapped.length > 0) {
      return { status: 200, posts: mapped }
    }

    return { status: 404, message: "No posts found for this group" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onJoinGroup = async (groupid: string) => {
  try {
    const user = await onAuthenticatedUser()
    if (user.status !== 200) {
      return { status: 401, message: "Unauthorized" }
    }

    const existing = await client.members.findFirst({
      where: { userId: user.id, groupId: groupid },
      select: { id: true },
    })

    if (existing) {
      return { status: 200 }
    }

    await client.members.create({
      data: {
        userId: user.id,
        groupId: groupid,
      },
    })

    return { status: 200 }
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Unique constraint violation (likely due to race): treat as success
      return { status: 200 }
    }
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onGetGroupSubscriptions = cache(async (groupid: string) => {
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
})

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

export const onGetDomainConfig = async (groupIdOrSlug: string) => {
  try {
    // Resolve group by id or slug
    const group = await client.group.findFirst({
      where: isUUID(groupIdOrSlug) ? { id: groupIdOrSlug } : { slug: groupIdOrSlug },
      select: {
        domain: true,
      },
    })

    if (group && group.domain) {
      const status = await axios.get(
        `https://api.vercel.com/v10/domains/${group.domain}/config?teamId=${process.env.VERCEL_TEAM_ID}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      )
      return { status: status.data, domain: group.domain }
    }

    return { status: { misconfigured: false }, domain: null }
  } catch (error) {
    console.error("Error fetching domain config:", error)
    return { status: { misconfigured: false }, domain: null }
  }
}

export const onAddCustomDomain = async (groupIdOrSlug: string, domain: string) => {
  try {
    // Resolve group by id or slug
    const group = await client.group.findFirst({
      where: isUUID(groupIdOrSlug) ? { id: groupIdOrSlug } : { slug: groupIdOrSlug },
      select: { id: true },
    })

    if (!group) {
      return { status: 404, message: "Group not found" }
    }

    const addDomainHttpUrl = `https://api.vercel.com/v10/projects/${process.env.PROJECT_ID_VERCEL}/domains?teamId=${process.env.TEAM_ID_VERCEL}`

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
          id: group.id,
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

export const onSavePost = async (postId: string, groupIdOrSlug: string) => {
  try {
    const user = await onAuthenticatedUser()
    if (!user.id) {
      return { status: 401, message: "Unauthorized" }
    }

    // Resolve group ID from slug if needed
    let groupId = groupIdOrSlug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(groupIdOrSlug)) {
      const group = await client.group.findFirst({
        where: { slug: groupIdOrSlug },
        select: { id: true },
      })
      if (!group) {
        return { status: 404, message: "Group not found" }
      }
      groupId = group.id
    }

    // Check if already saved
    const existing = await client.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    })

    if (existing) {
      return { status: 200, message: "Post already saved", saved: true }
    }

    await client.savedPost.create({
      data: {
        userId: user.id,
        postId,
        groupId,
      },
    })

    return { status: 200, message: "Post saved", saved: true }
  } catch (error) {
    console.error("Error saving post:", error)
    return { status: 500, message: "Failed to save post" }
  }
}

export const onUnsavePost = async (postId: string) => {
  try {
    const user = await onAuthenticatedUser()
    if (!user.id) {
      return { status: 401, message: "Unauthorized" }
    }

    await client.savedPost.delete({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    })

    return { status: 200, message: "Post removed from saved", saved: false }
  } catch (error) {
    console.error("Error unsaving post:", error)
    return { status: 500, message: "Failed to remove post" }
  }
}

export const onCheckPostSaved = async (postId: string) => {
  try {
    const user = await onAuthenticatedUser()
    if (!user.id) {
      return { status: 200, saved: false }
    }

    const existing = await client.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    })

    return { status: 200, saved: !!existing }
  } catch (error) {
    return { status: 200, saved: false }
  }
}

export const onGetSavedPosts = cache(async (groupIdOrSlug: string) => {
  try {
    const user = await onAuthenticatedUser()
    if (!user.id) {
      return { status: 401, message: "Unauthorized", posts: [] }
    }

    // Resolve group ID from slug if needed
    let groupId = groupIdOrSlug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(groupIdOrSlug)) {
      const group = await client.group.findFirst({
        where: { slug: groupIdOrSlug },
        select: { id: true },
      })
      if (!group) {
        return { status: 404, message: "Group not found", posts: [] }
      }
      groupId = group.id
    }

    const savedPosts = await client.savedPost.findMany({
      where: {
        userId: user.id,
        groupId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Post: {
          include: {
            author: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                image: true,
              },
            },
            channel: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            claps: true,
            _count: {
              select: {
                comments: true,
              },
            },
          },
        },
      },
    })

    const posts = savedPosts.map((sp) => ({
      ...sp.Post,
      savedAt: sp.createdAt,
    }))

    return { status: 200, posts }
  } catch (error) {
    console.error("Error fetching saved posts:", error)
    return { status: 500, message: "Failed to fetch saved posts", posts: [] }
  }
})
