"use client"
import { onGetUserGroupRole } from "@/actions/auth"
import {
  onCreateCourseModule,
  onCreateGroupCourse,
  onCreateModuleSection,
  onDeleteModule,
  onDeleteSection,
  onGetCourseModules,
  onGetGroupCourses,
  onGetMentorProfiles,
  onGetSectionInfo,
  onGetModuleAnchors,
  onReorderModules,
  onReorderSections,
  onSaveReflectionResponse,
  onSubmitQuizAttempt,
  onUpdateCourse,
  onUpdateCourseSectionContent,
  onUpdateModule,
  onUpdateSection,
  onUpdateSectionTypedPayload,
  onUpdateInteractiveRunner,
} from "@/actions/courses"
import { onGetGroupInfo } from "@/actions/groups"
import { CaseStudyFormSchema, type CaseStudyFormValues, type CaseStudyFormInput } from "@/components/form/case-study/schema"
import { CourseContentSchema } from "@/components/form/course-content/schema"
import { CreateCourseSchema, UpdateCourseSchema } from "@/components/form/create-course/schema"
import { ExampleFormSchema, type ExampleFormValues, type ExampleFormInput } from "@/components/form/example/schema"
import { InteractiveFormSchema, InteractiveFormValues } from "@/components/form/interactive/schema"
import { InteractiveRunnerSchema, type InteractiveRunnerValues } from "@/components/form/interactive/runner-schema"
import { QuizFormSchema, type QuizFormValues } from "@/components/form/quiz/schema"
import { ReflectionFormSchema, type ReflectionFormValues } from "@/components/form/reflection/schema"
import { SECTION_TYPES } from "@/constants/icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UploadClient } from "@uploadcare/upload-client"
import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import { JSONContent } from "novel"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { v4 } from "uuid"
import { z } from "zod"

const upload = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
})

export const useCreateCourse = (groupid: string, initial?: any) => {
  const locale = useLocale()
  const [onPrivacy, setOnPrivacy] = useState<string | undefined>("open")
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const enumToLabel = (v: any): string => {
    if (!v) return "All levels"
    const s = String(v)
    if (s === "BEGINNER" || s === "Beginner") return "Beginner"
    if (s === "INTERMEDIATE" || s === "Intermediate") return "Intermediate"
    if (s === "ADVANCED" || s === "Advanced") return "Advanced"
    if (s.toLowerCase() === "all" || s === "All levels") return "All levels"
    return "All levels"
  }
  const labelToEnum = (v: any): string | null => {
    if (!v) return null
    const s = String(v)
    if (s === "All levels") return null
    if (s === "Beginner" || s === "BEGINNER") return "BEGINNER"
    if (s === "Intermediate" || s === "INTERMEDIATE") return "INTERMEDIATE"
    if (s === "Advanced" || s === "ADVANCED") return "ADVANCED"
    return null
  }
  const normalizeOutcomes = (value: any): string[] => {
    if (!Array.isArray(value)) return []
    return (value as any[])
      .map((x) => {
        if (typeof x === "string") return x
        if (x && typeof x === "object" && typeof (x as any).outcome === "string") return (x as any).outcome
        return null
      })
      .filter(Boolean) as string[]
  }
  const {
    handleSubmit,
    register,
    reset,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(initial ? UpdateCourseSchema : CreateCourseSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          description: initial.description,
          level: enumToLabel(initial.level),
          learnOutcomes: (() => {
            const arr = normalizeOutcomes(initial.learnOutcomes)
            return arr.length > 0 ? arr : [""]
          })(),
          faqs: Array.isArray(initial.faq) ? initial.faq : [],
          mentors: Array.isArray(initial.mentors)
            ? initial.mentors.map((m: any, idx: number) => ({
                mentorId: m.mentorId,
                role: m.role ?? "PRIMARY",
                sortOrder: typeof m.sortOrder === "number" ? m.sortOrder : idx,
              }))
            : [],
          privacy: initial.privacy ?? "open",
          published: !!initial.published,
        }
      : {
          privacy: "open",
          published: false,
          level: "All levels",
          learnOutcomes: [""],
          faqs: [],
          mentors: [],
        },
  })

  useEffect(() => {
    // initialize privacy highlight once
    try {
      const current = getValues("privacy")
      if (current) setOnPrivacy(current)
    } catch {}
    const sub = watch(({ privacy }) => setOnPrivacy(privacy))
    return () => sub.unsubscribe()
  }, [watch, getValues])

  const client = useQueryClient()
  const [translations, setTranslations] = useState<any[]>([])

  const { data } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => onGetGroupInfo(groupid, locale),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })

  const { data: mentorsData } = useQuery({
    queryKey: ["mentor-profiles"],
    queryFn: () => onGetMentorProfiles(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })

  const { mutate, isPending, variables } = useMutation({
    mutationKey: [initial ? "update-course-mutation" : "create-course-mutation"],
    mutationFn: async (data: any) => {
      if (initial) {
        // Update path
        let thumbnail: string | undefined
        if (data.image && data.image[0]) {
          const uploaded = await upload.uploadFile(data.image[0])
          thumbnail = uploaded.uuid
        }
        const mappedLevel = labelToEnum(data.level)
        const includeLevel = (typeof initial.level !== "undefined") ? (mappedLevel !== initial.level) : (mappedLevel !== null)
        const cleanedOutcomes = (data.learnOutcomes || []).filter(Boolean)
        const includeOutcomes = initial.learnOutcomes !== undefined || cleanedOutcomes.length > 0
        const includeFaqs = initial.faq !== undefined || (Array.isArray(data.faqs) && data.faqs.length > 0)
        const res = await onUpdateCourse(groupid, initial.id, {
          name: data.name,
          description: data.description,
          privacy: data.privacy,
          published: data.published,
          ...(includeLevel ? { level: mappedLevel } : {}),
          ...(includeOutcomes ? { learnOutcomes: cleanedOutcomes } : {}),
          ...(includeFaqs ? { faqs: data.faqs } : {}),
          ...(Array.isArray(data.mentors) ? { mentors: data.mentors } : {}),
          ...(thumbnail ? { thumbnail } : {}),
          translations,
        })
        return res
      } else {
        // Create path
        const uploaded = await upload.uploadFile(data.image[0])
        const course = await onCreateGroupCourse(
          groupid,
          data.name,
          uploaded.uuid,
          data.description,
          data.id,
          data.privacy,
          data.published,
          {
            level: labelToEnum(data.level) as any,
            learnOutcomes: data.learnOutcomes?.filter(Boolean),
            faqs: data.faqs,
            mentors: Array.isArray(data.mentors) ? data.mentors : [],
            translations,
          },
        )
        return course
      }
    },
    onMutate: () => {
      buttonRef.current?.click()
    },
    onSuccess: (data) => {
      return toast(data.status !== 200 ? "Error" : "Success", {
        description: data.message,
      })
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["group-courses", groupid],
      })
    },
  })

  const onCreateCourse = handleSubmit(async (values) =>
    mutate(
      initial
        ? { ...values }
        : {
            id: v4(),
            createdAt: new Date(),
            ...values,
            image: values.image,
          },
    ),
  )
  return {
    onCreateCourse,
    register,
    errors,
    buttonRef,
    variables,
    isPending,
    onPrivacy,
    setValue,
    watch,
    data,
    mentorsData,
    control,
    setTranslations,
  }
}

