"use client"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useInteractiveReactContent } from "@/hooks/courses"
import { useMemo, useState } from "react"

export default function InteractiveRunnerForm({
  groupid,
  sectionid,
  locale,
  initial,
  onCancel,
}: {
  groupid: string
  sectionid: string
  locale?: string
  initial?: { code?: string; meta?: any }
  onCancel?: () => void
}) {
  const initialAllowed = useMemo(
    () => (Array.isArray(initial?.meta?.allowed_libraries) ? initial?.meta?.allowed_libraries : [] as string[]),
    [initial?.meta?.allowed_libraries],
  )
  const [allowedText, setAllowedText] = useState<string>(initialAllowed.join(", "))

  const { register, onUpdateInteractiveRunnerSubmit, isPending, setValue } = useInteractiveReactContent(
    sectionid,
    groupid,
    { code: initial?.code, meta: initial?.meta },
    locale,
    { onSuccess: onCancel },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const libs = allowedText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    setValue("allowed_libraries", libs as any)
    onUpdateInteractiveRunnerSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-20">
      <div className="space-y-2">
        <Label className="text-slate-900 dark:text-themeTextWhite">React component code (TSX/JSX)</Label>
        <Textarea
          rows={18}
          className="bg-slate-50 dark:bg-[#12151b] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite font-mono"
          placeholder={`() => {\n  return <div>Hello {` + "${locale}" + `}</div>\n}`}
          {...register("code")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-900 dark:text-themeTextWhite">Allowed libraries (comma separated)</Label>
          <Input
            className="bg-slate-50 dark:bg-[#12151b] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite"
            placeholder="lucide-react, dayjs, classnames"
            value={allowedText}
            onChange={(e) => setAllowedText(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-900 dark:text-themeTextWhite">Scope config (JSON)</Label>
          <Textarea
            rows={6}
            className="bg-slate-50 dark:bg-[#12151b] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite font-mono"
            placeholder='{"currency":"INR"}'
            {...register("scope_config")}
          />
        </div>
      </div>

      <DialogFooter className="sticky bottom-0 left-0 right-0 bg-white dark:bg-[#161a20] border-t border-slate-200 dark:border-themeGray/60 pt-3">
        <Button type="button" variant="ghost" className="text-themeTextGray" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  )
}
