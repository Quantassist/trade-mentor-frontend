"use client"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useQuizContent } from "@/hooks/courses"
import type { QuizFormValues } from "./schema"
import { useFieldArray } from "react-hook-form"

type Props = {
  groupid: string
  sectionid: string
  locale?: string
  initial: any
  initialTitle?: string
  onCancel?: () => void
}

export default function QuizContentForm({ groupid, sectionid, locale, initial, initialTitle, onCancel }: Props) {
  const { register, control, onUpdateQuiz, isPending } = useQuizContent(sectionid, groupid, initial, locale, { onSuccess: onCancel, initialTitle })

  const items = useFieldArray({ control: control as any, name: "items" as any })

  return (
    <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); onUpdateQuiz(); }} className="space-y-4 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-themeTextWhite">Section title</Label>
          <Input className="bg-[#161a20] border-themeGray/60 text-white" placeholder="Optional title shown above"
            {...register("title")} />
        </div>
        <div className="space-y-2">
          <Label className="text-themeTextWhite">Quiz type</Label>
          <Input className="bg-[#161a20] border-themeGray/60 text-white" placeholder="mcq"
            {...register("quiz_type")} />
        </div>
        <div className="space-y-2">
          <Label className="text-themeTextWhite">Pass threshold (%)</Label>
          <Input type="number" min={0} max={100} className="bg-[#161a20] border-themeGray/60 text-white"
            {...register("pass_threshold", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-themeTextWhite">Questions</Label>
          <Button type="button" variant="secondary" className="bg-[#0f0f14] border border-themeGray/60 text-white"
            onClick={() => (items as any).append({ stem: "", choices: [{ text: "", correct: false, explanation: "" }, { text: "", correct: false, explanation: "" }], rationale: "", difficulty: "", anchor_ids: [] })}>Add question</Button>
        </div>
        <div className="space-y-4">
          {items.fields.map((f, idx) => (
            <QuestionEditor
              key={f.id}
              idx={idx}
              control={control as any}
              register={register as any}
              onRemove={() => items.remove(idx)}
            />
          ))}
        </div>
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

function QuestionEditor({ idx, control, register, onRemove }: { idx: number; control: any; register: any; onRemove: () => void }) {
  const base = `items.${idx}` as const
  const choices = useFieldArray({ control: control as any, name: `${base}.choices` as any })
  const anchors = useFieldArray({ control: control as any, name: `${base}.anchor_ids` as any })
  return (
    <div className="rounded-md border border-themeGray/60 p-3 bg-[#161a20] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#b9a9ff]">Question {idx + 1}</span>
        <Button type="button" variant="ghost" className="text-themeTextGray" onClick={onRemove}>Remove</Button>
      </div>
      <div className="space-y-2">
        <Label className="text-themeTextWhite">Stem</Label>
        <Textarea rows={2} className="bg-[#12151b] border-themeGray/60 text-themeTextWhite" {...register(`${base}.stem`)} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-themeTextWhite">Choices</Label>
          <Button type="button" variant="secondary" className="bg-[#0f0f14] border border-themeGray/60 text-white" onClick={() => (choices as any).append({ text: "", correct: false, explanation: "" })}>Add choice</Button>
        </div>
        <div className="space-y-3">
          {choices.fields.map((c, ci) => (
            <div key={c.id} className="rounded border border-themeGray/60 p-3 bg-[#12151b] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-themeTextGray">Choice {ci + 1}</span>
                <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => choices.remove(ci)}>Remove</Button>
              </div>
              <Input className="bg-[#161a20] border-themeGray/60 text-white" placeholder="Choice text" {...register(`${base}.choices.${ci}.text` as const)} />
              <Textarea rows={2} className="bg-[#161a20] border-themeGray/60 text-themeTextWhite" placeholder="Explanation (optional)" {...register(`${base}.choices.${ci}.explanation` as const)} />
              <div className="flex items-center gap-2">
                <input id={`${base}.choices.${ci}.correct`} type="checkbox" className="h-4 w-4" {...register(`${base}.choices.${ci}.correct` as const)} />
                <Label htmlFor={`${base}.choices.${ci}.correct`} className="text-themeTextWhite">Correct</Label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-themeTextWhite">Why (rationale)</Label>
        <Textarea rows={3} className="bg-[#12151b] border-themeGray/60 text-themeTextWhite" {...register(`${base}.rationale`)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-themeTextWhite">Difficulty</Label>
          <Input className="bg-[#161a20] border-themeGray/60 text-white" placeholder="easy | medium | hard" {...register(`${base}.difficulty`)} />
        </div>
        <div className="space-y-2">
          <Label className="text-themeTextWhite">Anchor IDs</Label>
          <div className="space-y-2">
            {anchors.fields.map((a, ai) => (
              <div key={a.id} className="flex items-center gap-2">
                <Input className="bg-[#161a20] border-themeGray/60 text-white" {...register(`${base}.anchor_ids.${ai}` as const)} />
                <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => anchors.remove(ai)}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" className="bg-[#0f0f14] border border-themeGray/60 text-white" onClick={() => (anchors as any).append("")}>Add</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