export const useCourses = (
  groupid: string,
  filter: "all" | "in_progress" | "completed" | "unpublished" = "all",
  locale?: string,
) => {
  const { data } = useQuery({
    queryKey: ["group-courses", groupid, filter, locale],
    queryFn: () => onGetGroupCourses(groupid, filter, locale),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })
  return { data }
}

export const useCreateModule = (courseid: string, groupid: string) => {
  const client = useQueryClient()
  const locale = useLocale()
  const { data } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => onGetGroupInfo(groupid, locale),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })
  const { mutate, isPending, variables } = useMutation({
    mutationKey: ["create-module"],
    mutationFn: async (data: {
      courseId: string
      title: string
      moduleId: string
    }) => onCreateCourseModule(groupid, data.courseId, data.title, data.moduleId),
    onSuccess: (data) => {
      return toast(data.status !== 200 ? "Error" : "Success", {
        description: data.message,
      })
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["course-modules"],
      })
    },
  })

  const onCreateModule = () =>
    mutate({
      courseId: courseid,
      title: "Module",
      moduleId: v4(),
    })

  return {
    onCreateModule,
    isPending,
    variables,
    data,
  }
}

export const useCourseModule = (courseId: string, groupid: string) => {
  const locale = useLocale()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLAnchorElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const sectionInputRef = useRef<HTMLInputElement | null>(null)
  const [edit, setEdit] = useState<boolean>(false)
  const [editSection, setEditSection] = useState<boolean>(false)
  const [activeSection, setActiveSection] = useState<string | undefined>(
    undefined,
  )
  const [moduleId, setModuleId] = useState<string | undefined>(undefined)

  const { data } = useQuery({
    queryKey: ["course-modules"],
    queryFn: () => onGetCourseModules(courseId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })

  const { data: groupOwner } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => onGetGroupInfo(groupid, locale),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })

  const pathname = usePathname()
  const client = useQueryClient()

  const { mutate, isPending, variables } = useMutation({
    mutationFn: async (data: { type: "NAME" | "DATA"; content: string }) =>
      onUpdateModule(groupid, moduleId!, data.type, data.content),
    onMutate: () => setEdit(false),
    onSuccess: (data) => {
      return toast(data?.status !== 200 ? "Error" : "Success", {
        description: data?.message,
      })
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["course-modules"],
      })
    },
  })

  const {
    mutate: updateSection,
    isPending: sectionUpdatePending,
    variables: updateVariables,
  } = useMutation({
    mutationFn: (data: { type: "NAME" | "ICON"; content: string }) =>
      onUpdateSection(groupid, activeSection!, data.type, data.content),
    onMutate: () => setEditSection(false),
    onSuccess: (data) => {
      return toast(data?.status !== 200 ? "Error" : "Success", {
        description: data?.message,
      })
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["course-modules"],
      })
    },
  })

  // Update a section by explicit id (used by inline edit sheets)
  const { mutate: updateSectionById } = useMutation({
    mutationFn: (data: { sectionid: string; type: "NAME" | "ICON"; content: string }) =>
      onUpdateSection(groupid, data.sectionid, data.type, data.content),
    onSuccess: (data) => {
      return toast(data?.status !== 200 ? "Error" : "Success", {
        description: data?.message,
      })
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["course-modules"],
      })
    },
  })

  const {
    mutate: mutateSection,
    isPending: pendingSection,
    variables: sectionVariables,
  } = useMutation({
    mutationFn: (data: { moduleid: string; sectionid: string; name?: string; icon?: string }) =>
      onCreateModuleSection(groupid, data.moduleid, data.sectionid, data.name, data.icon),
    onSuccess: (data) => {
      return toast(data?.status !== 200 ? "Error" : "Success", {
        description: data?.message,
      })
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["course-modules"],
      })
    },
  })

  // Delete a single section
  const { mutate: deleteSection, isPending: deleteSectionPending } = useMutation({
    mutationFn: (sectionid: string) => onDeleteSection(groupid, sectionid),
    onSuccess: (data) =>
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message }),
    onSettled: async () =>
      await client.invalidateQueries({ queryKey: ["course-modules"] }),
  })

  // Delete a module (sections cascade by Prisma settings)
  const { mutate: deleteModule, isPending: deleteModulePending } = useMutation({
    mutationFn: (moduleid: string) => onDeleteModule(groupid, moduleid),
    onSuccess: (data) =>
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message }),
    onSettled: async () =>
      await client.invalidateQueries({ queryKey: ["course-modules"] }),
  })

  // Reorder modules
  const { mutate: reorderModules, isPending: reorderModulesPending } = useMutation({
    mutationFn: (orderedIds: string[]) => onReorderModules(groupid, courseId, orderedIds),
    onSuccess: (data) =>
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message }),
    onSettled: async () =>
      await client.invalidateQueries({ queryKey: ["course-modules"] }),
  })

  // Reorder sections in a module
  const { mutate: reorderSections, isPending: reorderSectionsPending } = useMutation({
    mutationFn: (data: { moduleId: string; orderedIds: string[] }) =>
      onReorderSections(groupid, data.moduleId, data.orderedIds),
    onSuccess: (data) =>
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message }),
    onSettled: async () =>
      await client.invalidateQueries({ queryKey: ["course-modules"] }),
  })

  const onEditModuleName = (event: Event) => {
    if (inputRef.current && triggerRef.current) {
      if (
        !inputRef.current.contains(event.target as Node | null) &&
        !triggerRef.current.contains(event.target as Node | null)
      ) {
        if (inputRef.current.value) {
          mutate({
            type: "NAME",
            content: inputRef.current.value,
          })
        } else {
          setEdit(false)
        }
      }
    }
  }

  const onEditSectionName = (event: Event) => {
    if (sectionInputRef.current && contentRef.current) {
      if (
        !sectionInputRef.current.contains(event.target as Node | null) &&
        !contentRef.current.contains(event.target as Node | null)
      ) {
        if (sectionInputRef.current.value) {
          updateSection({
            type: "NAME",
            content: sectionInputRef.current.value,
          })
        } else {
          setEditSection(false)
        }
      }
    }
  }

  useEffect(() => {
    document.addEventListener("click", onEditModuleName, false)
    return () => {
      document.removeEventListener("click", onEditModuleName, false)
    }
  }, [moduleId])

  useEffect(() => {
    document.addEventListener("click", onEditSectionName, false)
    return () => {
      document.removeEventListener("click", onEditSectionName, false)
    }
  }, [activeSection])

  const onEditModule = (id: string) => {
    setEdit(true)
    setModuleId(id)
  }

  const onEditSection = () => setEditSection(true)

  return {
    data,
    onEditModule,
    edit,
    triggerRef,
    inputRef,
    variables,
    isPending,
    pathname,
    groupOwner,
    sectionVariables,
    mutateSection,
    pendingSection,
    setActiveSection,
    activeSection,
    onEditSection,
    sectionInputRef,
    contentRef,
    editSection,
    sectionUpdatePending,
    updateVariables,
    updateSection,
    updateSectionById,
    deleteSection,
    deleteSectionPending,
    deleteModule,
    deleteModulePending,
    reorderModules,
    reorderModulesPending,
    reorderSections,
    reorderSectionsPending,
  }
}

