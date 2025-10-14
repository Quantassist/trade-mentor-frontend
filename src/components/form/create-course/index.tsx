"use client"

import { FormGenerator } from "@/components/global/form-generator"
import { GlassModal } from "@/components/global/glass-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCreateCourse } from "@/hooks/courses"
import { cn, truncateString } from "@/lib/utils"
import { ErrorMessage } from "@hookform/error-message"
import { BadgePlus, Plus, Trash2 } from "lucide-react"
// Link not needed for optimistic card; real list uses buttons/links
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { defaultLocale, locales } from "@/i18n/config"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form"

type CourseCreateProps = {
  groupid: string
  variant?: "card" | "button"
  initial?: any
  trigger?: React.ReactElement
}

// -------- Subcomponents --------
type OutcomesFieldsProps = {
  controlName: "learnOutcomes"
  control: Control<any>
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

const OutcomesFields = ({ controlName, control, register, errors }: OutcomesFieldsProps) => {
  const { fields, append, remove } = useFieldArray({ control, name: controlName })
  return (
    <div className="space-y-2">
      <Label>You will learn</Label>
      <div className="space-y-2">
        {fields.map((f, i) => (
          <div key={f.id} className="flex items-center gap-2">
            <Input
              placeholder={`Outcome ${i + 1}`}
              className="bg-transparent border-themeGray text-themeTextWhite"
              {...register(`${controlName}.${i}`)}
            />
            <Button type="button" variant="ghost" onClick={() => remove(i)} className="text-red-400 hover:text-red-300">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        className="bg-themeGray text-themeTextWhite"
        onClick={() => append("")}
      >
        <Plus className="h-4 w-4 mr-2" /> Add another outcome
      </Button>
      {errors?.learnOutcomes && (
        <p className="text-red-400 mt-1 text-sm">Add at least one learning outcome</p>
      )}
    </div>
  )
}

type FaqFieldsProps = {
  controlName: "faqs"
  control: Control<any>
  register: UseFormRegister<any>
}

const FaqFields = ({ controlName, control, register }: FaqFieldsProps) => {
  const { fields, append, remove } = useFieldArray({ control, name: controlName })
  return (
    <div className="space-y-2">
      <Label>Frequently Asked Questions</Label>
      <div className="space-y-3">
        {fields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              placeholder="Question"
              className="bg-transparent border-themeGray text-themeTextWhite"
              {...register(`${controlName}.${i}.question`)}
            />
            <div className="flex items-center gap-2">
              <Input
                placeholder="Answer"
                className="bg-transparent border-themeGray text-themeTextWhite"
                {...register(`${controlName}.${i}.answer`)}
              />
              <Button type="button" variant="ghost" onClick={() => remove(i)} className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        className="bg-themeGray text-themeTextWhite"
        onClick={() => append({ question: "", answer: "" })}
      >
        <Plus className="h-4 w-4 mr-2" /> Add FAQ
      </Button>
    </div>
  )
}

type MentorsFieldsProps = {
  control: Control<any>
  register: UseFormRegister<any>
  mentorsData: any
  setValue: (name: any, value: any) => void
  watch: any
}

const MentorsFields = ({ control, register, mentorsData, setValue, watch }: MentorsFieldsProps) => {
  const { fields, append, remove, move } = useFieldArray({ control, name: "mentors" })
  const options: { id: string; label: string }[] = Array.isArray(mentorsData?.mentors)
    ? mentorsData.mentors.map((m: any) => ({ id: m.id, label: m.displayName }))
    : []
  const roles = ["PRIMARY", "CO_AUTHOR", "GUEST", "TA"]
  return (
    <div className="space-y-2">
      <Label>Mentors</Label>
      <div className="space-y-3">
        {fields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <Select
              value={watch(`mentors.${i}.mentorId`)}
              onValueChange={(v) => setValue(`mentors.${i}.mentorId`, v)}
            >
              <SelectTrigger className="w-full border-themeGray bg-transparent text-themeTextWhite">
                <SelectValue placeholder="Select mentor" />
              </SelectTrigger>
              <SelectContent className="border-themeGray bg-[#101011] text-themeTextWhite">
                {options.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={watch(`mentors.${i}.role`) || "PRIMARY"}
              onValueChange={(v) => setValue(`mentors.${i}.role`, v)}
            >
              <SelectTrigger className="w-full border-themeGray bg-transparent text-themeTextWhite">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="border-themeGray bg-[#101011] text-themeTextWhite">
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => move(i, Math.max(0, i - 1))}>Up</Button>
              <Button type="button" variant="ghost" className="text-themeTextGray" onClick={() => move(i, Math.min(fields.length - 1, i + 1))}>Down</Button>
              <Button type="button" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        className="bg-themeGray text-themeTextWhite"
        onClick={() => {
          // Always append a new row; user can pick mentor and role afterwards
          append({ mentorId: "", role: "PRIMARY", sortOrder: fields.length })
        }}
      >
        <Plus className="h-4 w-4 mr-2" /> Add mentor
      </Button>
    </div>
  )
}

export const CourseCreate = ({ groupid, variant = "card", initial, trigger }: CourseCreateProps) => {
  const t = useTranslations("courses")
  const {
    onCreateCourse,
    register,
    errors,
    buttonRef,
    variables,
    isPending,
    setValue,
    onPrivacy,
    watch,
    data,
    control,
    mentorsData,
    setTranslations,
  } = useCreateCourse(groupid, initial)
  const isManager = !!(data?.isSuperAdmin || data?.groupOwner || data?.role === "ADMIN")
  const [activeLocale, setActiveLocale] = useState<string>(defaultLocale)
  const [tNames, setTNames] = useState<Record<string, string>>({})
  const [tDescriptions, setTDescriptions] = useState<Record<string, string>>({})
  const [tOutcomes, setTOutcomes] = useState<Record<string, string[]>>({})
  const [tFaqs, setTFaqs] = useState<Record<string, { question: string; answer: string }[]>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    const payloads = (locales as readonly string[])
      .filter((l) => l !== defaultLocale)
      .map((l) => ({
        locale: l,
        name: tNames[l] || undefined,
        description: tDescriptions[l] || undefined,
        learnOutcomes: (tOutcomes[l] || []).filter(Boolean),
        faqs: (tFaqs[l] || []).filter((f) => (f?.question || "").trim() || (f?.answer || "").trim()),
      }))
    setTranslations(payloads)
  }, [tNames, tDescriptions, tOutcomes, tFaqs, setTranslations])
  useEffect(() => {
    if (initial?.thumbnail) {
      // best-effort preview for existing thumbnail
      setImagePreview(`https://ucarecdn.com/${initial.thumbnail}/-/scale_crop/320x180/center/-/format/auto/`)
    }
  }, [initial?.thumbnail])
  useEffect(() => {
    // Prefill translation tab data from initial.translations
    if (Array.isArray(initial?.translations) && initial.translations.length > 0) {
      const nameMap: Record<string, string> = {}
      const descMap: Record<string, string> = {}
      const outMap: Record<string, string[]> = {}
      const faqMap: Record<string, { question: string; answer: string }[]> = {}
      for (const t of initial.translations) {
        if (!t?.locale || t.locale === defaultLocale) continue
        const l = t.locale
        nameMap[l] = t.name ?? ""
        // backend returns `description`; older code may use `descriptionHtml/Json`, we only read `description`
        const faqAny = (t as any).faqs ?? (t as any).faq
        descMap[l] = (t as any).description ?? ""
        outMap[l] = (t as any).learnOutcomes ?? []
        faqMap[l] = Array.isArray(faqAny) ? faqAny : []
      }
      setTNames(nameMap)
      setTDescriptions(descMap)
      setTOutcomes(outMap)
      setTFaqs(faqMap)
    }
  }, [initial?.translations])

  return (
    <>
      <GlassModal
          title={initial ? "Edit course" : "Create a new course"}
          description={initial ? "Update course for your community" : "Add a new form for your community"}
          trigger={
            trigger ??
            (variant === "button" ? (
              <Button size="sm" variant="secondary" className="bg-themeGray text-themeTextWhite">
                {initial ? t("editCourseButton") : t("createCourseButton")}
              </Button>
            ) : (
              <span>
                <Card className="bg-[#101011] border-themeGray hover:bg-themeBlack transition duration-100 cursor-pointer border-dashed aspect-square rounded-xl">
                  <CardContent className="opacity-20 flex gap-x-2 p-0 justify-center items-center h-full">
                    <BadgePlus />
                    <p>{initial ? "Edit Course" : "Create Course"}</p>
                  </CardContent>
                </Card>
              </span>
            ))
          }
        >
          <form
            onSubmit={onCreateCourse}
            className="flex flex-col gap-y-5 mt-5 max-h-[70vh] overflow-y-auto pr-2"
          >
            {/* Locale tabs for localized fields */}
            <Tabs value={activeLocale} onValueChange={setActiveLocale} className="w-full">
              <TabsList>
                {(locales as readonly string[]).map((l) => (
                  <TabsTrigger key={l} value={l} className="capitalize">
                    {l}
                  </TabsTrigger>
                ))}
              </TabsList>
              {(locales as readonly string[]).map((l) => (
                <TabsContent key={l} value={l} className="space-y-4">
                  {l === defaultLocale ? (
                    <>
                      <FormGenerator
                        register={register}
                        errors={errors}
                        name="name"
                        placeholder="Add your course name"
                        inputType="input"
                        type="text"
                        label={`Course Name (${l})`}
                      />
                      <FormGenerator
                        register={register}
                        errors={errors}
                        name="description"
                        placeholder="Add your course description"
                        inputType="textarea"
                        type="text"
                        label={`Course Description (${l})`}
                      />
                      {/* Learning Outcomes */}
                      <OutcomesFields controlName="learnOutcomes" control={control} register={register} errors={errors} />
                      {/* FAQs */}
                      <FaqFields controlName="faqs" control={control} register={register} />
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>{`Course Name (${l})`}</Label>
                        <Input
                          placeholder={`Add your course name`}
                          className="bg-transparent outline-none border-themeGray"
                          value={tNames[l] ?? ""}
                          onChange={(e) => setTNames((prev) => ({ ...prev, [l]: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{`Course Description (${l})`}</Label>
                        <Textarea
                          placeholder={`Add your course description`}
                          className="bg-transparent outline-none border-themeGray min-h-24"
                          value={tDescriptions[l] ?? ""}
                          onChange={(e) => setTDescriptions((prev) => ({ ...prev, [l]: e.target.value }))}
                        />
                      </div>
                      {/* Localized Outcomes */}
                      <div className="space-y-2">
                        <Label>You will learn ({l})</Label>
                        <div className="space-y-2">
                          {(tOutcomes[l] ?? [""]).map((val, i) => (
                            <div key={`${l}-out-${i}`} className="flex items-center gap-2">
                              <Input
                                placeholder={`Outcome ${i + 1}`}
                                className="bg-transparent border-themeGray text-themeTextWhite"
                                value={val}
                                onChange={(e) => {
                                  setTOutcomes((prev) => {
                                    const arr = [...(prev[l] ?? [""])]
                                    arr[i] = e.target.value
                                    return { ...prev, [l]: arr }
                                  })
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                  setTOutcomes((prev) => ({
                                    ...prev,
                                    [l]: (prev[l] ?? [""]).filter((_, idx) => idx !== i),
                                  }))
                                }
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          className="bg-themeGray text-themeTextWhite"
                          onClick={() => setTOutcomes((prev) => ({ ...prev, [l]: [...(prev[l] ?? []), ""] }))}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add another outcome
                        </Button>
                      </div>
                      {/* Localized FAQs */}
                      <div className="space-y-2">
                        <Label>FAQs ({l})</Label>
                        <div className="space-y-3">
                          {(tFaqs[l] ?? []).map((f, i) => (
                            <div key={`${l}-faq-${i}`} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Input
                                placeholder="Question"
                                className="bg-transparent border-themeGray text-themeTextWhite"
                                value={f?.question ?? ""}
                                onChange={(e) =>
                                  setTFaqs((prev) => {
                                    const arr = [...(prev[l] ?? [])]
                                    const at = arr[i] ?? { question: "", answer: "" }
                                    arr[i] = { ...at, question: e.target.value }
                                    return { ...prev, [l]: arr }
                                  })
                                }
                              />
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Answer"
                                  className="bg-transparent border-themeGray text-themeTextWhite"
                                  value={f?.answer ?? ""}
                                  onChange={(e) =>
                                    setTFaqs((prev) => {
                                      const arr = [...(prev[l] ?? [])]
                                      const at = arr[i] ?? { question: "", answer: "" }
                                      arr[i] = { ...at, answer: e.target.value }
                                      return { ...prev, [l]: arr }
                                    })
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() =>
                                    setTFaqs((prev) => ({
                                      ...prev,
                                      [l]: (prev[l] ?? []).filter((_, idx) => idx !== i),
                                    }))
                                  }
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          className="bg-themeGray text-themeTextWhite"
                          onClick={() =>
                            setTFaqs((prev) => ({
                              ...prev,
                              [l]: [...(prev[l] ?? []), { question: "", answer: "" }],
                            }))
                          }
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add FAQ
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>
            {/* Level */}
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={watch("level")} onValueChange={(v) => setValue("level", v)}>
                <SelectTrigger className="w-full border-themeGray bg-transparent text-themeTextWhite">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="border-themeGray bg-[#101011] text-themeTextWhite">
                  <SelectItem value="All levels">All levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <ErrorMessage errors={errors} name={"level"} render={({ message }) => (
                <p className="text-red-400 mt-1">{message}</p>
              )} />
            </div>
            {/* Mentors (multi) */}
            {mentorsData?.status === 200 && (
              <MentorsFields control={control} register={register} mentorsData={mentorsData} setValue={setValue} watch={watch} />
            )}
            <div className="grid gap-2 grid-cols-3">
              <Label className="col-span-3">Course Permissions</Label>
              <Label htmlFor="r1">
                <span>
                  <Input
                    className="hidden"
                    type="radio"
                    {...register("privacy")}
                    id="r1"
                    value={"open"}
                  />
                  <Card
                    className={cn(
                      onPrivacy === "open"
                        ? "bg-themeBlack"
                        : " bg-transparent",
                      "py-5 flex justify-center border-themeGray font-bold text-themeTextGray cursor-pointer",
                    )}
                  >
                    Open
                  </Card>
                </span>
              </Label>
              <Label htmlFor="r2">
                <span>
                  <Input
                    className="hidden"
                    type="radio"
                    {...register("privacy")}
                    id="r2"
                    value={"level-unlock"}
                  />
                  <Card
                    className={cn(
                      onPrivacy === "level-unlock" // TODO: Implement level unlock feature
                        ? "bg-themeBlack"
                        : " bg-transparent",
                      "py-5 flex justify-center border-themeGray font-bold text-themeTextGray cursor-pointer",
                    )}
                  >
                    Level Unlock
                  </Card>
                </span>
              </Label>
              <Label htmlFor="r3">
                <span>
                  <Input
                    className="hidden"
                    type="radio"
                    {...register("privacy")}
                    id="r3"
                    value={"private"}
                  />
                  <Card
                    className={cn(
                      onPrivacy === "private"
                        ? "bg-themeBlack"
                        : "bg-transparent",
                      "py-5 flex justify-center border-themeGray font-bold text-themeTextGray cursor-pointer",
                    )}
                  >
                    Private
                  </Card>
                </span>
              </Label>
              <div className="col-span-3">
                <ErrorMessage
                  errors={errors}
                  name={"privacy"}
                  render={({ message }) => (
                    <p className="text-red-400 mt-2">
                      {message === "Required" ? "" : message}
                    </p>
                  )}
                />
              </div>
            </div>
            <Label htmlFor="course-image">
              <span>
                {(() => {
                  const imageReg = register("image")
                  return (
                    <Input
                      type="file"
                      id="course-image"
                      className="hidden"
                      {...imageReg}
                      onChange={(e) => {
                        imageReg.onChange(e)
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) setImagePreview(URL.createObjectURL(file))
                        else setImagePreview(null)
                      }}
                    />
                  )
                })()}
                <Card className="bg-transparent text-themeTextGray flex justify-center items-center border-themeGray hover:bg-themeBlack transition duration-100 cursor-pointer border-dashed aspect-video rounded-xl">
                  Upload Image
                </Card>
              </span>
              <ErrorMessage
                errors={errors}
                name={"image"}
                render={({ message }) => (
                  <p className="text-red-400 mt-2">
                    {message === "Required" ? "" : message}
                  </p>
                )}
              />
            </Label>
            {imagePreview && (
              <div className="relative h-24 w-40 rounded-lg overflow-hidden ring-1 ring-white/5">
                <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                id="publish-mode"
                checked={!!watch("published")}
                onCheckedChange={(e) => setValue("published", e)}
                className="data-[state=checked]:bg-themeTextGray data-[state=unchecked]:bg-themeGray"
              />
              <Label htmlFor="publish-mode">Publish Course</Label>
            </div>
            <Button type="submit" className="w-full bg-transparent border-themeGray" variant="outline">
              {initial ? "Save" : "Create"}
            </Button>
            <DialogClose asChild>
              <Button type="button" ref={buttonRef} className="hidden">
                close modal
              </Button>
            </DialogClose>
          </form>
        </GlassModal>
        {isPending && variables && !initial && (
          <Card className="bg-[#111213] border-themeGray rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="relative h-24 w-40 shrink-0 rounded-lg overflow-hidden ring-1 ring-white/5">
                <img
                  src={URL.createObjectURL(variables.image[0])}
                  alt="cover"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold truncate">{variables.name}</h3>
                    <p className="text-sm text-themeTextGray truncate">{truncateString(variables.description)}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-themeTextGray">
                    <span>0% complete</span>
                  </div>
                  <div className="mt-1">
                    <Progress value={0} className="h-2 bg-themeGray" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Button size="sm" className="px-4" disabled>
                    Start course
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-themeGray text-themeTextWhite" disabled>
                    Course overview
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </>
    )
}
