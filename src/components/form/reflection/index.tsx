"use client"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useReflectionContent } from "@/hooks/courses"
import { useFieldArray } from "react-hook-form"

type Props = {
  groupid: string
  sectionid: string
  locale?: string
  initial: any
  onCancel?: () => void
}

export default function ReflectionContentForm({ groupid, sectionid, locale, initial, onCancel }: Props) {
  const { register, control, onUpdateReflection, isPending } = useReflectionContent(sectionid, groupid, initial, locale, { onSuccess: onCancel })

  const samples = useFieldArray({ control: control as any, name: "sample_responses" as any })

  return (
    <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); onUpdateReflection(); }} className="space-y-4 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-900 dark:text-themeTextWhite">Reflection type</Label>
          <Input className="bg-white dark:bg-[#161a20] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" placeholder="short | long" {...register("reflection_type")} />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-900 dark:text-themeTextWhite">Minimum characters</Label>
          <Input type="number" min={0} className="bg-white dark:bg-[#161a20] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" {...register("min_chars", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-900 dark:text-themeTextWhite">Prompt</Label>
        <Textarea rows={5} className="bg-slate-50 dark:bg-[#12151b] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" {...register("prompt_md")} />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-900 dark:text-themeTextWhite">Guidance</Label>
        <Textarea rows={4} className="bg-slate-50 dark:bg-[#12151b] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" {...register("guidance_md")} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-slate-900 dark:text-themeTextWhite">Sample responses</Label>
          <Button type="button" variant="secondary" className="bg-slate-100 dark:bg-[#0f0f14] border border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" onClick={() => (samples as any).append("")}>Add sample</Button>
        </div>
        <div className="space-y-2">
          {samples.fields.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2">
              <Input className="bg-white dark:bg-[#161a20] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite" {...register(`sample_responses.${i}` as const)} />
              <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => samples.remove(i)}>Remove</Button>
            </div>
          ))}
        </div>
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
