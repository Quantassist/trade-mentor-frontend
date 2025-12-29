"use client"
import ExampleContentForm from "@/components/form/example/index"
import { Markdown } from "@/components/global/markdown"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCourseSectionInfo, useGroupRole } from "@/hooks/courses"
import type { ExampleBlockPayload } from "@/types/sections"
import { BadgeCheck, ClipboardList, Clock, HelpCircle, IndianRupee, Target, UserRound } from "lucide-react"
import { useState } from "react"
import SectionAnchors from "@/components/anchors/section-anchors"

type Props = { payload: ExampleBlockPayload; sectionid: string; groupid: string; locale?: string; initial?: any }

export default function ExampleView({ payload, sectionid, groupid, locale, initial }: Props) {
  const { canEdit } = useGroupRole(groupid)
  const [editOpen, setEditOpen] = useState(false)
  const { data } = useCourseSectionInfo(sectionid, locale, initial)
  const effective = (data?.section?.blockPayload as any) ?? payload
  const pairs = Array.isArray(effective?.qa_pairs) ? effective!.qa_pairs : []
  const count = pairs.length
  const [open, setOpen] = useState<string[]>([])
  const moduleId = (data?.section?.Module?.id as string) || undefined
  const anchorIds = Array.isArray((data as any)?.section?.anchorIds) ? (data as any).section.anchorIds : []

  return (
    <>
      <div className="p-5 md:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          {/* <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-semibold text-white">{(effective as any)?.block_title}</h2>
          </div> */}

        <SectionAnchors moduleId={moduleId} anchorIds={anchorIds} />
          {canEdit && (
            <Button type="button" className="rounded-md px-3 py-1.5 text-sm text-white bg-[#4F46E5] hover:bg-[#4F46E5]/90 ring-1 ring-[#4F46E5]/30"
              onClick={() => setEditOpen(true)}>
              Edit section
            </Button>
          )}
        </div>

        {(((effective as any)?.persona?.length) || ((effective as any)?.financial_context)) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Persona: 1/3 */}
            <aside className="md:col-span-1 space-y-4">
              <div className="px-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-themeGray/40 flex items-center justify-center ring-1 ring-slate-200 dark:ring-white/10">
                    <UserRound className="h-3.5 w-3.5 text-[#b9a9ff]" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-themeTextWhite">Scenario Persona</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-themeTextGray">A fictional character that grounds this example in a real-life story.</p>
              </div>
              {(effective as any)?.persona?.map((p: any, i: number) => (
                <div key={i} className="rounded-xl border border-slate-200 dark:border-themeGray/60 bg-gradient-to-b from-white to-slate-50 dark:from-[#171a22] dark:to-[#141821] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                  <div className="p-4 flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-themeGray/40 flex items-center justify-center ring-1 ring-slate-200 dark:ring-white/10">
                      <UserRound className="h-5 w-5 text-[#b9a9ff]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-slate-900 dark:text-themeTextWhite truncate">{p?.name}</p>
                        <BadgeCheck className="h-4 w-4 text-[#67e8f9]" />
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {p?.occupation ? (
                          <span className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-themeGray/60 bg-slate-100 dark:bg-white/5 text-[11px] text-slate-500 dark:text-themeTextGray">{p.occupation}</span>
                        ) : null}
                        {typeof p?.age === "number" && p.age > 0 ? (
                          <span className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-themeGray/60 bg-slate-100 dark:bg-white/5 text-[11px] text-slate-500 dark:text-themeTextGray">Age {p.age}</span>
                        ) : null}
                      </div>
                      {p?.financial_goal ? (
                        <div className="mt-3 rounded-md border border-slate-200 dark:border-themeGray/60 bg-slate-50 dark:bg-[#12151b] p-3 text-slate-700 dark:text-themeTextWhite">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="h-3.5 w-3.5 text-[#b9a9ff]" />
                            <span className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-themeTextGray">Financial goal</span>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-900 dark:text-themeTextWhite">{p.financial_goal}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </aside>

            {/* Financial Context: 2/3 */}
            <section className="md:col-span-2 rounded-xl border border-slate-200 dark:border-themeGray/60 bg-white dark:bg-[#161a20] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="mb-1 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[#b9a9ff]" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-themeTextWhite">Financial Context</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-themeTextGray mb-3">Key constraints and preferences that shape choices in this scenario.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(effective as any).financial_context?.time_horizon ? (
                  <div className="rounded-lg border border-slate-200 dark:border-themeGray/60 bg-slate-50 dark:bg-[#12151b] p-3 text-slate-700 dark:text-themeTextWhite flex items-start gap-2 min-h-[90px] hover:bg-slate-100 dark:hover:bg-[#141821] transition-colors">
                    <Clock className="h-4 w-4 text-[#b9a9ff] mt-0.5" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-themeTextGray">Time horizon</p>
                      <p className="text-sm text-slate-900 dark:text-themeTextWhite">{(effective as any).financial_context.time_horizon}</p>
                    </div>
                  </div>
                ) : null}
                {(effective as any).financial_context?.available_amount ? (
                  <div className="rounded-lg border border-slate-200 dark:border-themeGray/60 bg-slate-50 dark:bg-[#12151b] p-3 text-slate-700 dark:text-themeTextWhite flex items-start gap-2 min-h-[90px] hover:bg-slate-100 dark:hover:bg-[#141821] transition-colors">
                    <IndianRupee className="h-4 w-4 text-[#b9a9ff] mt-0.5" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-themeTextGray">Available amount</p>
                      <p className="text-sm text-slate-900 dark:text-themeTextWhite">{(effective as any).financial_context.available_amount}</p>
                    </div>
                  </div>
                ) : null}
                {(effective as any).financial_context?.risk_tolerance ? (
                  <div className="rounded-lg border border-slate-200 dark:border-themeGray/60 bg-slate-50 dark:bg-[#12151b] p-3 text-slate-700 dark:text-themeTextWhite flex items-start gap-2 min-h-[90px] hover:bg-slate-100 dark:hover:bg-[#141821] transition-colors">
                    <BadgeCheck className="h-4 w-4 text-[#b9a9ff] mt-0.5" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-themeTextGray">Risk tolerance</p>
                      <p className="text-sm text-slate-900 dark:text-themeTextWhite">{(effective as any).financial_context.risk_tolerance}</p>
                    </div>
                  </div>
                ) : null}
                {(effective as any).financial_context?.current_situation ? (
                  <div className="rounded-lg border border-slate-200 dark:border-themeGray/60 bg-slate-50 dark:bg-[#12151b] p-3 text-slate-700 dark:text-themeTextWhite flex items-start gap-2 min-h-[90px] hover:bg-slate-100 dark:hover:bg-[#141821] transition-colors">
                    <ClipboardList className="h-4 w-4 text-[#b9a9ff] mt-0.5" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-themeTextGray">Current situation</p>
                      <p className="text-sm text-slate-900 dark:text-themeTextWhite">{(effective as any).financial_context.current_situation}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 dark:border-themeGray/60 bg-slate-50 dark:bg-[#12151b] p-4">
          <Markdown>{effective?.scenario_md}</Markdown>
        </div>

        {count > 0 && (
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-themeGray/60 bg-white dark:bg-[#161a20]">
            <Accordion type="multiple" value={open} onValueChange={setOpen}>
              {pairs.map((qa: { question: string; answer: string }, i: number) => (
                <AccordionItem key={i} value={`qa-${i}`} className="border-slate-200 dark:border-themeGray/60">
                  <AccordionTrigger className="px-4 py-3 text-left hover:no-underline">
                    <div className="w-full flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-themeGray/40 flex items-center justify-center ring-1 ring-slate-200 dark:ring-white/10">
                          <HelpCircle className="h-4 w-4 text-[#b9a9ff]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-[#b9a9ff]">Question {i + 1}</p>
                          <p className="text-sm md:text-base text-slate-900 dark:text-themeTextWhite break-words">{qa.question}</p>
                        </div>
                      </div>
                      <span className="ml-3 shrink-0 rounded-full border border-slate-200 dark:border-themeGray/60 bg-slate-100 dark:bg-[#0f0f14] px-2 py-0.5 text-[11px] text-slate-500 dark:text-themeTextGray">
                        {open.includes(`qa-${i}`) ? "Hide answer" : "Show answer"}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="rounded-lg border border-slate-200 dark:border-themeGray/60 bg-slate-50 dark:bg-[#12151b] p-4 text-slate-700 dark:text-themeTextWhite">
                      {qa.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Removed legacy Tips/Takeaways sections as per new payload */}
      </div>

      {canEdit && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-white dark:bg-[#161a20] border border-slate-200 dark:border-themeGray/60 text-slate-700 dark:text-themeTextWhite">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-themeTextWhite">Edit Example</DialogTitle>
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
