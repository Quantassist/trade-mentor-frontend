"use client"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useExampleContent } from "@/hooks/courses"
import type { ExampleFormValues } from "./schema"
import { useFieldArray } from "react-hook-form"

type Props = {
  groupid: string
  sectionid: string
  locale?: string
  initial: any
  onCancel?: () => void
}

export default function ExampleContentForm({ groupid, sectionid, locale, initial, onCancel }: Props) {
  const { register, control, onUpdateExample, isPending } = useExampleContent(sectionid, groupid, initial, locale, { onSuccess: onCancel })

  const qaPairs = useFieldArray({ control: control as any, name: "qa_pairs" as any })
  const takeaways = useFieldArray({ control: control as any, name: "takeaways" as any })

  return (
    <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); onUpdateExample(); }} className="space-y-4 pb-24">
      <div className="space-y-2">
        <Label className="text-themeTextWhite">Scenario title</Label>
        <Input className="bg-[#161a20] border-themeGray/60 text-white" placeholder="Optional"
          {...register("scenario_title")} />
      </div>

      <div className="space-y-2">
        <Label className="text-themeTextWhite">Scenario (Markdown)</Label>
        <Textarea rows={6} className="bg-[#12151b] border-themeGray/60 text-themeTextWhite" {...register("scenario_md")} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-themeTextWhite">Q&A Pairs</Label>
          <Button type="button" variant="secondary" className="bg-[#0f0f14] border border-themeGray/60 text-white"
            onClick={() => (qaPairs as any).append({ question: "", answer: "" })}>Add pair</Button>
        </div>
        <div className="space-y-4">
          {qaPairs.fields.map((f, i) => (
            <div key={f.id} className="rounded-md border border-themeGray/60 p-3 bg-[#161a20] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#b9a9ff]">Question {i + 1}</span>
                <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => qaPairs.remove(i)}>Remove</Button>
              </div>
              <Input className="bg-[#12151b] border-themeGray/60 text-white" placeholder="Question"
                {...register(`qa_pairs.${i}.question` as const)} />
              <Textarea rows={3} className="bg-[#12151b] border-themeGray/60 text-themeTextWhite" placeholder="Answer"
                {...register(`qa_pairs.${i}.answer` as const)} />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-themeTextWhite">Tips (Markdown)</Label>
        <Textarea rows={4} className="bg-[#12151b] border-themeGray/60 text-themeTextWhite" {...register("tips_md")} />
      </div>

      <div className="space-y-2">
        <Label className="text-themeTextWhite">Key Takeaways</Label>
        <div className="space-y-2">
          {takeaways.fields.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2">
              <Input className="bg-[#161a20] border-themeGray/60 text-white" {...register(`takeaways.${i}` as const)} />
              <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => takeaways.remove(i)}>Remove</Button>
            </div>
          ))}
          <Button type="button" variant="secondary" className="bg-[#0f0f14] border border-themeGray/60 text-white" onClick={() => (takeaways as any).append("")}>Add</Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input id="indian_context" type="checkbox" className="h-4 w-4" {...register("indian_context")} />
        <Label htmlFor="indian_context" className="text-themeTextWhite">Indian context</Label>
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
