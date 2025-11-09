"use server"

import { onAuthenticatedUser, onGetUserGroupRole } from "@/actions/auth"
import { client } from "@/lib/prisma"
import { sectionTypeSchemaMap } from "@/types/section-schemas"

import { canCreateCourse, hasPermission } from "@/lib/rbac"
import { cache } from "react"
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

export const onUpdateInteractiveRunner = async (
  groupid: string,
  sectionid: string,
  code: string,
  meta: { artifact_type?: 'react' | 'html'; allowed_libraries?: string[]; scope_config?: any; version?: number },
) => {
  try {
    const userRole = await onGetUserGroupRole(groupid)
    if (userRole.status !== 200) return { status: 401 as const, message: 'Unauthorized' }
    if (!userRole.isSuperAdmin && !hasPermission(userRole.role, 'section:edit')) {
      return { status: 403 as const, message: 'Forbidden' }
    }

    // Validate allowlisted libraries
    const ALLOWLIST = new Set<string>([
      'lucide-react',
      'dayjs',
      'classnames',
      'clsx',
      'framer-motion',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'recharts',
    ])
    const allowed = Array.isArray(meta?.allowed_libraries) ? meta.allowed_libraries : []
    for (const lib of allowed) {
      if (!ALLOWLIST.has(lib)) {
        return { status: 422 as const, message: `Library not allowed: ${lib}` }
      }
    }

    // Fetch current jsonContent and merge
    const base = await client.section.findUnique({ where: { id: sectionid }, select: { jsonContent: true } })
    let current: any = null
    try {
      current = base?.jsonContent ? (typeof base.jsonContent === 'string' ? JSON.parse(base.jsonContent as any) : base?.jsonContent) : null
    } catch {
      current = null
    }
    const nextJson = {
      ...(current && typeof current === 'object' ? current : {}),
      interactiveRunner: {
        code: code || '',
        meta: {
          artifact_type: meta?.artifact_type ?? 'react',
          allowed_libraries: allowed,
          scope_config: meta?.scope_config ?? {},
          ...(typeof meta?.version === 'number' ? { version: meta.version } : {}),
        },
      },
    }

    await client.section.update({ where: { id: sectionid }, data: { jsonContent: nextJson as any } })
    return { status: 200 as const, message: 'Interactive runner saved' }
  } catch (error) {
    return { status: 400 as const, message: 'Oops! something went wrong' }
  }
}
// Update an existing course and its translations
export const onUpdateCourse = async (
  groupid: string,
  courseId: string,
  payload: {
    name: string
    thumbnail?: string | null
    description: string
    privacy: string
    published: boolean
    level?: string | null
    learnOutcomes?: string[]
    faqs?: { question: string; answer: string }[]
    mentors?: { mentorId: string; role: string; sortOrder: number }[]
    translations?: Array<{
      locale: string
      name?: string
      description?: string
      learnOutcomes?: string[]
      faqs?: { question: string; answer: string }[]
    }>
  },
) => {
  try {
    const userRole = await onGetUserGroupRole(groupid)
    if (userRole.status !== 200) return { status: 401 as const, message: "Unauthorized" }
    if (!hasPermission(userRole.role, "course:edit") && !userRole.isSuperAdmin) {
      return { status: 403 as const, message: "Forbidden" }
    }

    const updated = await client.course.update({
      where: { id: courseId },
      data: {
        name: payload.name,
        description: payload.description,
        privacy: payload.privacy,
        published: payload.published,
        level: payload.level ?? null,
        learnOutcomes: (payload.learnOutcomes as any) ?? undefined,
        faq: (payload.faqs as any) ?? undefined,
        ...(payload.thumbnail !== undefined ? { thumbnail: payload.thumbnail ?? null } : {}),
      } as any,
    })
    if (!updated) return { status: 404 as const, message: "Course not found" }

    // Replace mentors if provided
    if (Array.isArray(payload.mentors)) {
      await client.courseMentor.deleteMany({ where: { courseId } })
      if (payload.mentors.length > 0) {
        await client.courseMentor.createMany({
          data: payload.mentors.map((m) => ({
            courseId,
            mentorId: m.mentorId,
            role: m.role as any,
            sortOrder: m.sortOrder ?? 0,
          })),
          skipDuplicates: true,
        })
      }
    }

    const translations = Array.isArray(payload.translations) ? payload.translations! : []
    for (const t of translations) {
      if (!t?.locale || t.locale === DEFAULT_LOCALE) continue
      await client.courseTranslation.upsert({
        where: { courseId_locale: { courseId, locale: t.locale } },
        update: {
          name: t.name,
          description: (t as any).description ?? undefined,
          learnOutcomes: (t.learnOutcomes as any) ?? undefined,
          faq: (t.faqs as any) ?? undefined,
        },
        create: {
          courseId,
          locale: t.locale,
          name: t.name,
          description: (t as any).description ?? undefined,
          learnOutcomes: (t.learnOutcomes as any) ?? undefined,
          faq: (t.faqs as any) ?? undefined,
        },
      } as any)
    }

    return { status: 200 as const, message: "Course successfully updated" }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
}

// Delete a course (modules/sections cascade by Prisma)
export const onDeleteCourse = async (groupid: string, courseId: string) => {
  try {
    const userRole = await onGetUserGroupRole(groupid)
    if (userRole.status !== 200) return { status: 401 as const, message: "Unauthorized" }
    if (!hasPermission(userRole.role, "course:delete") && !userRole.isSuperAdmin) {
      return { status: 403 as const, message: "Forbidden" }
    }
    await client.course.update({ where: { id: courseId }, data: { isDeleted: true } })
    return { status: 200 as const, message: "Course deleted" }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
}

// Fetch course details + counts for About page
export const onGetCourseAbout = cache(async (courseId: string, locale?: string) => {
  try {
    const course = await client.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        createdAt: true,
        published: true,
        privacy: true,
        level: true,
        learnOutcomes: true,
        faq: true,
        mentors: {
          select: {
            role: true,
            sortOrder: true,
            Mentor: {
              select: {
                displayName: true,
                title: true,
                headshotUrl: true,
                slug: true,
                organization: true,
                bio: true,
                experienceStartYear: true,
                socials: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    })
    if (!course) return { status: 404 as const, message: "Course not found" }

    // Normalize learnOutcomes to string[] so UI can render consistently
    const normalizeLearnOutcomes = (value: any): string[] => {
      if (!Array.isArray(value)) return []
      return (value as any[])
        .map((x) => {
          if (typeof x === "string") return x
          if (x && typeof x === "object" && typeof (x as any).outcome === "string") return (x as any).outcome
          return null
        })
        .filter(Boolean) as string[]
    }
    let learnOutcomes = normalizeLearnOutcomes((course as any).learnOutcomes)

    // Locale overlay similar to onGetSectionInfo
    if (locale && locale !== DEFAULT_LOCALE) {
      const t = await client.courseTranslation.findUnique({
        where: { courseId_locale: { courseId, locale } },
      })
      if (t) {
        (course as any).name = t.name ?? course.name
        ;(course as any).description = (t as any).description ?? course.description
        ;(course as any).faq = (t as any).faq ?? course.faq
        if ((t as any).learnOutcomes != null) {
          learnOutcomes = normalizeLearnOutcomes((t as any).learnOutcomes)
        }
      }
    }

    const [moduleCount, totalLessons] = await Promise.all([
      client.module.count({ where: { courseId } }),
      client.section.count({ where: { Module: { is: { courseId } } } }),
    ])

    return {
      status: 200 as const,
      course: {
        ...course,
        learnOutcomes,
        moduleCount,
        totalLessons,
      },
    }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
})

// Fetch all anchors for a module (SSR-cacheable)
export const onGetModuleAnchors = cache(async (moduleId: string) => {
  try {
    if (!moduleId) return { status: 400 as const, message: "Invalid module id" }
    const anchors = await client.anchor.findMany({
      where: { moduleId },
      select: { id: true, shortLabel: true, title: true, excerpt: true },
      orderBy: { createdAt: "asc" },
    })
    return { status: 200 as const, anchors }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
})

// Fetch user's ongoing courses (progress > 0 and < 100), ordered by recent activity
export const onGetOngoingCourses = cache(async (limit = 3) => {
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
        // keep stored progress but we'll recompute based on latest totals to avoid stale values
        progress: true,
        completedSections: true,
        lastSectionId: true,
        Course: { select: { id: true, name: true, thumbnail: true } },
      },
    })

    if (progresses.length === 0) return { status: 200 as const, courses: [] as any[] }

    // Compute latest total sections per course to ensure progress stays correct
    const totals = await Promise.all(
      progresses.map((p) =>
        client.section.count({ where: { Module: { is: { courseId: p.courseId } } } }),
      ),
    )

    const courses = progresses.map((p, idx) => {
      const completedCount = p.completedSections?.length ?? 0
      const totalCount = totals[idx] ?? 0
      const computedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
      return {
        courseId: p.courseId,
        name: p.Course?.name ?? "Untitled Course",
        thumbnail: p.Course?.thumbnail ?? null,
        lastSectionId: p.lastSectionId ?? null,
        completedCount,
        totalCount,
        // return computed percent to avoid stale stored progress when course structure changes
        progress: computedPercent,
      }
    })

    return { status: 200 as const, courses }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
})

// Returns the section id to land on for a course for the current user.
// Prefers the user's last interacted section; falls back to the first section of the first module.
export const onGetCourseLandingSection = cache(async (courseId: string) => {
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
})


export const onCreateGroupCourse = async (
  groupid: string,
  name: string,
  image: string,
  description: string,
  courseid: string,
  privacy: string,
  published: boolean,
  extras?: {
    level?: string
    learnOutcomes?: string[]
    faqs?: { question: string; answer: string }[]
    mentors?: { mentorId: string; role: string; sortOrder: number }[]
    translations?: Array<{
      locale: string
      name?: string
      description?: string
      learnOutcomes?: string[]
      faqs?: { question: string; answer: string }[]
    }>
  },
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
        message: "Forbidden: You don't have permission to create courses in this group",
      }
    }
    const groupUpdate = await client.group.update({
      where: {
        id: groupid,
      },
      data: {
        courses: {
          create: ({
            id: courseid,
            name,
            thumbnail: image,
            description,
            privacy,
            published,
            // Cast to enum type expected by Prisma (journey_level)
            level: (extras?.level as any) ?? null,
            learnOutcomes: (extras?.learnOutcomes as any) ?? undefined,
            faq: (extras?.faqs as any) ?? undefined,
          }) as any,
        },
      },
    })
    if (!groupUpdate) return { status: 404, message: "Group not found" }

    // Persist translations for non-default locales
    const translations = Array.isArray(extras?.translations) ? extras!.translations! : []
    for (const t of translations) {
      if (!t?.locale || t.locale === DEFAULT_LOCALE) continue
      await client.courseTranslation.upsert({
        where: { courseId_locale: { courseId: courseid, locale: t.locale } },
        update: {
          name: t.name,
          description: (t as any).description ?? undefined,
          learnOutcomes: (t.learnOutcomes as any) ?? undefined,
          faq: (t.faqs as any) ?? undefined,
        },
        create: {
          courseId: courseid,
          locale: t.locale,
          name: t.name,
          description: (t as any).description ?? undefined,
          learnOutcomes: (t.learnOutcomes as any) ?? undefined,
          faq: (t.faqs as any) ?? undefined,
        },
      } as any)
    }
    // Create mentors junctions
    if (Array.isArray(extras?.mentors) && extras.mentors.length > 0) {
      await client.courseMentor.createMany({
        data: extras.mentors.map((m) => ({
          courseId: courseid,
          mentorId: m.mentorId,
          role: m.role as any,
          sortOrder: m.sortOrder ?? 0,
        })),
        skipDuplicates: true,
      })
    }
    return { status: 200 as const, message: "Course successfully created" }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
}

// List active mentor profiles (could be filtered by group later if relation exists)
export const onGetMentorProfiles = async () => {
  try {
    const mentors = await client.mentorProfile.findMany({
      where: { isActive: true },
      select: { id: true, displayName: true, title: true, headshotUrl: true, slug: true },
      orderBy: { displayName: "asc" },
    })
    return { status: 200 as const, mentors }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
}

// Get the very first section id of a course by module and section order
export const onGetFirstSectionId = async (courseId: string) => {
  try {
    const first = await client.section.findFirst({
      where: { Module: { is: { courseId } } },
      orderBy: [{ Module: { order: "asc" } }, { order: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    })
    if (!first) return { status: 404 as const, message: "No sections found" }
    return { status: 200 as const, sectionId: first.id }
  } catch (error) {
    console.error(error)
    return { status: 500 as const, message: "Error fetching section" }
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

export const onGetGroupCourses = cache(async (
  groupid: string,
  filter: "all" | "in_progress" | "completed" | "unpublished" | "buckets" = "all",
  locale?: string,
) => {
  try {
    const [courses, userId] = await Promise.all([
      client.course.findMany({
        where: { groupId: groupid, isDeleted: false },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          thumbnail: true,
          description: true,
          privacy: true,
          level: true,
          learnOutcomes: true,
          faq: true,
          createdAt: true,
          published: true,
          translations: {
            select: {
              locale: true,
              name: true,
              description: true,
              learnOutcomes: true,
              faq: true,
            },
          },
          mentors: {
            select: {
              mentorId: true,
              role: true,
              sortOrder: true,
              Mentor: {
                select: {
                  displayName: true,
                  title: true,
                  headshotUrl: true,
                  slug: true,
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
      getAuthedUserId(),
    ])

    if (!courses || courses.length === 0) {
      return { status: 404 as const, message: "No courses found" }
    }

    // Helper: normalize learnOutcomes to string[] for consistent UI rendering
    const normalizeLearnOutcomes = (value: any): string[] => {
      if (!Array.isArray(value)) return []
      return (value as any[])
        .map((x) => {
          if (typeof x === "string") return x
          if (x && typeof x === "object" && typeof (x as any).outcome === "string") return (x as any).outcome
          return null
        })
        .filter(Boolean) as string[]
    }

    // Overlay translations if locale is provided and not default
    if (locale && locale !== DEFAULT_LOCALE) {
      for (const c of courses as any[]) {
        const t = c.translations?.find((x: any) => x.locale === locale)
        if (t) {
          c.name = t.name ?? c.name
          c.description = t.description ?? c.description
          c.learnOutcomes = t.learnOutcomes ?? c.learnOutcomes
          c.faq = t.faq ?? c.faq
        }
      }
    }

    // Normalize learnOutcomes for all courses (post-translation overlay)
    for (const c of courses as any[]) {
      c.learnOutcomes = normalizeLearnOutcomes(c.learnOutcomes)
    }

    // If no user, return raw courses for "all" only (published only)
    if (!userId) {
      const publishedOnly = courses.filter((c) => c.published)
      if (filter === "unpublished") return { status: 200 as const, courses: courses.filter((c) => !c.published) }
      if (filter !== "all") return { status: 200 as const, courses: [] }
      return { status: 200 as const, courses: publishedOnly }
    }

    // Fetch progress for these courses
    const progressRows = await client.userCourseProgress.findMany({
      where: { userId, courseId: { in: courses.map((c) => c.id) } },
      select: {
        courseId: true,
        completedSections: true,
        lastSectionId: true,
        updatedAt: true,
      },
    })

    const byCourse = new Map(progressRows.map((p) => [p.courseId, p]))

    // Compute latest totals to avoid stale progress
    const [totals, moduleTotals] = await Promise.all([
      Promise.all(
        courses.map((c) =>
          client.section.count({ where: { Module: { is: { courseId: c.id } } } }),
        ),
      ),
      Promise.all(
        courses.map((c) => client.module.count({ where: { courseId: c.id } })),
      ),
    ])

    const enriched = courses.map((c, idx) => {
      const row = byCourse.get(c.id)
      const totalCount = totals[idx] ?? 0
      const completedCount = row?.completedSections?.length ?? 0
      const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
      const isComplete = percent === 100
      return {
        ...c,
        totalCount,
        moduleCount: moduleTotals[idx] ?? 0,
        completedCount,
        progress: percent,
        isComplete,
        lastSectionId: row?.lastSectionId ?? null,
      }
    })

    const published = enriched.filter((c) => c.published)
    if (filter === "buckets") {
      const in_progress = published.filter((c) => c.progress > 0 && !c.isComplete)
      const completed = published.filter((c) => c.isComplete)
      const unpublished = enriched.filter((c) => !c.published)
      return { status: 200 as const, all: published, in_progress, completed, unpublished }
    }

    let final = published
    if (filter === "in_progress") final = published.filter((c) => c.progress > 0 && !c.isComplete)
    if (filter === "completed") final = published.filter((c) => c.isComplete)
    if (filter === "unpublished") final = enriched.filter((c) => !c.published)

    return { status: 200 as const, courses: final }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
})

export const onGetCourseModules = cache(async (courseId: string) => {
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
              type: true,
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
})

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
          isComplete: progressPct >= 100,
        },
        update: {
          lastModuleId: moduleId,
          lastSectionId: sectionId,
          completedSections: { set: completedSections },
          progress: progressPct,
          isComplete: progressPct >= 100,
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

export const onSubmitQuizAttempt = async (
  groupid: string,
  sectionid: string,
  answers: number[],
  locale?: string,
) => {
  try {
    const userId = await getAuthedUserId()
    if (!userId) return { status: 401 as const, message: "Unauthorized" }

    const info = await onGetSectionInfo(sectionid, locale)
    if (info.status !== 200) return { status: 404 as const, message: "Section not found" }
    const section: any = (info as any).section
    if (section.type !== "quiz") return { status: 400 as const, message: "Not a quiz section" }
    const items: any[] = Array.isArray(section.blockPayload?.items) ? section.blockPayload.items : []
    const total = items.length
    if (answers.length !== total) return { status: 400 as const, message: "Invalid answers" }
    let correct = 0
    items.forEach((q, i) => {
      const idx = answers[i]
      if (q?.choices?.[idx]?.correct) correct += 1
    })
    const scorePct = total > 0 ? (correct / total) * 100 : 0
    const passThreshold = typeof section.blockPayload?.pass_threshold === "number" ? section.blockPayload.pass_threshold : 70
    const passed = scorePct >= passThreshold

    const count = await client.userSectionQuizAttempt.count({ where: { userId, sectionId: sectionid } })
    const attempt = await client.userSectionQuizAttempt.create({
      data: {
        userId,
        sectionId: sectionid,
        locale: locale ?? null,
        attemptNo: count + 1,
        selectedIndexes: answers,
        correctCount: correct,
        totalQuestions: total,
        scorePct,
        passed,
        quizSnapshotJson: section.blockPayload as any,
      },
    })

    const latestAttemptData = {
      lastAttempt: {
        attemptNo: count + 1,
        selectedIndexes: answers,
        correctCount: correct,
        totalQuestions: total,
        scorePct,
        passed,
        submittedAt: new Date().toISOString(),
      },
    }
    const destLocaleQuiz = locale && locale !== DEFAULT_LOCALE ? locale : null
    const existingProgressQuiz = await client.userSectionProgress.findFirst({
      where: { userId, sectionId: sectionid, locale: destLocaleQuiz },
      select: { data: true },
    })
    const mergedQuizData = { ...(existingProgressQuiz?.data as any || {}), ...latestAttemptData }
    {
      const destLocale = locale && locale !== DEFAULT_LOCALE ? locale : null
      const row = await client.userSectionProgress.findFirst({ where: { userId, sectionId: sectionid, locale: destLocale } })
      if (row) {
        await client.userSectionProgress.update({
          where: { id: row.id },
          data: { lastVisited: new Date(), lastScorePct: scorePct, passed, lastQuizAttemptId: attempt.id, data: mergedQuizData as any },
        })
      } else {
        await client.userSectionProgress.create({
          data: {
            userId,
            sectionId: sectionid,
            locale: destLocale,
            lastVisited: new Date(),
            lastScorePct: scorePct,
            passed,
            lastQuizAttemptId: attempt.id,
            data: mergedQuizData as any,
          },
        })
      }
    }

    if (passed) {
      const sec = await client.section.findUnique({ where: { id: sectionid }, select: { id: true, Module: { select: { id: true, courseId: true } } } })
      if (sec?.Module?.courseId) {
        const courseId = sec.Module.courseId
        const totalSections = await client.section.count({ where: { Module: { is: { courseId } } } })
        const existing = await client.userCourseProgress.findUnique({ where: { userId_courseId: { userId, courseId } }, select: { completedSections: true } })
        const prev = new Set(existing?.completedSections ?? [])
        prev.add(sectionid)
        const completedSections = Array.from(prev)
        const progressPct = totalSections > 0 ? (completedSections.length / totalSections) * 100 : 0
        await client.userCourseProgress.upsert({
          where: { userId_courseId: { userId, courseId } },
          create: { userId, courseId, lastSectionId: sectionid, lastModuleId: sec.Module.id, completedSections, progress: progressPct, isComplete: progressPct >= 100 },
          update: { lastSectionId: sectionid, lastModuleId: sec.Module.id, completedSections: { set: completedSections }, progress: progressPct, isComplete: progressPct >= 100 },
        })
      }
    }

    return { status: 200 as const, correct, total, scorePct, passed }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
}

export const onSaveReflectionResponse = async (
  groupid: string,
  sectionid: string,
  responseText: string,
  locale?: string,
) => {
  try {
    const userId = await getAuthedUserId()
    if (!userId) return { status: 401 as const, message: "Unauthorized" }

    const info = await onGetSectionInfo(sectionid, locale)
    if (info.status !== 200) return { status: 404 as const, message: "Section not found" }
    const section: any = (info as any).section
    if (section.type !== "reflection") return { status: 400 as const, message: "Not a reflection section" }
    const min = typeof section.blockPayload?.min_chars === "number" ? section.blockPayload.min_chars : 20
    const charCount = responseText?.length ?? 0
    if (charCount < min) return { status: 422 as const, message: `Minimum ${min} characters required` }

    const saved = await client.userSectionReflection.upsert({
      where: { userId_sectionId_locale: { userId, sectionId: sectionid, locale: locale ?? null } },
      update: { responseText, charCount },
      create: {
        userId,
        sectionId: sectionid,
        locale: locale ?? null,
        responseText,
        charCount,
        promptSnapshot: section.blockPayload?.prompt_md ?? null,
        guidanceSnapshot: section.blockPayload?.guidance_md ?? null,
      },
    } as any)

    const latestReflectionData = {
      lastReflection: {
        responseText,
        charCount,
        savedAt: new Date().toISOString(),
      },
    }
    const destLocaleRefl = locale && locale !== DEFAULT_LOCALE ? locale : null
    const existingProgressRefl = await client.userSectionProgress.findFirst({
      where: { userId, sectionId: sectionid, locale: destLocaleRefl },
      select: { data: true },
    })
    const mergedReflData = { ...(existingProgressRefl?.data as any || {}), ...latestReflectionData }
    {
      const destLocale = locale && locale !== DEFAULT_LOCALE ? locale : null
      const row = await client.userSectionProgress.findFirst({ where: { userId, sectionId: sectionid, locale: destLocale } })
      if (row) {
        await client.userSectionProgress.update({
          where: { id: row.id },
          data: { lastVisited: new Date(), lastReflectionId: saved.id, completed: true, data: mergedReflData as any },
        })
      } else {
        await client.userSectionProgress.create({
          data: { userId, sectionId: sectionid, locale: destLocale, lastVisited: new Date(), lastReflectionId: saved.id, completed: true, data: mergedReflData as any },
        })
      }
    }

    const sec = await client.section.findUnique({ where: { id: sectionid }, select: { id: true, Module: { select: { id: true, courseId: true } } } })
    if (sec?.Module?.courseId) {
      const courseId = sec.Module.courseId
      const totalSections = await client.section.count({ where: { Module: { is: { courseId } } } })
      const existing = await client.userCourseProgress.findUnique({ where: { userId_courseId: { userId, courseId } }, select: { completedSections: true } })
      const prev = new Set(existing?.completedSections ?? [])
      prev.add(sectionid)
      const completedSections = Array.from(prev)
      const progressPct = totalSections > 0 ? (completedSections.length / totalSections) * 100 : 0
      await client.userCourseProgress.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId, lastSectionId: sectionid, lastModuleId: sec.Module.id, completedSections, progress: progressPct, isComplete: progressPct >= 100 },
        update: { lastSectionId: sectionid, lastModuleId: sec.Module.id, completedSections: { set: completedSections }, progress: progressPct, isComplete: progressPct >= 100 },
      })
    }

    return { status: 200 as const, saved: true, id: saved.id, charCount }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
}
export const onCreateModuleSection = async (
  groupid: string,
  moduleid: string,
  sectionid: string,
  name?: string,
  icon?: string,
  options?: { type?: string; initialPayload?: any },
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
            ...(options?.type ? { type: options.type as any } : {}),
            ...(options?.initialPayload ? { blockPayload: options.initialPayload as any } : {}),
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

export const onGetSectionInfo = cache(async (sectionid: string, locale?: string) => {
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

    const coerceJson = (val: any) => {
      if (val === null || val === undefined) return undefined
      if (typeof val === "string") {
        try { return JSON.parse(val) } catch { return undefined }
      }
      return val as any
    }

    let jsonContent: any = coerceJson((section as any).jsonContent)
    let htmlContent: string | undefined = (section as any).htmlContent ?? undefined
    let content: string | undefined = (section as any).content ?? undefined
    let blockPayload: any = (section as any).blockPayload ?? undefined

    if (locale && locale !== DEFAULT_LOCALE) {
      const translation = await client.sectionTranslation.findUnique({
        where: { sectionId_locale: { sectionId: sectionid, locale } },
      })
      if (section.type === "concept") {
        jsonContent = translation?.contentJson ?? jsonContent
        htmlContent = translation?.contentHtml ?? htmlContent
        content = translation?.contentText ?? content
      } else {
        blockPayload = (translation as any)?.blockPayload ?? blockPayload
      }
    }

    // Latest per-user per-section snapshot
    let userSnapshot: any = null
    if (userId) {
      const whereLocale = locale && locale !== DEFAULT_LOCALE ? { locale } : { locale: null }
      const progressRow = await client.userSectionProgress.findFirst({ where: { userId, sectionId: sectionid, ...whereLocale } })
      const data: any = (progressRow?.data as any) || {}
      userSnapshot = {
        progress: progressRow
          ? {
              completed: progressRow.completed,
              progressPct: progressRow.progressPct,
              lastVisited: progressRow.lastVisited,
              lastScorePct: progressRow.lastScorePct,
              passed: progressRow.passed,
              lastQuizAttemptId: progressRow.lastQuizAttemptId,
              lastReflectionId: progressRow.lastReflectionId,
            }
          : null,
        lastAttempt: data?.lastAttempt ?? null,
        lastReflection: data?.lastReflection ?? null,
      }
    }

    const effective = {
      ...section,
      jsonContent,
      htmlContent,
      content,
      blockPayload,
      complete: completed,
    }
    return { status: 200, section: effective, user: userSnapshot }
  } catch (error) {
    return { status: 400, message: "Oops! something went wrong" }
  }
})

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
    // Relaxed: allow scripts and inline handlers for interactive HTML demos (per product requirement)
    // NOTE: Keep this path locked behind section:edit RBAC. Consider DOMPurify in the future with a permissive allowlist.
    const sanitized = html || ""
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
          contentHtml: sanitized,
          contentJson: parsed,
          contentText: content,
        },
        update: {
          contentHtml: sanitized,
          contentJson: parsed,
          contentText: content,
        },
      })
      if (translation) {
        return { status: 200, message: "Section translation successfully updated" }
      }
      return { status: 404, message: "No sections found" }
    }
    let parsed: any = null
    try {
      parsed = json ? JSON.parse(json) : null
    } catch (_) {
      parsed = null
    }
    const section = await client.section.update({
      where: {
        id: sectionid,
      },
      data: {
        htmlContent: sanitized,
        jsonContent: parsed,
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

export const onUpdateSectionTypedPayload = async (
  groupid: string,
  sectionid: string,
  payload: any,
  locale?: string,
) => {
  try {
    const userRole = await onGetUserGroupRole(groupid)
    if (userRole.status !== 200) return { status: 401 as const, message: "Unauthorized" }
    if (!userRole.isSuperAdmin && !hasPermission(userRole.role, "section:edit")) {
      return { status: 403 as const, message: "Forbidden" }
    }
    const base = await client.section.findUnique({ where: { id: sectionid }, select: { type: true } })
    const type = base?.type as string | undefined
    if (type && sectionTypeSchemaMap[type]) {
      const parsed = sectionTypeSchemaMap[type].safeParse(payload)
      if (!parsed.success) {
        return { status: 422 as const, message: "Invalid payload", issues: parsed.error.flatten() }
      }
      payload = parsed.data as any
    }
    if (locale && locale !== DEFAULT_LOCALE) {
      await client.sectionTranslation.upsert({
        where: { sectionId_locale: { sectionId: sectionid, locale } },
        create: {
          sectionId: sectionid,
          locale,
          blockPayload: payload as any,
        },
        update: {
          blockPayload: payload as any,
        },
      } as any)
      return { status: 200 as const, message: "Typed payload updated (translation)" }
    }
    await client.section.update({
      where: { id: sectionid },
      data: { blockPayload: payload as any },
    })
    return { status: 200 as const, message: "Typed payload updated" }
  } catch (error) {
    return { status: 400 as const, message: "Oops! something went wrong" }
  }
}
