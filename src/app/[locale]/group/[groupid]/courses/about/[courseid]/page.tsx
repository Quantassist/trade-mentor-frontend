import { onGetCourseAbout, onGetCourseModules } from "@/actions/courses"
import { AboutHeader } from "../../_components/about-header"
import { AboutMetrics } from "../../_components/about-metrics"
import { AboutLearn } from "../../_components/about-learn"
import { AboutModules } from "../../_components/about-modules"
import { AboutMentor } from "../../_components/about-mentor"
import { AboutFaq } from "../../_components/about-faq"
import { AboutAsideCard } from "../../_components/about-aside-card"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"

type PageProps = {
  params: Promise<{ locale: string; groupid: string; courseid: string }>
}

export default async function AboutCoursePage({ params }: PageProps) {
  const { locale, groupid, courseid } = await params

  const client = new QueryClient()

  const [aboutSettle, modulesSettle] = await Promise.allSettled([
    client.prefetchQuery({
      queryKey: ["course-about", courseid, locale],
      queryFn: () => onGetCourseAbout(courseid, locale),
      staleTime: 60_000,
      gcTime: 5 * 60_000,
    }),
    client.prefetchQuery({
      queryKey: ["course-modules", courseid],
      queryFn: () => onGetCourseModules(courseid),
      staleTime: 60_000,
      gcTime: 5 * 60_000,
    }),
  ])

  const aboutRes = client.getQueryData(["course-about", courseid, locale]) as any | undefined
  const modulesRes = client.getQueryData(["course-modules", courseid]) as any | undefined

  const course = aboutRes?.status === 200 ? (aboutRes as any).course : null
  const modules = modulesRes?.status === 200 ? (modulesRes as any).modules : []
  const learnItems: string[] = Array.isArray(course?.learnOutcomes) ? (course!.learnOutcomes as any) : []
  const faqs: { question?: string; answer?: string }[] = Array.isArray(course?.faq) ? (course!.faq as any) : []
  const mentors = Array.isArray(course?.mentors)
    ? (course!.mentors as any[]).map((m: any) => ({
        displayName: m?.Mentor?.displayName,
        title: m?.Mentor?.title,
        headshotUrl: m?.Mentor?.headshotUrl,
        role: m?.role,
        organization: m?.Mentor?.organization,
        bio: m?.Mentor?.bio,
        experienceStartYear: m?.Mentor?.experienceStartYear,
        socials: m?.Mentor?.socials,
      }))
    : []
  const languageLabel = locale === "hi" ? "Hindi" : locale === "en" ? "English" : locale
  const languagesAvailable = ["English", "हिंदी"]

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <div className="container mx-auto max-w-6xl py-10 px-5 pb-24 lg:pb-10">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-8">
            {/* Header (without aside on large screens) */}
            <AboutHeader
              groupid={groupid}
              courseId={courseid}
              name={course?.name ?? "Course"}
              description={course?.description ?? undefined}
              thumbnail={course?.thumbnail ?? undefined}
              renderAside={false}
            />

            <AboutMetrics level={course?.level} language={languageLabel} languages={languagesAvailable} />

            {/* About text */}
            {course?.description && (
              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-white">About this course</h3>
                <p className="text-themeTextGray leading-relaxed max-w-3xl">{course.description}</p>
              </section>
            )}

            {/* Learning outcomes */}
            <AboutLearn items={learnItems} />
            {/* Modules list */}
            <AboutModules modules={modules ?? []} />

            {/* Mentor */}
            <AboutMentor mentors={mentors} />

            {/* FAQ */}
            <AboutFaq faqs={faqs} />
          </div>
          <div className="lg:col-span-4 hidden lg:block">
            <AboutAsideCard thumbnail={course?.thumbnail ?? undefined} groupid={groupid} courseId={courseid} />
          </div>
        </div>
      </div>
    </HydrationBoundary>
  )
}