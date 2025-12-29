"use client"
import { Markdown } from "@/components/global/markdown"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CaseStudyContentForm from "@/components/form/case-study"
import { useCourseSectionInfo, useGroupRole } from "@/hooks/courses"
import type { CaseStudyBlockPayload } from "@/types/sections"
import { CalendarDays, CheckCircle2, Landmark, ListTree, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import SectionAnchors from "@/components/anchors/section-anchors"

type Props = { payload: CaseStudyBlockPayload; sectionid: string; groupid: string; locale?: string; initial?: any }

export default function CaseStudyView({ payload, sectionid, groupid, locale, initial }: Props) {
  const { canEdit } = useGroupRole(groupid)
  const [editOpen, setEditOpen] = useState(false)
  // Always render from query so UI reflects invalidation without full refresh
  const { data } = useCourseSectionInfo(sectionid, locale, initial)
  const effectivePayload = (data?.section?.blockPayload as any) ?? payload
  const dataPoints = Array.isArray(effectivePayload?.data_points) ? effectivePayload!.data_points : []
  const steps = Array.isArray(effectivePayload?.timeline_steps) ? effectivePayload!.timeline_steps : []
  const learn = Array.isArray(effectivePayload?.learning_points) ? effectivePayload!.learning_points : []
  const leftItems = useMemo(() => [
    { id: "background", label: "Background", content: effectivePayload?.background_md },
    { id: "analysis", label: "Analysis", content: effectivePayload?.analysis_md },
    { id: "decision", label: "Decision", content: effectivePayload?.decision_md },
    { id: "outcome", label: "Outcome", content: effectivePayload?.outcome_md },
  ], [effectivePayload])
  const allIds = useMemo(() => leftItems.map(x => x.id), [leftItems])
  const [open, setOpen] = useState<string[]>(["background", "analysis", "decision", "outcome"]) 
  const moduleId = (data?.section?.Module?.id as string) || undefined
  const anchorIds = Array.isArray((data as any)?.section?.anchorIds) ? (data as any).section.anchorIds : []

  return (
    <>
    <div className="p-5 md:p-6">
      <SectionAnchors moduleId={moduleId} anchorIds={anchorIds} className="mb-4" />
      {canEdit && (
        <div className="mb-5 flex justify-end">
          <Button type="button" className="rounded-md px-3 py-1.5 text-sm text-white bg-[#4F46E5] hover:bg-[#4F46E5]/90 ring-1 ring-[#4F46E5]/30"
            onClick={() => setEditOpen(true)}>
            Edit section
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl overflow-hidden  bg-white dark:bg-[#161a20]">
            <Accordion type="multiple" value={open} onValueChange={setOpen}>
              {leftItems.map((it) => (
                <AccordionItem key={it.id} value={it.id} className="border-slate-200 dark:border-themeGray/60">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline">
                    <div className="w-full flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 text-left">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-themeGray/40 flex items-center justify-center ring-1 ring-slate-200 dark:ring-white/10">
                          <ListTree className="h-4 w-4 text-[#b9a9ff]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm md:text-base text-slate-900 dark:text-themeTextWhite truncate">{it.label}</p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="rounded-lg  bg-slate-50 dark:bg-[#12151b] p-4 text-slate-700 dark:text-themeTextWhite">
                      <Markdown>{it.content}</Markdown>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {learn.length > 0 && (
            <section className="rounded-xl  bg-white dark:bg-[#161a20] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[#b9a9ff]" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-themeTextWhite">Key Learnings</h3>
              </div>
              <ul className="space-y-2">
                {learn.map((pt: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-themeTextWhite">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-[#b9a9ff]" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-4 h-max">
          {dataPoints.length > 0 && (
            <div className="rounded-xl  bg-white dark:bg-[#161a20] p-4">
              <div className="flex items-center gap-2 mb-2">
                <ListTree className="h-5 w-5 text-[#b9a9ff]" />
                <h4 className="text-base md:text-lg font-semibold text-slate-900 dark:text-themeTextWhite">Key Data Points</h4>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-themeTextWhite">
                {dataPoints.map((d: string, i: number) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          {steps.length > 0 && (
            <div className="rounded-xl  bg-white dark:bg-[#161a20] p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-5 w-5 text-[#b9a9ff]" />
                <h4 className="text-base md:text-lg font-semibold text-slate-900 dark:text-themeTextWhite">Timeline</h4>
              </div>
              <div className="relative">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-300 dark:bg-white" />
                <ul className="space-y-4">
                  {steps.map((s: any, i: number) => (
                    <li key={i} className="relative pl-8">
                      <div className="absolute left-0 top-3 h-3 w-3 rounded-full bg-[#b9a9ff]" />
                      <div className="rounded-md  bg-slate-50 dark:bg-[#12151b] p-3 text-slate-700 dark:text-themeTextWhite shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                        {s?.date_period ? (
                          <div className="text-xs text-[#b9a9ff] mb-1">{s.date_period}</div>
                        ) : null}
                        <div className="text-slate-700 dark:text-themeTextWhite">{s?.event_description}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {effectivePayload?.sebi_context && (
            <div className="rounded-xl  bg-slate-50 dark:bg-[#12151b] p-4">
              <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-themeTextWhite">
                <Landmark className="h-5 w-5 text-[#b9a9ff]" />
                <h4 className="text-base md:text-lg font-semibold text-slate-900 dark:text-themeTextWhite">SEBI Context</h4>
              </div>
              <div className="text-slate-600 dark:text-themeTextWhite/90">
                {effectivePayload.sebi_context}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
    {canEdit && (
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white dark:bg-[#161a20]  text-slate-700 dark:text-themeTextWhite">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-themeTextWhite">Edit Case Study</DialogTitle>
          </DialogHeader>
          <CaseStudyContentForm
            groupid={groupid}
            sectionid={sectionid}
            locale={locale}
            initial={effectivePayload as any}
            initialTitle={data?.section?.name as string}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    )}
    </>
  )
}
