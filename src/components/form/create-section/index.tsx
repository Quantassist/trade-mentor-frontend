"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SECTION_TYPES } from "@/constants/icons"
import { useCreateSectionForm, useEditSectionForm } from "@/hooks/courses"

export const SectionCreateForm = ({ moduleid, groupid }: { moduleid: string, groupid: string }) => {
  const { register, setValue, errors, onCreateSection, isPending } =
    useCreateSectionForm(moduleid, groupid)
  return (
    <form onSubmit={onCreateSection} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">Section name</label>
        <Input {...register("name")} placeholder="e.g. Introduction" />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message as string}</p>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">Section type</label>
        <Select onValueChange={(v) => setValue("typeId", v, { shouldValidate: true })}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {SECTION_TYPES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button disabled={isPending} type="submit" className="w-full">
        Create section
      </Button>
    </form>
  )
}

export const SectionEditForm = ({
  groupid,
  sectionid,
  initialName,
  initialIcon,
}: {
  groupid: string
  sectionid: string
  initialName: string
  initialIcon: string
}) => {
  const { register, setValue, errors, onUpdateSectionSubmit, isPending } =
    useEditSectionForm(groupid, sectionid, initialName, initialIcon)
  return (
    <form onSubmit={onUpdateSectionSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">Section name</label>
        <Input {...register("name")} />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message as string}</p>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">Section type</label>
        <Select onValueChange={(v) => setValue("typeId", v, { shouldValidate: true })}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {SECTION_TYPES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button disabled={isPending} type="submit" className="w-full">
        Save changes
      </Button>
    </form>
  )
}