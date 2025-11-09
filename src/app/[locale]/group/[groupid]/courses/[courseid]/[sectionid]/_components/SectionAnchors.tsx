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
              className="max-w-[220px] truncate rounded-full border border-themeGray/60 bg-[#161a20] px-2.5 py-1 text-[12px] text-themeTextWhite hover:bg-[#141821] ring-1 ring-white/5"
              title={a.title}
            >
              {a.title}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 border-themeGray/60 bg-[#161a20] text-themeTextWhite">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">{a.title}</div>
              <div className="text-xs text-themeTextGray leading-relaxed">{a.excerpt}</div>
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}