export const useSectionNavBar = (groupid: string, sectionid: string, locale: string) => {
  const { data } = useQuery({
    queryKey: ["section-info", sectionid, locale],
    queryFn: () => onGetSectionInfo(sectionid, locale),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })

  const client = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => onUpdateSection(groupid, sectionid, "COMPLETE", ""),
    onSuccess: (data) => {
      return toast(data?.status !== 200 ? "Error" : "Success", {
        description: data?.message,
      })
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["course-modules"],
      })
    },
  })

  return {
    data,
    mutate,
    isPending,
  }
}

export const useCourseSectionInfo = (sectionid: string, locale?: string, initial?: any) => {
  const { data } = useQuery({
    queryKey: ["section-info", sectionid, locale],
    queryFn: () => onGetSectionInfo(sectionid, locale),
    // allow hydrating with server-provided data when available
    initialData: initial,
    staleTime: initial ? 10_000 : 0,
  })
  return { data }
}

// Fetch and cache all anchors for a module; return list and byId map for O(1) lookups
export const useModuleAnchors = (moduleId: string | undefined, locale?: string) => {
  const { data } = useQuery({
    enabled: !!moduleId,
    queryKey: ["module-anchors", moduleId, locale],
    queryFn: () => onGetModuleAnchors(moduleId as string),
    staleTime: 5 * 60_000,
    gcTime: 60 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })
  const anchorsList = (data?.status === 200 ? (data as any).anchors : []) as Array<{ id: string; shortLabel: string; title: string; excerpt: string }>
  const anchorsById = (anchorsList || []).reduce((acc: Record<string, any>, a) => {
    acc[a.id] = a
    return acc
  }, {} as Record<string, { id: string; shortLabel: string; title: string; excerpt: string }>)
  return { anchorsList, anchorsById }
}

