"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Link } from "@/i18n/navigation"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { ChevronRight, LineChart } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"

type OngoingCoursesWidgetProps = {
  groupid?: string
  className?: string
  limit?: number
}

export const OngoingCoursesWidget = ({ groupid, className, limit = 3 }: OngoingCoursesWidgetProps) => {
  const locale = useLocale()
  const t = useTranslations("ongoingCourses")

  const { data } = useQuery({
    queryKey: ["ongoing-courses", locale, limit],
    queryFn: () => api.courses.getOngoing(limit),
  })

  const courses = data?.status === 200 ? data.courses ?? [] : []

  if (!courses.length) return null

  const toCourseHref = (courseId: string) => `/group/${groupid}/courses/${courseId}`

  return (
    <div className={cn("space-y-5")}> 
      <Card className="border-slate-200 dark:border-themeGray/60 bg-white dark:bg-[#161a20] rounded-xl p-5">
      {/* Continue your journey */}
      <div className="space-y-5">
        <h3 className="text-slate-900 dark:text-themeTextWhite font-semibold tracking-tight text-xl">{t("title")}</h3>
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
              className="group border border-slate-200 dark:border-[#2a2a2e] bg-slate-50 dark:bg-[#141417] hover:bg-slate-100 dark:hover:bg-[#17181b] transition-colors rounded-2xl shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5 hover:shadow-md"
            >
              <Link href={toCourseHref(c.courseId)} className="block p-4">
                <div className="flex items-center gap-3">
                  {thumb ? (
                    <div className="relative h-16 w-16 shrink-0 rounded-xl ring-1 ring-slate-200 dark:ring-white/5 overflow-hidden">
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
                      <p className="text-slate-900 dark:text-themeTextWhite font-medium truncate group-hover:text-slate-700 dark:group-hover:text-themeTextWhite/90">{c.name}</p>
                      <p className="text-xs text-slate-500 dark:text-themeTextGray">{Math.round(progress)}% {t("complete")}</p>
                      <div className="mt-2">
                        <Progress value={progress} className="h-2 bg-slate-200 dark:bg-[#1f2023]" />
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400 dark:text-themeTextGray" size={16} />
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
              {t("viewAll")}
            </Link>
          </div>
        )}
      </div>
      </Card>
    </div>
  )
}
