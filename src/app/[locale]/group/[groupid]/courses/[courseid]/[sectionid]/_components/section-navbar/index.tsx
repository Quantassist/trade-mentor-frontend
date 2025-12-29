"use client"
import { Button } from "@/components/ui/button"
import { useSectionNavBar } from "@/hooks/courses"
import { useQueryClient } from "@tanstack/react-query"
import { Check } from "lucide-react"
import { useLocale } from "next-intl"
import { useEffect, useState } from "react"

type SectionNavBarProps = {
  sectionid: string
  groupid: string
}

const SectionNavBar = ({ sectionid, groupid }: SectionNavBarProps) => {
  const locale = useLocale()
  const { data, mutate, isPending } = useSectionNavBar(groupid, sectionid, locale)
  const [completed, setCompleted] = useState<boolean>(!!data?.section?.complete)
  const client = useQueryClient()

  useEffect(() => {
    setCompleted(!!data?.section?.complete)
  }, [data?.section?.complete])

  if (data?.status !== 200) return <></>

  return (
    <div className="flex justify-between p-5 overflow-y-auto items-center">
      <div>
        <p className="text-slate-500  dark:text-themeTextWhite font-bold">Course Title</p>
        <h2 className="text-3xl text-slate-900 dark:text-themeTextWhite font-bold">
          {data.section?.name}
        </h2>
      </div>
      <div>
        <Button
          className="bg-slate-100 dark:bg-themeDarkGray flex gap-x-3 items-center border-slate-300 dark:border-themeGray text-slate-700 dark:text-themeTextWhite hover:bg-amber-500 hover:text-slate-900 hover:border-amber-500 dark:hover:bg-amber-500 dark:hover:text-slate-900 dark:hover:border-amber-500 transition-colors"
          variant="outline"
          onClick={() => {
            // optimistic UI
            setCompleted(true)
            mutate(undefined, {
              onError: () => setCompleted(!!data?.section?.complete),
              onSettled: async () => {
                await client.invalidateQueries({ queryKey: ["course-modules"] })
                await client.invalidateQueries({ queryKey: ["section-info", sectionid, locale] })
                return
              },
            })
          }}
        >
          <Check size={16} />
          {isPending ? "Completed" : !completed ? "Mark as complete" : "Completed"}
        </Button>
      </div>
    </div>
  )
}

export default SectionNavBar
