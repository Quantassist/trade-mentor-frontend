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
        <Label className="text-themeTextWhite">Section title</Label>
        <Input className="bg-[#161a20] border-themeGray/60 text-white" placeholder="Optional"
          {...register("title")} />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-themeTextWhite">Background (Markdown)</Label>
          <Textarea rows={6} className="bg-[#12151b] border-themeGray/60 text-themeTextWhite" {...register("background_md")} />
        </div>
        <div className="space-y-2">
          <Label className="text-themeTextWhite">Analysis (Markdown)</Label>
          <Textarea rows={6} className="bg-[#12151b] border-themeGray/60 text-themeTextWhite" {...register("analysis_md")} />
        </div>
        <div className="space-y-2">
          <Label className="text-themeTextWhite">Decision (Markdown)</Label>
          <Textarea rows={6} className="bg-[#12151b] border-themeGray/60 text-themeTextWhite" {...register("decision_md")} />
        </div>
        <div className="space-y-2">
          <Label className="text-themeTextWhite">Outcome (Markdown)</Label>
          <Textarea rows={6} className="bg-[#12151b] border-themeGray/60 text-themeTextWhite" {...register("outcome_md")} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-themeTextWhite">Key Data Points</Label>
          <div className="space-y-2">
            {dataPoints.fields.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <Input className="bg-[#161a20] border-themeGray/60 text-white" {...register(`data_points.${i}` as const)} />
                <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => dataPoints.remove(i)}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" className="bg-[#0f0f14] border border-themeGray/60 text-white" onClick={() => (dataPoints as any).append("")}>Add</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-themeTextWhite">Timeline Steps</Label>
          <div className="space-y-2">
            {timeline.fields.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <Input className="bg-[#161a20] border-themeGray/60 text-white" {...register(`timeline_steps.${i}` as const)} />
                <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => timeline.remove(i)}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" className="bg-[#0f0f14] border border-themeGray/60 text-white" onClick={() => (timeline as any).append("")}>Add</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-themeTextWhite">Learning Points</Label>
          <div className="space-y-2">
            {learnings.fields.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <Input className="bg-[#161a20] border-themeGray/60 text-white" {...register(`learning_points.${i}` as const)} />
                <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => learnings.remove(i)}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" className="bg-[#0f0f14] border border-themeGray/60 text-white" onClick={() => (learnings as any).append("")}>Add</Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-themeTextWhite">SEBI Context (Markdown)</Label>
        <Textarea rows={4} className="bg-[#12151b] border-themeGray/60 text-themeTextWhite" {...register("sebi_context")} />
      </div>

      <DialogFooter className="sticky bottom-0 left-0 right-0 bg-[#161a20] border-t border-themeGray/60 pt-3">
        <Button type="button" variant="ghost" className="text-themeTextGray" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  )
}
