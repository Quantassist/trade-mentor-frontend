"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useCourses } from "@/hooks/courses"
import { Link } from "@/i18n/navigation"
import { truncateString } from "@/lib/utils"
import Image from "next/image"

type CourseListProps = {
  groupid: string
  filter?: "all" | "in_progress" | "completed" | "unpublished"
}

export const CourseList = ({ groupid, filter = "all" }: CourseListProps) => {
  const { data } = useCourses(groupid, filter)

  if (data?.status !== 200) return null

  const items = data.courses ?? []

  if (items.length === 0) {
    return (
      <div className="text-sm text-themeTextGray py-8">No courses to show.</div>
    )
  }

  return (
    <div className="divide-y divide-themeGray">
      {items.map((c: any) => {
        const thumb = c.thumbnail ? `https://ucarecdn.com/${c.thumbnail}/-/scale_crop/160x100/center/-/format/auto/` : null
        const progress = Math.min(Math.max(Number(c.progress || 0), 0), 100)
        const resumeHref = `/group/${groupid}/courses/${c.id}` // course page redirects to correct section
        const overviewHref = `/group/${groupid}/courses/about/${c.id}`
        return (
          <Card key={c.id} className="bg-[#111213] border-themeGray rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="relative h-24 w-40 shrink-0 rounded-lg overflow-hidden ring-1 ring-white/5">
                {thumb ? (
                  <Image src={thumb} alt="cover" fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-themeGray" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold truncate">{c.name}</h3>
                    <p className="text-sm text-themeTextGray truncate">
                      {truncateString(c.description)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-themeTextGray">
                    {c.moduleCount != null && (
                      <span>{c.moduleCount} modules</span>
                    )}
                    {c.totalCount != null && (
                      <span>• {c.totalCount} lessons</span>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-themeTextGray">
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                  <div className="mt-1">
                    <Progress value={progress} className="h-2 bg-themeGray" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Link href={resumeHref}>
                    <Button size="sm" className="px-4">
                      {progress > 0 ? "Resume course" : "Start course"}
                    </Button>
                  </Link>
                  <Link href={overviewHref}>
                    <Button size="sm" variant="secondary" className="bg-themeGray text-themeTextWhite">
                      Course overview
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