export const useCourseContent = (
  sectionid: string,
  groupid: string,
  description: string | null,
  jsonDescription: any | null,
  htmlDescription: string | null,
  locale?: string,
) => {
  const jsonContent =
    jsonDescription !== null
      ? (typeof jsonDescription === "string"
          ? (() => { try { return JSON.parse(jsonDescription as string) } catch { return undefined } })()
          : jsonDescription)
      : undefined
  const [onJsonDescription, setJsonDescription] = useState<
    JSONContent | undefined
  >(jsonContent)
  const [onDescription, setOnDescription] = useState<string | undefined>(
    description || undefined,
  )
  const [onHtmlDescription, setOnHtmlDescription] = useState<
    string | undefined
  >(htmlDescription || undefined)

  // hydrate state when incoming props change (e.g., after fetch)
  useEffect(() => {
    const parsed =
      jsonDescription !== null
        ? (typeof jsonDescription === "string"
            ? (() => { try { return JSON.parse(jsonDescription as string) } catch { return undefined } })()
            : (jsonDescription as any))
        : undefined
    setJsonDescription(parsed)
    setOnDescription(description || undefined)
    setOnHtmlDescription(htmlDescription || undefined)
  }, [sectionid, groupid, description, jsonDescription, htmlDescription])

  const editor = useRef<HTMLFormElement | null>(null)
  const [onEditDescription, setOnEditDescription] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof CourseContentSchema>>({
    resolver: zodResolver(CourseContentSchema),
  })

  const onSetDescriptions = () => {
    const JsonContent = JSON.stringify(onJsonDescription)
    setValue("jsoncontent", JsonContent)
    setValue("content", onDescription)
    setValue("htmlContent", onHtmlDescription)
  }

  useEffect(() => {
    onSetDescriptions()
    return () => {
      onSetDescriptions()
    }
  }, [onJsonDescription, onDescription, onHtmlDescription])

  const onEditTextEditor = (event: Event) => {
    if (editor.current) {
      !editor.current.contains(event.target as Node | null)
        ? setOnEditDescription(false)
        : setOnEditDescription(true)
    }
  }

  useEffect(() => {
    document.addEventListener("click", onEditTextEditor, false)
    return () => {
      document.removeEventListener("click", onEditTextEditor, false)
    }
  }, [])

  const client = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { values: z.infer<typeof CourseContentSchema> }) =>
      onUpdateCourseSectionContent(
        groupid,
        sectionid,
        data.values.htmlContent!,
        data.values.jsoncontent!,
        data.values.content!,
        locale!,
      ),
    onSuccess: (data) => {
      toast(data?.status !== 200 ? "Error" : "Success", {
        description: data?.message,
      })
    },
    onSettled: async () => {
      return await client.invalidateQueries({ queryKey: ["section-info", sectionid, locale] })
    },
  })

  const onUpdateContent = handleSubmit(async (values) => mutate({ values }))

  return {
    register,
    errors,
    onUpdateContent,
    onEditDescription,
    onJsonDescription,
    setJsonDescription,
    onDescription,
    setOnDescription,
    setOnHtmlDescription,
    editor,
    isPending,
  }
}

