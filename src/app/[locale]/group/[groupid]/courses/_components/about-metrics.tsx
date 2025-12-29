"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Layers, Clock3, BookOpen, Languages } from "lucide-react"

export function AboutMetrics({ level, language, languages }: { level?: string | null; language?: string | null; languages?: string[] }) {
  const languagesLabel = Array.isArray(languages) && languages.length > 0
    ? languages.join(" & ")
    : (language || "English")
  const items = [
    { icon: Layers, label: "Level", value: level || "All levels" },
    { icon: Clock3, label: "Access", value: "On demand" },
    { icon: BookOpen, label: "Access period", value: "90 days" },
    { icon: Languages, label: "Language", value: languagesLabel },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item, idx) => (
        <Card
          key={idx}
          className={cn(
            "border-slate-200 dark:border-themeGray/60 bg-white dark:bg-[#161a20] rounded-xl p-4 flex items-center gap-3"
          )}
        >
          <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-themeGray/40 flex items-center justify-center">
            <item.icon className="h-5 w-5 text-slate-600 dark:text-themeTextWhite" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-themeTextGray">{item.label}</p>
            <p className="text-sm text-slate-900 dark:text-themeTextWhite truncate">{item.value}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
