"use server"

import { onAuthenticatedUser, onGetUserGroupRole } from "@/actions/auth"
import { client } from "@/lib/prisma"
import { canCreateCourse, hasPermission } from "@/lib/rbac"
const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en"

// Resolve current app userId using existing auth action
const getAuthedUserId = async (): Promise<string | null> => {
  try {
    const me = await onAuthenticatedUser()
    if (me?.status === 200 && me.id) return me.id
    return null
  } catch {
    return null
  }
}

// Fetch user's ongoing courses (progress > 0 and < 100), ordered by recent activity
export const onGetOngoingCourses = async (limit = 3) => {
  try {
    const userId = await getAuthedUserId()
    if (!userId) return { status: 200 as const, courses: [] as any[] }

    // Find progress rows for ongoing courses
    const progresses = await client.userCourseProgress.findMany({
      where: { userId, progress: { gt: 0, lt: 100 } },
      orderBy: [{ updatedAt: "desc" }],
      take: limit,
      select: {
        courseId: true,
        progress: true,
        lastSectionId: true,
        Course: { select: { id: true, name: true, thumbnail: true } },
      },
    })

    if (progresses.length === 0) return { status: 200 as const, courses: [] as any[] }

    // Map minimal payload for the widget; no totals computation needed
    const courses = progresses.map((p) => ({
      courseId: p.courseId,
      name: p.Course?.name ?? "Untitled Course",
      thumbnail: p.Course?.thumbnail ?? null,
      lastSectionId: p.lastSectionId ?? null,
      progress: p.progress ?? 0,
    }))

    return { status: 200 as const, courses }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
}

// Returns the section id to land on for a course for the current user.
// Prefers the user's last interacted section; falls back to the first section of the first module.
export const onGetCourseLandingSection = async (courseId: string) => {
  try {
    const userId = await getAuthedUserId()
    if (userId) {
      const progress = await client.userCourseProgress.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { lastSectionId: true },
      })
      if (progress?.lastSectionId) {
        return { status: 200 as const, sectionId: progress.lastSectionId, source: "last" as const }
      }
    }

    // Fallback: single query to first section ordered by module then section
    const firstSection = await client.section.findFirst({
      where: { Module: { is: { courseId } } },
      orderBy: [{ Module: { order: "asc" } }, { order: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    })
    if (firstSection) {
      return { status: 200 as const, sectionId: firstSection.id, source: "first" as const }
    }

    return { status: 204 as const, message: "No sections available" }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
}


export const onCreateGroupCourse = async (
  groupid: string,
  name: string,
  image: string,
  description: string,
  courseid: string,
  privacy: string,
  published: boolean,
) => {
  try {
    // Check user permissions
    const userRole = await onGetUserGroupRole(groupid)
    
    if (userRole.status !== 200) {
      return { status: 401, message: "Unauthorized: You must be a member of this group" }
    }

    if (!canCreateCourse(userRole.role, userRole.isSuperAdmin)) {
      return { 
        status: 403, 
        message: "Forbidden: You don't have permission to create courses in this group" 
      }
    }

    const course = await client.group.update({
      where: {
        id: groupid,
      },
      data: {
        courses: {
          create: {
            id: courseid,
            name,
            thumbnail: image,
            description,
            privacy,
            published,
          },
        },
      },
    })

    if (course) {
      return { status: 200, message: "Course successfully created" }
    }

    return { status: 404, message: "Group not found" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onDeleteSection = async (groupid: string, sectionId: string) => {
  try {
    // RBAC: section:delete
    const userRole = await onGetUserGroupRole(groupid)
    if (userRole.status !== 200) return { status: 401, message: "Unauthorized" }
    if (!userRole.isSuperAdmin && !hasPermission(userRole.role, "section:delete")) {
      return { status: 403, message: "Forbidden" }
    }
    const deleted = await client.section.delete({
      where: { id: sectionId },
    })
    if (deleted) return { status: 200, message: "Section deleted" }
    return { status: 404, message: "Section not found" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onDeleteModule = async (groupid: string, moduleId: string) => {
  try {
    // RBAC: module:delete
    const userRole = await onGetUserGroupRole(groupid)
    if (userRole.status !== 200) return { status: 401, message: "Unauthorized" }
    if (!userRole.isSuperAdmin && !hasPermission(userRole.role, "module:delete")) {
      return { status: 403, message: "Forbidden" }
    }
    const deleted = await client.module.delete({
      where: { id: moduleId },
    })
    // Section rows are set to cascade on module deletion in Prisma schema
    if (deleted) return { status: 200, message: "Module deleted" }
    return { status: 404, message: "Module not found" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

// Persist module ordering within a course
export const onReorderModules = async (
  groupid: string,
  courseId: string,
  orderedIds: string[],
) => {
  try {
    // RBAC: module:edit
    const userRole = await onGetUserGroupRole(groupid)
    if (userRole.status !== 200) return { status: 401, message: "Unauthorized" }
    if (!userRole.isSuperAdmin && !hasPermission(userRole.role, "module:edit")) {
      return { status: 403, message: "Forbidden" }
    }
    await client.$transaction(
      orderedIds.map((id, index) =>
        client.module.update({ where: { id }, data: { order: index } }),
      ),
    )
    return { status: 200, message: "Modules reordered" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

// Persist section ordering within a module
export const onReorderSections = async (
  groupid: string,
  moduleId: string,
  orderedIds: string[],
) => {
  try {
    // RBAC: section:edit
    const userRole = await onGetUserGroupRole(groupid)
    if (userRole.status !== 200) return { status: 401, message: "Unauthorized" }
    if (!userRole.isSuperAdmin && !hasPermission(userRole.role, "section:edit")) {
      return { status: 403, message: "Forbidden" }
    }
    await client.$transaction(
      orderedIds.map((id, index) =>
        client.section.update({ where: { id }, data: { order: index } }),
      ),
    )
    return { status: 200, message: "Sections reordered" }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onGetGroupCourses = async (groupid: string) => {
  try {
    const courses = await client.course.findMany({
      where: {
        groupId: groupid,
      },
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
    })

    if (courses && courses.length > 0) {
      return { status: 200, courses }
    }

    return {
      status: 404,
      message: "No courses found",
    }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onGetCourseModules = async (courseId: string) => {
  try {
    const [modules, userId] = await Promise.all([
      client.module.findMany({
        where: { courseId },
        orderBy: [{ order: "asc" }],
        select: {
          id: true,
          title: true,
          order: true,
          createdAt: true,
          section: {
            orderBy: [{ order: "asc" }],
            select: {
              id: true,
              name: true,
              icon: true,
              order: true,
              createdAt: true,
              moduleId: true,
            },
          },
        },
      }),
      getAuthedUserId(),
    ])

    if (!modules || modules.length === 0) {
      return { status: 404, message: "No modules found" }
    }

    if (!userId) {
      // Anonymous view: return as-is without completion flags
      return { status: 200, modules }
    }

    // Fetch user's progress for this course
    const progress = await client.userCourseProgress.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { completedSections: true },
    })
    const completed = new Set(progress?.completedSections ?? [])

    // Attach computed `complete` flag per section (non-persistent)
    const mapped = modules.map((m: any) => ({
      ...m,
      section: m.section.map((s: any) => ({ ...s, complete: completed.has(s.id) })),
    }))

    return { status: 200, modules: mapped }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onCreateCourseModule = async (
  groupid: string,
  courseId: string,
  name: string,
  moduleId: string,
) => {
  try {
    // RBAC: module:create (by course's group)
    const userRole = await onGetUserGroupRole(groupid)
    if (userRole.status !== 200) return { status: 401, message: "Unauthorized" }
    if (!userRole.isSuperAdmin && !hasPermission(userRole.role, "module:create")) {
      return { status: 403, message: "Forbidden" }
    }
    const count = await client.module.count({ where: { courseId } })
    const courseModule = await client.course.update({
      where: {
        id: courseId,
      },
      data: {
        modules: {
          create: {
            title: name,
            id: moduleId,
            order: count,
          },
        },
      },
    })

    if (courseModule) {
      return { status: 200, message: "Module successfully created" }
    }

    return {
      status: 404,
      message: "No modules found",
    }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onUpdateModule = async (
  groupid: string,
  moduleId: string,
  type: "NAME" | "DATA",
  content: string,
) => {
  try {
    // RBAC: module:edit
    const userRole = await onGetUserGroupRole(groupid)
    if (userRole.status !== 200) return { status: 401, message: "Unauthorized" }
    if (!userRole.isSuperAdmin && !hasPermission(userRole.role, "module:edit")) {
      return { status: 403, message: "Forbidden" }
    }
    if (type === "NAME") {
      const title = await client.module.update({
        where: {
          id: moduleId,
        },
        data: {
          title: content,
        },
      })
      if (title) {
        return { status: 200, message: "Module successfully updated" }
      }
      return { status: 404, message: "No modules found" }
    }
    // const module = await client.module.update({
    //     where: {
    //         id: moduleId,
    //     },
    //     data: {
    //         title: type === "NAME" ? content : undefined,
    //         description: type === "DATA" ? content : undefined,
    //     },
    // })
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onUpdateSection = async (
  groupid: string,
  sectionId: string,
  type: "NAME" | "COMPLETE" | "ICON",
  content: string,
) => {
  try {
    if (type === "NAME") {
      // RBAC: section:edit
      const userRole = await onGetUserGroupRole(groupid)
      if (userRole.status !== 200) return { status: 401, message: "Unauthorized" }
      if (!userRole.isSuperAdmin && !hasPermission(userRole.role, "section:edit")) {
        return { status: 403, message: "Forbidden" }
      }
      const title = await client.section.update({
        where: {
          id: sectionId,
        },
        data: {
          name: content,
        },
      })
      if (title) {
        return { status: 200, message: "Section successfully updated" }
      }
      return { status: 404, message: "No sections found" }
    }
    if (type === "ICON") {
      // RBAC: section:edit
      const userRole = await onGetUserGroupRole(groupid)
      if (userRole.status !== 200) return { status: 401, message: "Unauthorized" }
      if (!userRole.isSuperAdmin && !hasPermission(userRole.role, "section:edit")) {
        return { status: 403, message: "Forbidden" }
      }
      const updated = await client.section.update({
        where: {
          id: sectionId,
        },
        data: {
          icon: content,
        },
      })
      if (updated) {
        return { status: 200, message: "Section icon updated" }
      }
      return { status: 404, message: "No sections found" }
    }
    if (type === "COMPLETE") {
      const userId = await getAuthedUserId()
      if (!userId) return { status: 401, message: "Unauthorized" }

      // Resolve courseId and moduleId for the section
      const section = await client.section.findUnique({
        where: { id: sectionId },
        include: { Module: { select: { id: true, courseId: true } } },
      })
      if (!section || !section.Module?.courseId) return { status: 404, message: "No sections found" }
      const courseId = section.Module.courseId
      const moduleId = section.Module.id

      // Read existing progress
      const existing = await client.userCourseProgress.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { completedSections: true },
      })

      const prev = new Set(existing?.completedSections ?? [])
      prev.add(sectionId)
      const completedSections = Array.from(prev)

      // Total sections in course to compute %
      const totalSections = await client.section.count({ where: { Module: { is: { courseId } } } })
      const progressPct = totalSections > 0 ? (completedSections.length / totalSections) * 100 : 0

      await client.userCourseProgress.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: {
          userId,
          courseId,
          lastModuleId: moduleId,
          lastSectionId: sectionId,
          completedSections,
          progress: progressPct,
        },
        update: {
          lastModuleId: moduleId,
          lastSectionId: sectionId,
          completedSections: { set: completedSections },
          progress: progressPct,
        },
      })

      return { status: 200, message: "Section successfully updated" }
    }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onCreateModuleSection = async (
  groupid: string,
  moduleid: string,
  sectionid: string,
  name?: string,
  icon?: string,
) => {
  try {
    // RBAC: section:create (by module's group)
    const userRole = await onGetUserGroupRole(groupid)
    if (userRole.status !== 200) return { status: 401, message: "Unauthorized" }
    if (!userRole.isSuperAdmin && !hasPermission(userRole.role, "section:create")) {
      return { status: 403, message: "Forbidden" }
    }
    const count = await client.section.count({ where: { moduleId: moduleid } })
    const section = await client.module.update({
      where: {
        id: moduleid,
      },
      data: {
        section: {
          create: {
            id: sectionid,
            ...(name ? { name } : {}),
            ...(icon ? { icon } : {}),
            order: count,
          },
        },
      },
    })
    if (section) {
      return { status: 200, message: "New section created" }
    }
    return { status: 404, message: "No sections found" }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}

export const onGetSectionInfo = async (sectionid: string, locale?: string) => {
  try {
    const userId = await getAuthedUserId()
    const section = await client.section.findUnique({
      where: { id: sectionid },
      include: { Module: { select: { id: true, courseId: true } } },
    })
    if (!section) return { status: 404, message: "No sections found" }

    let completed = false
    if (userId && section.Module?.courseId) {
      const courseId = section.Module.courseId
      const progress = await client.userCourseProgress.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { completedSections: true },
      })
      completed = !!progress?.completedSections?.includes(sectionid)

      // Update last interacted section/module
      await client.userCourseProgress.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: {
          userId,
          courseId,
          lastModuleId: section.Module.id,
          lastSectionId: sectionid,
          completedSections: [],
          progress: 0,
        },
        update: { lastModuleId: section.Module.id, lastSectionId: sectionid },
      })
    }

    if (locale && locale !== DEFAULT_LOCALE) {
      const translation = await client.sectionTranslation.findUnique({
        where: { sectionId_locale: { sectionId: sectionid, locale } },
      })
      const effective = {
        ...section,
        name: translation?.name ?? section.name,
        htmlContent: translation?.contentHtml ?? section.htmlContent ?? undefined,
        jsonContent:
          translation?.contentJson !== undefined && translation?.contentJson !== null
            ? JSON.stringify(translation.contentJson)
            : section.jsonContent ?? undefined,
        content: translation?.contentText ?? section.content ?? undefined,
        complete: completed,
      }
      return { status: 200, section: effective }
    }

    return { status: 200, section: { ...section, complete: completed } }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
}

export const onUpdateCourseSectionContent = async (
  groupid: string,
  sectionid: string,
  html: string,
  json: string,
  content: string,
  locale?: string,
) => {
  try {
    // RBAC: section:edit
    const userRole = await onGetUserGroupRole(groupid)
    if (userRole.status !== 200) return { status: 401, message: "Unauthorized" }
    if (!userRole.isSuperAdmin && !hasPermission(userRole.role, "section:edit")) {
      return { status: 403, message: "Forbidden" }
    }
    if (locale && locale !== DEFAULT_LOCALE) {
      let parsed: any = null
      try {
        parsed = json ? JSON.parse(json) : null
      } catch (_) {
        parsed = null
      }
      const translation = await client.sectionTranslation.upsert({
        where: { sectionId_locale: { sectionId: sectionid, locale } },
        create: {
          sectionId: sectionid,
          locale,
          contentHtml: html,
          contentJson: parsed,
          contentText: content,
        },
        update: {
          contentHtml: html,
          contentJson: parsed,
          contentText: content,
        },
      })
      if (translation) {
        return { status: 200, message: "Section translation successfully updated" }
      }
      return { status: 404, message: "No sections found" }
    }
    const section = await client.section.update({
      where: {
        id: sectionid,
      },
      data: {
        htmlContent: html,
        jsonContent: json,
        content,
      },
    })
    if (section) {
      return { status: 200, message: "Section successfully updated" }
    }
    return { status: 404, message: "No sections found" }
  } catch (error) {
    return {
      status: 400,
      message: "Oops! something went wrong",
    }
  }
}
