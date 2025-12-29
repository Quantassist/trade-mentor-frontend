"use client"
import React, { useMemo, useState } from "react"
import type { CalloutBlockPayload } from "@/types/sections"
import { Markdown } from "@/components/global/markdown"
import { AlertTriangle, Info, Landmark, Lightbulb, ShieldAlert, X } from "lucide-react"

type Variant = {
  icon: React.ReactNode
  ring: string
  badge: string
  label: string
}

const styleMap: Record<string, Variant> = {
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    ring: "ring-amber-400/20 border-amber-400/40",
    badge: "text-amber-300 bg-amber-400/10 border-amber-400/30",
    label: "Warning",
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    ring: "ring-sky-400/20 border-sky-400/40",
    badge: "text-sky-300 bg-sky-400/10 border-sky-400/30",
    label: "Info",
  },
  compliance: {
    icon: <ShieldAlert className="h-4 w-4" />,
    ring: "ring-orange-400/20 border-orange-400/40",
    badge: "text-orange-300 bg-orange-400/10 border-orange-400/30",
    label: "Compliance",
  },
  tip: {
    icon: <Lightbulb className="h-4 w-4" />,
    ring: "ring-emerald-400/20 border-emerald-400/40",
    badge: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30",
    label: "Tip",
  },
  sebi_guideline: {
    icon: <Landmark className="h-4 w-4" />,
    ring: "ring-violet-400/20 border-violet-400/40",
    badge: "text-violet-300 bg-violet-400/10 border-violet-400/30",
    label: "SEBI",
  },
}

export default function CalloutView({ payload }: { payload: CalloutBlockPayload }) {
  const [open, setOpen] = useState(true)
  const style = (payload?.style || "info").toLowerCase()
  const v = useMemo<Variant>(() => styleMap[style] || styleMap.info, [style])
  const title = (payload as any)?.block_title || (payload as any)?.title

  if (!open && payload?.dismissible !== false) return null

  return (
    <div className={`relative rounded-xl border bg-white dark:bg-[#161a20] p-4 ring-1 ${v.ring}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md border ${v.badge} ring-1 ring-white/10`}>
          {v.icon}
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide border ${v.badge}`}>
              {v.label}
            </span>
            {title ? <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-themeTextWhite">{title}</h3> : null}
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <Markdown>{payload?.text_md}</Markdown>
          </div>
        </div>
        {payload?.dismissible !== false && (
          <button
            aria-label="Dismiss"
            className="ml-2 rounded-md p-1 text-slate-500 dark:text-themeTextGray hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
