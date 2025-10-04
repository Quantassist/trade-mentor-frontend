"use client"

import { FormGenerator } from "@/components/global/form-generator"
import { GlassModal } from "@/components/global/glass-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCreateCourse } from "@/hooks/courses"
import { cn, truncateString } from "@/lib/utils"
import { ErrorMessage } from "@hookform/error-message"
import { BadgePlus, Plus, Trash2 } from "lucide-react"
// Link not needed for optimistic card; real list uses buttons/links
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { locales, defaultLocale } from "@/i18n/config"
import { useEffect, useState } from "react"

type CourseCreateProps = {
  groupid: string
  variant?: "card" | "button"
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

export const CourseCreate = ({ groupid, variant = "card" }: CourseCreateProps) => {
  const {
    onCreateCourse,
    register,
    errors,
    buttonRef,
    variables,
    isPending,
    setValue,
    onPrivacy,
    data,
    control,
    mentorsData,
    setTranslations,
  } = useCreateCourse(groupid)
  const isManager = !!(data?.isSuperAdmin || data?.groupOwner || data?.role === "ADMIN")
  const [activeLocale, setActiveLocale] = useState<string>(defaultLocale)
  const [tNames, setTNames] = useState<Record<string, string>>({})
  const [tDescriptions, setTDescriptions] = useState<Record<string, string>>({})
  const [tOutcomes, setTOutcomes] = useState<Record<string, string[]>>({})
  const [tFaqs, setTFaqs] = useState<Record<string, { question: string; answer: string }[]>>({})

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
  if (data?.groupOwner) {
    return (
      <>
        <GlassModal
          title="Create a new course"
          description="Add a new form for your community"
          trigger={
            variant === "button" ? (
              <Button size="sm" variant="secondary" className="bg-themeGray text-themeTextWhite">
                Create Course
              </Button>
            ) : (
              <span>
                <Card className="bg-[#101011] border-themeGray hover:bg-themeBlack transition duration-100 cursor-pointer border-dashed aspect-square rounded-xl">
                  <CardContent className="opacity-20 flex gap-x-2 p-0 justify-center items-center h-full">
                    <BadgePlus />
                    <p>Create Course</p>
                  </CardContent>
                </Card>
              </span>
            )
          }
        >
          <form
            onSubmit={onCreateCourse}
            className="flex flex-col gap-y-5 mt-5 max-h-[70vh] overflow-y-auto pr-2"
          >
            <FormGenerator
              register={register}
              errors={errors}
              name="name"
              placeholder="Add your course name"
              inputType="input"
              type="text"
              label="Course Name"
            />
            <FormGenerator
              register={register}
              errors={errors}
              name="description"
              placeholder="Add your course description"
              inputType="textarea"
              type="text"
              label="Course Description"
            />
            {/* Level */}
            <div className="space-y-2">
              <Label>Level</Label>
              <Select onValueChange={(v) => setValue("level", v)}>
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

            {/* Learning Outcomes */}
            <OutcomesFields controlName="learnOutcomes" control={control} register={register} errors={errors} />

            {/* Mentor */}
            {mentorsData?.status === 200 && (
              <div className="space-y-2">
                <Label>Mentor</Label>
                <Select onValueChange={(v) => setValue("mentorId", v === "none" ? null : v)}>
                  <SelectTrigger className="w-full border-themeGray bg-transparent text-themeTextWhite">
                    <SelectValue placeholder="Select mentor (optional)" />
                  </SelectTrigger>
                  <SelectContent className="border-themeGray bg-[#101011] text-themeTextWhite">
                    <SelectItem value="none">No mentor</SelectItem>
                    {mentorsData.mentors?.map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* FAQs */}
            <FaqFields controlName="faqs" control={control} register={register} />

            {/* Translations (non-default locales) */}
            {isManager && (
              <div className="space-y-2">
                <Label>Translations</Label>
                <Tabs value={activeLocale} onValueChange={setActiveLocale} className="w-full">
                  <TabsList>
                    {(locales as readonly string[]).map((l) => (
                      <TabsTrigger key={l} value={l} className="capitalize">
                        {l}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {(locales as readonly string[]).map((l) => (
                    <TabsContent key={l} value={l} className="space-y-3">
                      {l === defaultLocale ? (
                        <p className="text-sm text-themeTextGray">Use the base fields above for {l} content.</p>
                      ) : (
                        <>
                          <Input
                            placeholder={`Course name (${l})`}
                            className="bg-transparent outline-none border-themeGray"
                            value={tNames[l] ?? ""}
                            onChange={(e) => setTNames((prev) => ({ ...prev, [l]: e.target.value }))}
                          />
                          <Input
                            placeholder={`Description (${l})`}
                            className="bg-transparent outline-none border-themeGray"
                            value={tDescriptions[l] ?? ""}
                            onChange={(e) => setTDescriptions((prev) => ({ ...prev, [l]: e.target.value }))}
                          />
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
              </div>
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
                <Input
                  type="file"
                  id="course-image"
                  className="hidden"
                  {...register("image")}
                />
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
            <div className="flex items-center space-x-2">
              <Switch
                id="publish-mode"
                onCheckedChange={(e) => setValue("published", e)}
                className="data-[state=checked]:bg-themeTextGray data-[state=unchecked]:bg-themeGray"
              />
              <Label htmlFor="publish-mode">Publish Course</Label>
            </div>
            <Button
              type="submit"
              className="w-full bg-transparent border-themeGray"
              variant="outline"
            >
              Create
            </Button>
            <DialogClose asChild>
              <Button type="button" ref={buttonRef} className="hidden">
                close modal
              </Button>
            </DialogClose>
          </form>
        </GlassModal>
        {isPending && variables && (
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
}