// Schema and hooks for Section forms
export const SectionFormSchema = z.object({
  name: z.string().min(1, { message: "Please enter a section name" }),
  typeId: z.string().min(1),
})

export const useCreateSectionForm = (moduleid: string, groupid: string) => {
  const client = useQueryClient()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof SectionFormSchema>>({
    resolver: zodResolver(SectionFormSchema),
    defaultValues: { name: "", typeId: SECTION_TYPES[0]?.id || "concept" },
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-section", moduleid],
    mutationFn: async (data: { name: string; icon: string; type?: string; initialPayload?: any }) =>
      onCreateModuleSection(
        groupid,
        moduleid,
        v4(),
        data.name || "New Section",
        data.icon,
        { type: data.type as any, initialPayload: data.initialPayload }
      ),
    onSuccess: (data) =>
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message }),
    onSettled: async () =>
      await client.invalidateQueries({ queryKey: ["course-modules"] }),
  })

  const onCreateSection = handleSubmit(async (values) => {
    const selected = SECTION_TYPES.find((t) => t.id === values.typeId)
    const type = values.typeId
    const initialPayload =
      type === "case_study"
        ? {
            block_title: "",
            background_md: "",
            analysis_md: "",
            decision_md: "",
            outcome_md: "",
            data_points: [],
            timeline_steps: [],
            learning_points: [],
            sebi_context: "",
            branching_points: [],
          }
        :
      type === "example"
        ? {
            block_title: "",
            scenario_md: "",
            persona: [],
            qa_pairs: [],
            financial_context: {
              time_horizon: "",
              risk_tolerance: "",
              available_amount: "",
              current_situation: "",
            },
          }
        :
      type === "reflection"
        ? { prompt_md: "", guidance_md: "", min_chars: 0, reflection_type: "short", sample_responses: [] }
        : type === "quiz"
        ? { quiz_type: "mcq", items: [], pass_threshold: 70 }
        : undefined
    mutate({ name: values.name, icon: selected?.icon || "doc", type, initialPayload })
  })

  return { register, setValue, errors, onCreateSection, isPending }
}

export const useEditSectionForm = (
  groupid: string,
  sectionid: string,
  initialName: string,
  initialIcon: string,
) => {
  const client = useQueryClient()
  const initial = useRef({ name: initialName, icon: initialIcon })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof SectionFormSchema>>({
    resolver: zodResolver(SectionFormSchema),
    defaultValues: {
      name: initialName,
      typeId:
        SECTION_TYPES.find((t) => t.icon === initialIcon)?.id || SECTION_TYPES[1]?.id || "text",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-section", sectionid],
    mutationFn: async (data: { name: string; icon: string }) => {
      if (data.name !== initial.current.name) {
        await onUpdateSection(groupid, sectionid, "NAME", data.name)
      }
      if (data.icon !== initial.current.icon) {
        await onUpdateSection(groupid, sectionid, "ICON", data.icon)
      }
      return { status: 200, message: "Section updated" }
    },
    onSuccess: (data) =>
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message }),
    onSettled: async () =>
      await client.invalidateQueries({ queryKey: ["course-modules"] }),
  })

  const onUpdateSectionSubmit = handleSubmit(async (values) => {
    const selected = SECTION_TYPES.find((t) => t.id === values.typeId)
    mutate({ name: values.name, icon: selected?.icon || initialIcon })
  })

  return { register, setValue, errors, onUpdateSectionSubmit, isPending }
}

// Submit a quiz attempt and invalidate the section-info query
export const useSubmitQuizAttempt = (groupid: string, sectionid: string, locale?: string) => {
  const client = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["submit-quiz", sectionid, locale],
    mutationFn: async (answers: number[]) =>
      onSubmitQuizAttempt(groupid, sectionid, answers, locale),
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["section-info", sectionid, locale] })
    },
  })
  return { submitQuizAttempt: mutateAsync, isPending }
}

// Save a reflection and invalidate the section-info query
export const useSaveReflection = (groupid: string, sectionid: string, locale?: string) => {
  const client = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["save-reflection", sectionid, locale],
    mutationFn: async (responseText: string) =>
      onSaveReflectionResponse(groupid, sectionid, responseText, locale),
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["section-info", sectionid, locale] })
    },
  })
  return { saveReflection: mutateAsync, isPending }
}

