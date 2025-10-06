"use client"

import { Card } from "@/components/ui/card"

export function AboutLearn({ items }: { items: string[] }) {
  const list = Array.isArray(items) ? items.filter(Boolean) : []
  if (list.length === 0) return null
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">You will learn</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {list.map((t, i) => (
          <Card key={i} className="border-themeGray bg-[#121315] rounded-xl p-4 text-sm text-themeTextWhite">
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-themeGray/50 text-white flex items-center justify-center text-xs font-semibold">{i + 1}</div>
              <p className="leading-snug">{t}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
