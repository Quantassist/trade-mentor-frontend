"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
      <div className="space-y-2">
        <Accordion type="single" collapsible className="w-full">
          {safe.sort((a,b)=>a.order-b.order).map((m, idx) => (
            <AccordionItem key={m.id} value={m.id} className="border-themeGray rounded-xl px-4">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 rounded-lg bg-themeGray/50 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-themeTextWhite" />
                  </div>
                  <div>
                    <p className="text-sm text-themeTextGray">Module {idx + 1}</p>
                    <p className="text-base font-medium text-white">{m.title}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="ml-11 space-y-3">
                  {m.section.sort((a,b)=>a.order-b.order).map((s) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <p className="text-sm text-themeTextWhite">{s.name}</p>
                      <span className="text-xs text-themeTextGray">1 video • 18 mins</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