// Edit case study payload and invalidate section-info
export const useCaseStudyContent = (
  sectionid: string,
  groupid: string,
  initial: any,
  locale?: string,
  opts?: { onSuccess?: () => void; initialTitle?: string },
) => {

  const client = useQueryClient()
  const { register, handleSubmit, formState: { errors }, setValue, reset, control } = useForm<CaseStudyFormInput>({
    resolver: zodResolver(CaseStudyFormSchema),
    defaultValues: {
      title: opts?.initialTitle ?? "",
      block_title: initial?.block_title ?? "",
      background_md: initial?.background_md ?? "",
      analysis_md: initial?.analysis_md ?? "",
      decision_md: initial?.decision_md ?? "",
      outcome_md: initial?.outcome_md ?? "",
      data_points: Array.isArray(initial?.data_points) ? initial.data_points : [],
      timeline_steps: Array.isArray(initial?.timeline_steps) ? initial.timeline_steps : [],
      learning_points: Array.isArray(initial?.learning_points) ? initial.learning_points : [],
      sebi_context: initial?.sebi_context ?? "",
      branching_points: Array.isArray(initial?.branching_points) ? initial.branching_points : [],
    },
  })

  useEffect(() => {
    reset({
      title: opts?.initialTitle ?? "",
      block_title: initial?.block_title ?? "",
      background_md: initial?.background_md ?? "",
      analysis_md: initial?.analysis_md ?? "",
      decision_md: initial?.decision_md ?? "",
      outcome_md: initial?.outcome_md ?? "",
      data_points: Array.isArray(initial?.data_points) ? initial.data_points : [],
      timeline_steps: Array.isArray(initial?.timeline_steps) ? initial.timeline_steps : [],
      learning_points: Array.isArray(initial?.learning_points) ? initial.learning_points : [],
      sebi_context: initial?.sebi_context ?? "",
      branching_points: Array.isArray(initial?.branching_points) ? initial.branching_points : [],
    })
  }, [sectionid, groupid, locale, initial, reset, opts?.initialTitle])

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-case-study", sectionid, locale],
    mutationFn: async (values: CaseStudyFormInput) => {
      // Update section title if changed
      const nextTitle = (values.title || "").trim()
      const prevTitle = (opts?.initialTitle || "").trim()
      if (nextTitle && nextTitle !== prevTitle) {
        await onUpdateSection(groupid, sectionid, "NAME", nextTitle)
      }
      // Trim empties for arrays and remove title from payload
      const { title, ...rest } = values as any
      const payload = {
        ...rest,
        data_points: (rest.data_points || []).filter(Boolean),
        timeline_steps: (rest.timeline_steps || []).filter((t: any) => (t?.date_period || t?.event_description)),
        learning_points: (rest.learning_points || []).filter(Boolean),
        branching_points: (rest.branching_points || [])
          .map((bp: any) => ({
            node_id: (bp?.node_id || "").trim(),
            decision_prompt: (bp?.decision_prompt || "").trim(),
            options: Array.isArray(bp?.options) ? bp.options.filter((op: any) => (op?.option_text || "").trim()).map((op: any) => ({
              option_text: (op?.option_text || "").trim(),
              is_correct: !!op?.is_correct,
              option_consequence: (op?.option_consequence || "").trim(),
            })) : [],
          }))
          .filter((bp: any) => bp.node_id || bp.decision_prompt),
      }
      return await onUpdateSectionTypedPayload(groupid, sectionid, payload as any, locale)
    },

    onSuccess: (data: any) => {
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message })
      if (data?.status === 200) {
        opts?.onSuccess?.()
      }
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["section-info", sectionid, locale] })
    },
  })

  const onUpdateCaseStudy = handleSubmit(async (values) => mutate(values))

  return { register, setValue, errors, onUpdateCaseStudy, isPending, control }
}

export const useGroupRole = (groupid: string) => {
  const { data } = useQuery({
    queryKey: ["group-role", groupid],
    queryFn: () => onGetUserGroupRole(groupid),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })
  const canEdit = !!data && data.status === 200 && (data.isSuperAdmin || data.isOwner || data.role === "ADMIN" || data.role === "OWNER")
  return { data, canEdit }
}

