"use client"

import { onDeleteCourse } from "@/actions/courses"
import { CourseCreate } from "@/components/form/create-course"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useCourses } from "@/hooks/courses"
import { Link } from "@/i18n/navigation"
import { truncateString } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Pencil, Trash2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import { toast } from "sonner"

type CourseListProps = {
  groupid: string
  filter?: "all" | "in_progress" | "completed" | "unpublished"
  canManage?: boolean
}

export const CourseList = ({ groupid, filter = "all", canManage = false }: CourseListProps) => {
  const locale = useLocale()
  const t = useTranslations("courses")
  const { data } = useCourses(groupid, filter, locale)
  const client = useQueryClient()
  const { mutate: removeCourse, isPending: deleting } = useMutation({
    mutationFn: (courseId: string) => onDeleteCourse(groupid, courseId),
    onSuccess: (res) => toast(res.status !== 200 ? "Error" : "Success", { description: res.message }),
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["group-courses", groupid] })
    },
  })

  if (data?.status !== 200) return null

  const items = data.courses ?? []

  if (items.length === 0) {
    return (
      <div className="text-sm text-slate-500 dark:text-themeTextGray py-8">No courses to show.</div>
    )
  }

  return (
    <div className="divide-y divide-slate-200 dark:divide-themeGray">
      {items.map((c: any, idx: number) => {
        const thumb = c.thumbnail ? `https://ucarecdn.com/${c.thumbnail}/-/scale_crop/160x100/center/-/format/auto/` : null
        const progress = Math.min(Math.max(Number(c.progress || 0), 0), 100)
        // Use slug for URL-friendly links, fallback to id
        const courseUrlId = c.slug || c.id
        const resumeHref = `/group/${groupid}/courses/${courseUrlId}` // course page redirects to correct section
        const overviewHref = `/group/${groupid}/courses/about/${courseUrlId}`
        return (
          <Card key={c.id} className="bg-white dark:bg-[#111213] border-slate-200 dark:border-themeGray rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="relative h-24 w-40 shrink-0 rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-white/5">
                {thumb ? (
                  <Image src={thumb} alt={c.name || "cover"} fill sizes="160px" priority={idx === 0} className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-slate-200 dark:bg-themeGray" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-slate-900 dark:text-themeTextWhite font-semibold truncate">{c.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-themeTextGray truncate">
                      {truncateString(c.description)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-themeTextGray">
                    {c.moduleCount != null && (
                      <span>{c.moduleCount} {t("modulesText")}</span>
                    )}
                    {c.totalCount != null && (
                      <span>• {c.totalCount} {t("lessonsText")}</span>
                    )}
                    {canManage && (
                      <div className="flex items-center gap-2 ml-2">
                        <CourseCreate
                          groupid={groupid}
                          initial={c}
                          trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 dark:text-themeTextGray"><Pencil className="h-4 w-4" /></Button>}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-400 hover:text-red-300"
                              aria-label="Delete course"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white dark:bg-[#111213] border-slate-200 dark:border-themeGray">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-slate-900 dark:text-themeTextWhite">Delete course?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this course? The course will not be permanently deleted, rather soft deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-500"
                                disabled={deleting}
                                onClick={() => removeCourse(c.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-themeTextGray">
                    <span>{Math.round(progress)}% {t("completedText")}</span>
                  </div>
                  <div className="mt-1">
                    <Progress value={progress} className="h-2 bg-slate-200 dark:bg-themeGray" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Link href={resumeHref}>
                    <Button size="sm" className="px-4">
                      {progress > 0 ? t("resumeCourseButton") : t("startCourseButton")}
                    </Button>
                  </Link>
                  <Link href={overviewHref}>
                    <Button size="sm" variant="secondary" className="bg-slate-100 dark:bg-themeGray text-slate-700 dark:text-themeTextWhite">
                      {t("courseOverviewButton")}
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
