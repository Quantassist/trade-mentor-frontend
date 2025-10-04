import { onGetCourseAbout, onGetCourseModules } from "@/actions/courses"
import { AboutHeader } from "../../_components/about-header"
import { AboutMetrics } from "../../_components/about-metrics"
import { AboutLearn } from "../../_components/about-learn"
import { AboutModules } from "../../_components/about-modules"
import { AboutMentor } from "../../_components/about-mentor"
import { AboutFaq } from "../../_components/about-faq"
import { AboutAsideCard } from "../../_components/about-aside-card"

type PageProps = {
  params: Promise<{ groupid: string; courseid: string }>
}

export default async function AboutCoursePage({ params }: PageProps) {
  const { groupid, courseid } = await params

  const [aboutRes, modulesRes] = await Promise.all([
    onGetCourseAbout(courseid),
    onGetCourseModules(courseid),
  ])

  const course = aboutRes.status === 200 ? (aboutRes as any).course : null
  const modules = modulesRes.status === 200 ? (modulesRes as any).modules : []

  return (
    <div className="container py-10 px-5">
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

          <AboutMetrics />

          {/* About text */}
          {course?.description && (
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-white">About this course</h3>
              <p className="text-themeTextGray leading-relaxed max-w-3xl">{course.description}</p>
            </section>
          )}

          {/* Learning outcomes */}
          <AboutLearn />
          {/* Modules list */}
          <AboutModules modules={modules ?? []} />

          {/* Mentor */}
          <AboutMentor />

          {/* FAQ */}
          <AboutFaq />
        </div>
        <div className="lg:col-span-4">
          <AboutAsideCard thumbnail={course?.thumbnail ?? undefined} />
        </div>
      </div>
    </div>
  )
}