// Edit example payload and invalidate section-info
export const useExampleContent = (
  sectionid: string,
  groupid: string,
  initial: any,
  locale?: string,
  opts?: { onSuccess?: () => void },
) => {
  const client = useQueryClient()
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ExampleFormInput>({
    resolver: zodResolver(ExampleFormSchema),
    defaultValues: {
      block_title: initial?.block_title ?? "",
      scenario_md: initial?.scenario_md ?? "",
      persona: Array.isArray(initial?.persona) ? initial.persona : [],
      qa_pairs: Array.isArray(initial?.qa_pairs) ? initial.qa_pairs : [],
      financial_context: initial?.financial_context ?? {
        time_horizon: "",
        risk_tolerance: "",
        available_amount: "",
        current_situation: "",
      },
    },
  })

  useEffect(() => {
    reset({
      block_title: initial?.block_title ?? "",
      scenario_md: initial?.scenario_md ?? "",
      persona: Array.isArray(initial?.persona) ? initial.persona : [],
      qa_pairs: Array.isArray(initial?.qa_pairs) ? initial.qa_pairs : [],
      financial_context: initial?.financial_context ?? {
        time_horizon: "",
        risk_tolerance: "",
        available_amount: "",
        current_situation: "",
      },
    })
  }, [sectionid, groupid, locale, initial, reset])

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-example", sectionid, locale],
    mutationFn: async (values: ExampleFormInput) => {
      const cleanedPairs = (values.qa_pairs || []).filter(p => (p?.question || "").trim() || (p?.answer || "").trim())
      const payload = {
        block_title: values.block_title,
        scenario_md: values.scenario_md,
        persona: Array.isArray(values.persona) ? values.persona.filter(p => (p?.name || "").trim() || typeof p?.age === "number") : [],
        qa_pairs: cleanedPairs,
        financial_context: values.financial_context || {
          time_horizon: "",
          risk_tolerance: "",
          available_amount: "",
          current_situation: "",
        },
      }
      return await onUpdateSectionTypedPayload(groupid, sectionid, payload as any, locale)
    },
    onSuccess: (data: any) => {
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message })
      if (data?.status === 200) opts?.onSuccess?.()
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["section-info", sectionid, locale] })
    },
  })

  const onUpdateExample = handleSubmit(async (values) => mutate(values))

  return { register, control, onUpdateExample, isPending, errors }
}

// Edit quiz payload and invalidate section-info
export const useQuizContent = (
  sectionid: string,
  groupid: string,
  initial: any,
  locale?: string,
  opts?: { onSuccess?: () => void; initialTitle?: string },
) => {
  const client = useQueryClient()
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(QuizFormSchema),
    defaultValues: {
      title: opts?.initialTitle ?? "",
      quiz_type: initial?.quiz_type ?? "mcq",
      pass_threshold: typeof initial?.pass_threshold === "number" ? initial.pass_threshold : 70,
      items: Array.isArray(initial?.items) ? initial.items : [],
    },
  })

  useEffect(() => {
    reset({
      title: opts?.initialTitle ?? "",
      quiz_type: initial?.quiz_type ?? "mcq",
      pass_threshold: typeof initial?.pass_threshold === "number" ? initial.pass_threshold : 70,
      items: Array.isArray(initial?.items) ? initial.items : [],
    })
  }, [sectionid, groupid, locale, initial, reset, opts?.initialTitle])

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-quiz", sectionid, locale],
    mutationFn: async (values: QuizFormValues) => {
      const normalizedItems = (values.items || []).map((q) => ({
        stem: q.stem,
        choices: (q.choices || [])
          .map((c) => ({ text: c.text, correct: !!c.correct, explanation: c.explanation }))
          .filter((c) => (c.text || "").trim() !== ""),
        rationale: q.rationale,
        difficulty: q.difficulty,
        anchor_ids: (q.anchor_ids || []).filter(Boolean),
      }))
      // Update section title if changed
      const nextTitle = (values.title || "").trim()
      const prevTitle = (opts?.initialTitle || "").trim()
      if (nextTitle && nextTitle !== prevTitle) {
        await onUpdateSection(groupid, sectionid, "NAME", nextTitle)
      }
      const payload = {
        quiz_type: values.quiz_type || "mcq",
        pass_threshold: typeof values.pass_threshold === "number" ? values.pass_threshold : 70,
        items: normalizedItems,
      }
      return await onUpdateSectionTypedPayload(groupid, sectionid, payload as any, locale)
    },
    onSuccess: (data: any) => {
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message })
      if (data?.status === 200) opts?.onSuccess?.()
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["section-info", sectionid, locale] })
    },
  })

  const onUpdateQuiz = handleSubmit(async (values) => mutate(values))

  return { register, control, onUpdateQuiz, isPending, errors }
}

