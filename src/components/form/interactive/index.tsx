"use client"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useInteractiveContent } from "@/hooks/courses"

export default function InteractiveContentForm({
  groupid,
  sectionid,
  locale,
  initialHtml,
  onCancel,
}: {
  groupid: string
  sectionid: string
  locale?: string
  initialHtml?: string
  onCancel?: () => void
}) {
  const { register, onUpdateInteractive, isPending } = useInteractiveContent(
    sectionid,
    groupid,
    initialHtml,
    locale,
    { onSuccess: onCancel },
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onUpdateInteractive()
      }}
      className="space-y-4 pb-20"
    >
      <div className="space-y-2">
        <Label className="text-themeTextWhite">HTML content</Label>
        <Textarea
          rows={16}
          className="bg-[#12151b] border-themeGray/60 text-themeTextWhite font-mono"
          placeholder="Paste your sanitized HTML here"
          {...register("html_content")}
        />
      </div>

      <DialogFooter className="sticky bottom-0 left-0 right-0 bg-[#161a20] border-t border-themeGray/60 pt-3">
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
