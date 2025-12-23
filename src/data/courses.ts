/**
 * Data Access Layer - Courses
 * Pure data fetching functions that can be used by API routes and Server Components
 */

import { defaultLocale } from "@/i18n/config"
import { client } from "@/lib/prisma"
import { cache } from "react"

export const getGroupCourses = cache(async (
  groupId: string,
  filter: "all" | "in_progress" | "completed" | "unpublished" | "buckets" = "all",
  locale?: string,
  userId?: string
) => {
  try {
    const courses = await client.course.findMany({
      where: { groupId, isDeleted: false },
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
    })

    if (!courses || courses.length === 0) {
      return { status: 404, message: "No courses found" }
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
    if (locale && locale !== defaultLocale) {
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
      if (filter === "unpublished") return { status: 200, courses: courses.filter((c) => !c.published) }
      if (filter !== "all") return { status: 200, courses: [] }
      return { status: 200, courses: publishedOnly }
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
      return { status: 200, all: published, in_progress, completed, unpublished }
    }

    let final = published
    if (filter === "in_progress") final = published.filter((c) => c.progress > 0 && !c.isComplete)
    if (filter === "completed") final = published.filter((c) => c.isComplete)
    if (filter === "unpublished") final = enriched.filter((c) => !c.published)

    return { status: 200, courses: final }
  } catch (error) {
    console.error("Error fetching group courses:", error)
    return { status: 400, message: "Failed to fetch courses" }
  }
})

export const getCourseModules = cache(async (courseId: string, userId?: string) => {
  try {
    const modules = await client.module.findMany({
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
    })

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
  } catch (error: any) {
    console.error("Error fetching course modules:", JSON.stringify(error, null, 2))
    return { status: 400, message: error?.message || "Failed to fetch modules" }
  }
})

export const getCourseAbout = cache(async (courseId: string, locale?: string) => {
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

    if (!course) {
      return { status: 404, message: "Course not found" }
    }

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

    // Locale overlay
    if (locale && locale !== defaultLocale) {
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
      status: 200,
      course: {
        ...course,
        learnOutcomes,
        moduleCount,
        totalLessons,
      },
    }
  } catch (error) {
    console.error("Error fetching course about:", error)
    return { status: 400, message: "Failed to fetch course" }
  }
})

export const getMentorProfiles = cache(async () => {
  try {
    const mentors = await client.appUser.findMany({
      where: {
        OR: [
          { isSuperAdmin: true },
          {
            membership: {
              some: {
                role: { in: ["OWNER", "ADMIN", "INSTRUCTOR"] as any },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        image: true,
      },
    })

    return {
      status: 200,
      mentors: mentors.map((m) => ({
        id: m.id,
        name: `${m.firstname} ${m.lastname}`,
        image: m.image,
      })),
    }
  } catch (error) {
    console.error("Error fetching mentor profiles:", error)
    return { status: 400, message: "Failed to fetch mentors" }
  }
})

export const getModuleAnchors = cache(async (moduleId: string) => {
  try {
    const sections = await client.section.findMany({
      where: { moduleId },
      select: {
        id: true,
        name: true,
        content: true,
      },
      orderBy: { order: "asc" },
    })

    const anchors = sections.map((s, idx) => ({
      id: s.id,
      shortLabel: `${idx + 1}`,
      title: s.name || `Section ${idx + 1}`,
      excerpt: s.content?.substring(0, 100) || "",
    }))

    return { status: 200, anchors }
  } catch (error) {
    console.error("Error fetching module anchors:", error)
    return { status: 400, message: "Failed to fetch anchors" }
  }
})

export const getSectionInfo = cache(async (sectionId: string, locale?: string, userId?: string) => {
  try {
    const section = await client.section.findUnique({
      where: { id: sectionId },
      include: { Module: { select: { id: true, courseId: true } } },
    })

    if (!section) {
      return { status: 404, message: "Section not found" }
    }

    let completed = false
    if (userId && section.Module?.courseId) {
      const courseId = section.Module.courseId
      const progress = await client.userCourseProgress.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { completedSections: true },
      })
      completed = !!progress?.completedSections?.includes(sectionId)

      // Update last interacted section/module
      await client.userCourseProgress.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: {
          userId,
          courseId,
          lastModuleId: section.Module.id,
          lastSectionId: sectionId,
          completedSections: [],
          progress: 0,
        },
        update: { lastModuleId: section.Module.id, lastSectionId: sectionId },
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

    if (locale && locale !== defaultLocale) {
      const translation = await client.sectionTranslation.findUnique({
        where: { sectionId_locale: { sectionId, locale } },
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
      const whereLocale = locale && locale !== defaultLocale ? { locale } : { locale: null }
      const progressRow = await client.userSectionProgress.findFirst({
        where: { userId, sectionId, ...whereLocale },
      })
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
    console.error("Error fetching section info:", error)
    return { status: 400, message: "Failed to fetch section" }
  }
})

export const getOngoingCourses = cache(async (userId: string, limit: number = 3) => {
  try {
    if (!userId) return { status: 200, courses: [] as any[] }

    // Find progress rows for ongoing courses
    const progresses = await client.userCourseProgress.findMany({
      where: { userId, progress: { gt: 0, lt: 100 } },
      orderBy: [{ updatedAt: "desc" }],
      take: limit,
      select: {
        courseId: true,
        progress: true,
        completedSections: true,
        lastSectionId: true,
        Course: { select: { id: true, name: true, thumbnail: true } },
      },
    })

    if (progresses.length === 0) return { status: 200, courses: [] as any[] }

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
        progress: computedPercent,
      }
    })

    return { status: 200, courses }
  } catch (error) {
    console.error("Error fetching ongoing courses:", error)
    return { status: 400, message: "Failed to fetch ongoing courses" }
  }
})

export const getCourseLandingSection = cache(async (courseId: string) => {
  try {
    const course = await client.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            section: {
              orderBy: { order: "asc" },
              take: 1,
            },
          },
          orderBy: { order: "asc" },
          take: 1,
        },
      },
    })

    if (!course || !course.modules[0]?.section[0]) {
      return { status: 404, message: "No landing section found" }
    }

    return { status: 200, sectionId: course.modules[0].section[0].id }
  } catch (error) {
    console.error("Error fetching course landing section:", error)
    return { status: 400, message: "Failed to fetch landing section" }
  }
})

export const getFirstSectionId = cache(async (courseId: string) => {
  try {
    const courseModule = await client.module.findFirst({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        section: {
          orderBy: { order: "asc" },
          take: 1,
        },
      },
    })

    if (!courseModule?.section[0]) {
      return { status: 404, message: "No section found" }
    }

    return { status: 200, sectionId: courseModule.section[0].id }
  } catch (error) {
    console.error("Error fetching first section:", error)
    return { status: 400, message: "Failed to fetch first section" }
  }
})