// Edit reflection payload and invalidate section-info
export const useReflectionContent = (
  sectionid: string,
  groupid: string,
  initial: any,
  locale?: string,
  opts?: { onSuccess?: () => void },
) => {
  const client = useQueryClient()
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(ReflectionFormSchema),
    defaultValues: {
      reflection_type: initial?.reflection_type ?? "short",
      prompt_md: initial?.prompt_md ?? "",
      guidance_md: initial?.guidance_md ?? "",
      sample_responses: Array.isArray(initial?.sample_responses) ? initial.sample_responses : [],
      min_chars: typeof initial?.min_chars === "number" ? initial.min_chars : 100,
    },
  })

  useEffect(() => {
    reset({
      reflection_type: initial?.reflection_type ?? "short",
      prompt_md: initial?.prompt_md ?? "",
      guidance_md: initial?.guidance_md ?? "",
      sample_responses: Array.isArray(initial?.sample_responses) ? initial.sample_responses : [],
      min_chars: typeof initial?.min_chars === "number" ? initial.min_chars : 100,
    })
  }, [sectionid, groupid, locale, initial, reset])

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-reflection", sectionid, locale],
    mutationFn: async (values: ReflectionFormValues) => {
      const payload = {
        reflection_type: values.reflection_type || "short",
        prompt_md: values.prompt_md,
        guidance_md: values.guidance_md,
        sample_responses: (values.sample_responses || []).filter(Boolean),
        min_chars: typeof values.min_chars === "number" ? values.min_chars : 100,
      }
      return await onUpdateSectionTypedPayload(groupid, sectionid, payload as any, locale)
    },
    onSuccess: (data: any) => {
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message })
      if (data?.status === 200) opts?.onSuccess?.()
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["section-info", sectionid, locale] })
    },
  })

  const onUpdateReflection = handleSubmit(async (values) => mutate(values))

  return { register, control, onUpdateReflection, isPending, errors }
}

// Edit interactive htmlContent and invalidate section-info
export const useInteractiveContent = (
  sectionid: string,
  groupid: string,
  initialHtml: string | undefined,
  locale?: string,
  opts?: { onSuccess?: () => void },
) => {
  const client = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InteractiveFormValues>({
    resolver: zodResolver(InteractiveFormSchema),
    defaultValues: { html_content: initialHtml ?? "" },
  })

  useEffect(() => {
    reset({ html_content: initialHtml ?? "" })
  }, [sectionid, groupid, initialHtml, locale, reset])

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-interactive", sectionid, locale],
    mutationFn: async (values: InteractiveFormValues) => {
      return await onUpdateCourseSectionContent(groupid, sectionid, values.html_content || "", "", "", locale)
    },
    onSuccess: (data: any) => {
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message })
      if (data?.status === 200) opts?.onSuccess?.()
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["section-info", sectionid, locale] })
    },
  })

  const onUpdateInteractive = handleSubmit(async (values) => mutate(values))

  return { register, onUpdateInteractive, isPending, errors }
}

// Edit interactive React runner (code + meta) and invalidate section-info
export const useInteractiveReactContent = (
  sectionid: string,
  groupid: string,
  initial: { code?: string; meta?: any } | undefined,
  locale?: string,
  opts?: { onSuccess?: () => void },
) => {
  const client = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<InteractiveRunnerValues>({
    resolver: zodResolver(InteractiveRunnerSchema),
    defaultValues: {
      code: initial?.code || "",
      artifact_type: (initial?.meta?.artifact_type as any) || "react",
      allowed_libraries: Array.isArray(initial?.meta?.allowed_libraries) ? initial?.meta?.allowed_libraries : [],
      scope_config: initial?.meta?.scope_config ?? {},
    },
  })

  useEffect(() => {
    reset({
      code: initial?.code || "",
      artifact_type: (initial?.meta?.artifact_type as any) || "react",
      allowed_libraries: Array.isArray(initial?.meta?.allowed_libraries) ? initial?.meta?.allowed_libraries : [],
      scope_config: initial?.meta?.scope_config ?? {},
    })
  }, [sectionid, groupid, locale, reset, initial?.code, initial?.meta])

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-interactive-runner", sectionid, locale],
    mutationFn: async (values: InteractiveRunnerValues) => {
      // Accept scope_config as JSON string or object
      let meta: any = {
        artifact_type: values.artifact_type || "react",
        allowed_libraries: values.allowed_libraries || [],
      }
      const sc = values.scope_config
      if (typeof sc === "string" && sc.trim()) {
        try { meta.scope_config = JSON.parse(sc) } catch { meta.scope_config = {} }
      } else if (sc && typeof sc === "object") {
        meta.scope_config = sc
      } else {
        meta.scope_config = {}
      }
      return await onUpdateInteractiveRunner(groupid, sectionid, values.code, meta)
    },
    onSuccess: (data: any) => {
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message })
      if (data?.status === 200) opts?.onSuccess?.()
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["section-info", sectionid, locale] })
    },
  })

  const onUpdateInteractiveRunnerSubmit = handleSubmit(async (values) => mutate(values))

  return { register, onUpdateInteractiveRunnerSubmit, isPending, errors, setValue }
}