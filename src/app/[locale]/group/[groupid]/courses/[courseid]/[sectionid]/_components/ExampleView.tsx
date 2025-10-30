"use client"
import React, { useState } from "react"
import type { ExampleBlockPayload } from "@/types/sections"
import { Markdown } from "@/components/global/markdown"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HelpCircle, Sparkles, Lightbulb } from "lucide-react"
import { useCourseSectionInfo, useGroupRole } from "@/hooks/courses"
import ExampleContentForm from "@/components/form/example/index"

type Props = { payload: ExampleBlockPayload; sectionid: string; groupid: string; locale?: string; initial?: any }

export default function ExampleView({ payload, sectionid, groupid, locale, initial }: Props) {
  const { canEdit } = useGroupRole(groupid)
  const [editOpen, setEditOpen] = useState(false)
  const { data } = useCourseSectionInfo(sectionid, locale, initial)
  const effective = (data?.section?.blockPayload as any) ?? payload
  const pairs = Array.isArray(effective?.qa_pairs) ? effective!.qa_pairs : []
  const count = pairs.length
  const [open, setOpen] = useState<string[]>([])

  return (
    <>
      <div className="p-5 md:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-semibold text-white">{effective?.scenario_title}</h2>
          </div>
          {canEdit && (
            <Button type="button" className="rounded-md px-3 py-1.5 text-sm text-white bg-[#4F46E5] hover:bg-[#4F46E5]/90 ring-1 ring-[#4F46E5]/30"
              onClick={() => setEditOpen(true)}>
              Edit section
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-themeGray/60 bg-[#12151b] p-4">
          <Markdown>{effective?.scenario_md}</Markdown>
        </div>

        {count > 0 && (
          <div className="rounded-xl overflow-hidden border border-themeGray/60 bg-[#161a20]">
            <Accordion type="multiple" value={open} onValueChange={setOpen}>
              {pairs.map((qa: { question: string; answer: string }, i: number) => (
                <AccordionItem key={i} value={`qa-${i}`} className="border-themeGray/60">
                  <AccordionTrigger className="px-4 py-3 text-left hover:no-underline">
                    <div className="w-full flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-themeGray/40 flex items-center justify-center ring-1 ring-white/10">
                          <HelpCircle className="h-4 w-4 text-[#b9a9ff]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-[#b9a9ff]">Question {i + 1}</p>
                          <p className="text-sm md:text-base text-white break-words">{qa.question}</p>
                        </div>
                      </div>
                      <span className="ml-3 shrink-0 rounded-full border border-themeGray/60 bg-[#0f0f14] px-2 py-0.5 text-[11px] text-themeTextGray">
                        {open.includes(`qa-${i}`) ? "Hide answer" : "Show answer"}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="rounded-lg border border-themeGray/60 bg-[#12151b] p-4 text-themeTextWhite">
                      {qa.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {(effective as any)?.tips_md ? (
          <section className="rounded-xl border border-themeGray/60 bg-[#161a20] p-4">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[#b9a9ff]" />
              <h3 className="text-sm font-semibold text-white">Tips</h3>
            </div>
            <Markdown>{(effective as any).tips_md}</Markdown>
          </section>
        ) : null}

        {(effective as any)?.takeaways?.length ? (
          <section className="rounded-xl border border-themeGray/60 bg-[#161a20] p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#b9a9ff]" />
              <h3 className="text-sm font-semibold text-white">Key Takeaways</h3>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-themeTextWhite">
              {(effective as any).takeaways.map((t: string, i: number) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {canEdit && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-[#161a20] border border-themeGray/60 text-themeTextWhite">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Example</DialogTitle>
            </DialogHeader>
            <ExampleContentForm
              groupid={groupid}
              sectionid={sectionid}
              locale={locale}
              initial={effective as any}
              onCancel={() => setEditOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
