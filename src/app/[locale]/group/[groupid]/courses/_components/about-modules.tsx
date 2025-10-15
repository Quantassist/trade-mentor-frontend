"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Lock } from "lucide-react"

type Section = { id: string; name: string; order: number }
type Module = { id: string; title: string; order: number; section: Section[] }

export function AboutModules({ modules }: { modules: Module[] }) {
  const safe = Array.isArray(modules) ? modules : []
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Modules</h3>
        <p className="text-xs text-themeTextGray">{safe.length} modules</p>
      </div>
      <div className="space-y-3">
        <Accordion type="single" collapsible className="w-full">
          {safe.sort((a,b)=>a.order-b.order).map((m, idx) => (
            <AccordionItem key={m.id} value={m.id} className="rounded-xl overflow-hidden border border-themeGray/60 bg-[#161a20]">
              <AccordionTrigger className="px-4 py-4 hover:no-underline">
                <div className="w-full flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 text-left">
                    <div className="h-8 w-8 rounded-full bg-themeGray/40 flex items-center justify-center ring-1 ring-white/10">
                      <Lock className="h-4 w-4 text-themeTextWhite" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#b9a9ff]">Module {idx + 1}</p>
                      <p className="text-base font-semibold text-white truncate">{m.title}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-themeTextGray">1 Video • 1 hr 10 mins</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="border-t border-themeGray/60 bg-white/5">
                  <div className="px-4">
                    <div className="ml-11 space-y-3 py-4">
                      {m.section.sort((a,b)=>a.order-b.order).map((s, sidx) => (
                        <div key={s.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-themeTextGray">Chapter {sidx + 1}</p>
                            <p className="text-sm text-themeTextWhite">{s.name}</p>
                          </div>
                          <span className="text-xs text-themeTextGray">1 video • 18 mins</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
