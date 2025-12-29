"use client"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCaseStudyContent } from "@/hooks/courses"
import type { CaseStudyFormValues } from "./schema"
import { useFieldArray } from "react-hook-form"

type Props = {
  groupid: string
  sectionid: string
  locale?: string
  initial: any
  initialTitle?: string
  onCancel?: () => void
}

export default function CaseStudyContentForm({ groupid, sectionid, locale, initial, initialTitle, onCancel }: Props) {
  const { register, control, errors, onUpdateCaseStudy, isPending } = useCaseStudyContent(sectionid, groupid, initial, locale, { onSuccess: onCancel, initialTitle })

  // Casting control to any to avoid react-hook-form generic mismatch issues
  const dataPoints = useFieldArray({ control: control as any, name: "data_points" as any })
  const timeline = useFieldArray({ control: control as any, name: "timeline_steps" as any })
  const learnings = useFieldArray({ control: control as any, name: "learning_points" as any })

  return (
    <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); onUpdateCaseStudy(); }} className="space-y-4 pb-24">
      <div className="space-y-2">
        <Label className="text-slate-900 dark:text-themeTextWhite">Section title</Label>
        <Input className="bg-white dark:bg-[#161a20] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" placeholder="Optional"
          {...register("title")} />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-900 dark:text-themeTextWhite">Background (Markdown)</Label>
          <Textarea rows={6} className="bg-slate-50 dark:bg-[#12151b] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" {...register("background_md")} />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-900 dark:text-themeTextWhite">Analysis (Markdown)</Label>
          <Textarea rows={6} className="bg-slate-50 dark:bg-[#12151b] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" {...register("analysis_md")} />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-900 dark:text-themeTextWhite">Decision (Markdown)</Label>
          <Textarea rows={6} className="bg-slate-50 dark:bg-[#12151b] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" {...register("decision_md")} />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-900 dark:text-themeTextWhite">Outcome (Markdown)</Label>
          <Textarea rows={6} className="bg-slate-50 dark:bg-[#12151b] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" {...register("outcome_md")} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-900 dark:text-themeTextWhite">Key Data Points</Label>
          <div className="space-y-2">
            {dataPoints.fields.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <Input className="bg-white dark:bg-[#161a20] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" {...register(`data_points.${i}` as const)} />
                <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => dataPoints.remove(i)}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" className="bg-slate-100 dark:bg-[#0f0f14]  text-slate-900 dark:text-themeTextWhite" onClick={() => (dataPoints as any).append("")}>Add</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-900 dark:text-themeTextWhite">Timeline Steps</Label>
          <div className="space-y-3">
            {timeline.fields.map((f, i) => (
              <div key={f.id} className="rounded-md  bg-white dark:bg-[#13161c] p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="md:col-span-1">
                    <Label className="text-slate-600 dark:text-themeTextGray">Date/Period</Label>
                    <Input
                      className="mt-1 bg-slate-50 dark:bg-[#161a20] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite"
                      {...register(`timeline_steps.${i}.date_period` as const)}
                      placeholder="e.g., Jan 2020 - Mar 2021"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-600 dark:text-themeTextGray">Event Description</Label>
                    <Textarea
                      rows={3}
                      className="mt-1 bg-slate-50 dark:bg-[#161a20] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite"
                      {...register(`timeline_steps.${i}.event_description` as const)}
                      placeholder="Describe what happened in this period"
                    />
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => timeline.remove(i)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="bg-slate-100 dark:bg-[#0f0f14]  text-slate-900 dark:text-themeTextWhite"
              onClick={() => (timeline as any).append({ date_period: "", event_description: "" })}
            >
              Add
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-900 dark:text-themeTextWhite">Learning Points</Label>
          <div className="space-y-2">
            {learnings.fields.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <Input className="bg-white dark:bg-[#161a20] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" {...register(`learning_points.${i}` as const)} />
                <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => learnings.remove(i)}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" className="bg-slate-100 dark:bg-[#0f0f14]  text-slate-900 dark:text-themeTextWhite" onClick={() => (learnings as any).append("")}>Add</Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-900 dark:text-themeTextWhite">SEBI Context (Markdown)</Label>
        <Textarea rows={4} className="bg-slate-50 dark:bg-[#12151b] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" {...register("sebi_context")} />
      </div>

      <DialogFooter className="sticky bottom-0 left-0 right-0 bg-white dark:bg-[#161a20] border-t border-slate-200 dark:border-themeGray/60 pt-3">
        <Button type="button" variant="ghost" className="text-themeTextGray" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  )
}
