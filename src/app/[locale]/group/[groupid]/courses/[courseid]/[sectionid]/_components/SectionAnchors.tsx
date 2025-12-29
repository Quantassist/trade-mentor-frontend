"use client"

import { useModuleAnchors } from "@/hooks/courses"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type Anchor = { id: string; shortLabel: string; title: string; excerpt: string }

type Props = {
  moduleId?: string
  anchorIds?: string[]
  className?: string
}

export default function SectionAnchors({ moduleId, anchorIds, className }: Props) {
  const ids = Array.isArray(anchorIds) ? Array.from(new Set(anchorIds)) : []
  const { anchorsById } = useModuleAnchors(moduleId, undefined)
  const anchors: Anchor[] = ids.map((id) => anchorsById[id]).filter(Boolean)
  if (!moduleId || anchors.length === 0) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {anchors.map((a) => (
        <Popover key={a.id}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="max-w-[220px] truncate rounded-full  bg-white dark:bg-[#161a20] px-2.5 py-1 text-[12px] text-slate-700 dark:text-themeTextWhite hover:bg-slate-100 dark:hover:bg-[#141821] ring-1 ring-slate-200 dark:ring-white/5"
              title={a.title}
            >
              {a.title}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 border-slate-200 dark:border-themeGray/60 bg-white dark:bg-[#161a20] text-slate-700 dark:text-themeTextWhite">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-900 dark:text-themeTextWhite">{a.title}</div>
              <div className="text-xs text-slate-500 dark:text-themeTextGray leading-relaxed">{a.excerpt}</div>
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}
