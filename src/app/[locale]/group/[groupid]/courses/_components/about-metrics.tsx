"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Layers, Clock3, BookOpen, Languages } from "lucide-react"

export function AboutMetrics() {
  const items = [
    { icon: Layers, label: "Level", value: "All levels" },
    { icon: Clock3, label: "Access", value: "On demand" },
    { icon: BookOpen, label: "Access period", value: "90 days" },
    { icon: Languages, label: "Language", value: "English" },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item, idx) => (
        <Card
          key={idx}
          className={cn(
            "border-themeGray bg-[#121315] rounded-xl p-4 flex items-center gap-3"
          )}
        >
          <div className="h-9 w-9 rounded-lg bg-themeGray/40 flex items-center justify-center">
            <item.icon className="h-5 w-5 text-themeTextWhite" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-themeTextGray">{item.label}</p>
            <p className="text-sm text-white truncate">{item.value}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
