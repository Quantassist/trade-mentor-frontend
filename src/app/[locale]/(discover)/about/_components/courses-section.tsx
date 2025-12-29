"use client"

import { onGetGroupCourses } from "@/actions/courses"
import { useQuery } from "@tanstack/react-query"
import { useLocale } from "next-intl"
import { ArrowRight, GraduationCap } from "lucide-react"
import { CourseCard } from "./course-card"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

type CoursesSectionProps = {
  groupid: string
}

export const CoursesSection = ({ groupid }: CoursesSectionProps) => {
  const locale = useLocale()

  const { data, isLoading } = useQuery({
    queryKey: ["group-courses", groupid, "all", locale],
    queryFn: () => onGetGroupCourses(groupid, "all", locale),
  })

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-themeTextWhite flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-[#b9a9ff]" />
            Available Courses
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#161a20] border border-slate-200 dark:border-themeGray/60 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="w-full aspect-video bg-slate-200 dark:bg-themeGray/40" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 dark:bg-themeGray/40 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-themeGray/40 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-themeGray/40 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  const courses = data?.status === 200 ? (data.courses ?? []) : []

  if (courses.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-themeTextWhite flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-[#b9a9ff]" />
          Available Courses
        </h2>
        {courses.length > 3 && (
          <Link href={`/group/${groupid}/courses`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 dark:text-themeTextGray hover:text-slate-900 dark:hover:text-white gap-1.5"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.slice(0, 6).map((course: any) => (
          <CourseCard
            key={course.id}
            id={course.id}
            slug={course.slug}
            name={course.name}
            description={course.description}
            thumbnail={course.thumbnail}
            groupid={groupid}
            moduleCount={course.moduleCount}
            totalCount={course.totalCount}
            level={course.level}
          />
        ))}
      </div>
      {courses.length > 6 && (
        <div className="flex justify-center pt-2">
          <Link href={`/group/${groupid}/courses`}>
            <Button
              variant="outline"
              className="bg-transparent border-slate-200 dark:border-themeGray/60 text-slate-700 dark:text-themeTextWhite hover:bg-slate-100 dark:hover:bg-themeGray/20 hover:text-slate-900 dark:hover:text-white"
            >
              See all {courses.length} courses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  )
}
