"use client"

import { onGetOngoingCourses } from "@/actions/courses"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { ChevronRight, LineChart } from "lucide-react"
import { useLocale } from "next-intl"
import Image from "next/image"

type OngoingCoursesWidgetProps = {
  groupid?: string
  className?: string
  limit?: number
}

export const OngoingCoursesWidget = ({ groupid, className, limit = 3 }: OngoingCoursesWidgetProps) => {
  const locale = useLocale()

  const { data } = useQuery({
    queryKey: ["ongoing-courses", locale, limit],
    queryFn: () => onGetOngoingCourses(limit),
  })

  const courses = data?.status === 200 ? data.courses ?? [] : []

  if (!courses.length) return null

  const toCourseHref = (courseId: string, lastSectionId?: string | null) =>
    lastSectionId
      ? `/group/${groupid}/courses/${courseId}/${lastSectionId}`
      : `/group/${groupid}/courses/${courseId}`

  return (
    <div className={cn("mt-8 space-y-5")}> 
      <Card className="border-themeGray/60 bg-[#161a20] rounded-xl p-5">
      {/* Continue your journey */}
      <div className="space-y-5">
        <h3 className="text-themeTextWhite font-semibold tracking-tight text-xl">Continue Your Journey</h3>
        <div className="space-y-3">
          {courses.map((c: any) => {
            const currentLesson = Math.min((c.completedCount ?? 0) + 1, c.totalCount || 0)
            const progress = Math.min(Math.max(Number(c.progress || 0), 0), 100)
            const rawThumb = c.thumbnail ? `https://ucarecdn.com/${c.thumbnail}/` : null
            const thumb = rawThumb
              ? `${rawThumb}-/scale_crop/64x64/center/-/format/auto/-/quality/smart_retina/`
              : null
            return (
            <Card
              key={c.courseId}
              className="group border border-[#2a2a2e] bg-[#141417] hover:bg-[#17181b] transition-colors rounded-2xl shadow-sm ring-1 ring-white/5 hover:shadow-md"
            >
              <Link href={toCourseHref(c.courseId, c.lastSectionId)} className="block p-4">
                <div className="flex items-center gap-3">
                  {thumb ? (
                    <div className="relative h-16 w-16 shrink-0 rounded-xl ring-1 ring-white/5 overflow-hidden">
                      <Image
                        src={thumb}
                        alt="thumbnail"
                        fill
                        sizes="64px"
                        className="object-cover"
                        quality={90}
                        priority={false}
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 text-sky-400 flex items-center justify-center ring-1 ring-sky-500/20">
                      <LineChart size={18} />
                    </div>
                  )}
                    <div className="min-w-0 flex-1">
                      <p className="text-themeTextWhite font-medium truncate group-hover:text-themeTextWhite/90">{c.name}</p>
                      <p className="text-xs text-themeTextGray">{Math.round(progress)}% complete</p>
                      <div className="mt-2">
                        <Progress value={progress} className="h-2 bg-[#1f2023]" />
                      </div>
                    </div>
                    <ChevronRight className="text-themeTextGray" size={16} />
                </div>
              </Link>
            </Card>
          )
          })}
        </div>

        {groupid && (
          <div className="pt-3 text-center">
            <Link
              href={`/group/${groupid}/courses`}
              className="inline-block text-base md:text-lg font-semibold text-sky-400 hover:text-sky-300 hover:underline"
            >
              View all courses
            </Link>
          </div>
        )}
      </div>
      </Card>
    </div>
  )
}
