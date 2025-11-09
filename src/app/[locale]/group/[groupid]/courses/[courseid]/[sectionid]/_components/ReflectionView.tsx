"use client"
import React, { useEffect, useMemo, useState } from "react"
import type { ReflectionBlockPayload } from "@/types/sections"
import { Markdown } from "@/components/global/markdown"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCourseSectionInfo, useGroupRole, useSaveReflection } from "@/hooks/courses"
import ReflectionContentForm from "@/components/form/reflection/index"
import { Lightbulb, Sparkles } from "lucide-react"
import SectionAnchors from "@/components/anchors/section-anchors"

type Props = { payload: ReflectionBlockPayload; sectionid: string; groupid: string; locale?: string; user?: any; initial?: any }

export default function ReflectionView({ payload, sectionid, groupid, locale, user, initial }: Props) {
  const [value, setValue] = useState("")
  const { data } = useCourseSectionInfo(sectionid, locale, initial)
  const { saveReflection, isPending: saving } = useSaveReflection(groupid, sectionid, locale)
  const { canEdit } = useGroupRole(groupid)
  const [editOpen, setEditOpen] = useState(false)
  const effective = (data?.section?.blockPayload as any) ?? payload
  const minChars = typeof effective?.min_chars === "number" ? effective!.min_chars : 20
  const title = (effective as any)?.block_title || "Reflection"
  const typeLabel = ((effective?.reflection_type as string) || "reflection").replace(/_/g, " ")
  const typeBadge = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)
  const samples = Array.isArray(effective?.sample_responses) ? effective!.sample_responses : []
  const ok = useMemo(() => (value?.length || 0) >= minChars, [value, minChars])

  // Prefill from last saved reflection
  useEffect(() => {
    const last = (data as any)?.user?.lastReflection ?? user?.lastReflection
    if (!last?.responseText) return
    setValue(last.responseText)
  }, [user?.lastReflection, (data as any)?.user?.lastReflection])

  return (
    <div className="p-5 md:p-6 space-y-6">
      <SectionAnchors
        moduleId={(data?.section?.Module?.id as string) || undefined}
        anchorIds={Array.isArray((data as any)?.section?.anchorIds) ? (data as any).section.anchorIds : []}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {effective?.reflection_type ? (
            <span className="rounded-full border border-themeGray/60 bg-[#0f0f14] px-3 py-1.5 text-xs md:text-sm text-themeTextGray ring-1 ring-white/5">{typeBadge}</span>
          ) : null}
        </div>
        {canEdit && (
          <Button type="button" className="rounded-md px-3 py-1.5 text-sm text-white bg-[#4F46E5] hover:bg-[#4F46E5]/90 ring-1 ring-[#4F46E5]/30" onClick={() => setEditOpen(true)}>
            Edit section
          </Button>
        )}
      </div>

      <section className="rounded-xl border border-themeGray/60 bg-[#12151b] p-4">
        <Markdown>{effective?.prompt_md}</Markdown>
      </section>

      {effective?.guidance_md ? (
        <div className="rounded-xl overflow-hidden border border-themeGray/60 bg-[#161a20]">
          <Accordion type="single" collapsible>
            <AccordionItem value="guidance" className="border-themeGray/60">
              <AccordionTrigger className="px-4 py-4 hover:no-underline">
                <div className="w-full flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 text-left">
                    <div className="h-8 w-8 rounded-full bg-themeGray/40 flex items-center justify-center ring-1 ring-white/10">
                      <Lightbulb className="h-4 w-4 text-[#b9a9ff]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#b9a9ff]">Helpful Tips</p>
                      <p className="text-sm md:text-base text-white truncate">Guidance</p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-themeTextWhite">
                <Markdown>{effective.guidance_md}</Markdown>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ) : null}

      <section className="rounded-xl border border-themeGray/60 bg-[#161a20] p-4">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={8}
          className="w-full resize-y rounded-lg border border-themeGray/60 bg-[#0f0f14] p-3 text-themeTextWhite placeholder:text-themeTextGray focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/30"
          placeholder="Write your reflection here..."
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={"tracking-wide " + ((value?.length || 0) > minChars ? "text-themeTextGray" : "text-red-400")}>{value?.length || 0} / {minChars}</span>
          <button
            type="button"
            disabled={!ok || saving}
            className={"rounded-md px-3 py-1.5 text-sm font-semibold " + (ok ? "bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white ring-1 ring-[#4F46E5]/30" : "bg-[#0b0b10] text-themeTextGray cursor-not-allowed")}
            onClick={async () => {
              if (!ok) return
              await saveReflection(value)
            }}
          >
            {saving ? "Saving..." : "Save Reflection"}
          </button>
        </div>
      </section>

      {samples.length > 0 && (
        <section className="rounded-xl border border-themeGray/60 bg-[#12151b] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#b9a9ff]" />
            <h3 className="text-sm font-semibold text-white">Sample responses</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {samples.map((s: string, i: number) => (
              <div key={i} className="rounded-lg border border-themeGray/60 bg-[#161a20] p-3 text-themeTextWhite">
                {s}
              </div>
            ))}
          </div>
        </section>
      )}
      {canEdit && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-[#161a20] border border-themeGray/60 text-themeTextWhite">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Reflection</DialogTitle>
            </DialogHeader>
            <ReflectionContentForm
              groupid={groupid}
              sectionid={sectionid}
              locale={locale}
              initial={effective as any}
              onCancel={() => setEditOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
