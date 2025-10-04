"use client"
import {
  onCreateCourseModule,
  onCreateGroupCourse,
  onCreateModuleSection,
  onDeleteModule,
  onDeleteSection,
  onGetCourseModules,
  onGetGroupCourses,
  onGetSectionInfo,
  onReorderModules,
  onReorderSections,
  onUpdateCourseSectionContent,
  onUpdateModule,
  onUpdateSection,
} from "@/actions/courses"
import { onGetGroupInfo, onGetGroupMentors } from "@/actions/groups"
import { CourseContentSchema } from "@/components/form/course-content/schema"
import { CreateCourseSchema } from "@/components/form/create-course/schema"
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

export const useCreateCourse = (groupid: string) => {
  const locale = useLocale()
  const [onPrivacy, setOnPrivacy] = useState<string | undefined>("open")
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<z.input<typeof CreateCourseSchema>>({
    resolver: zodResolver(CreateCourseSchema),
    defaultValues: {
      privacy: "open",
      published: false,
      level: "All levels",
      learnOutcomes: [""],
      faqs: [],
      mentorId: null,
    },
  })

  useEffect(() => {
    const privacy = watch(({ privacy }) => setOnPrivacy(privacy))
    return () => privacy.unsubscribe()
  }, [watch])

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
    queryKey: ["group-mentors", groupid],
    queryFn: () => onGetGroupMentors(groupid),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })

  const { mutate, isPending, variables } = useMutation({
    mutationKey: ["create-course-mutation"],
    mutationFn: async (data: any) => {
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
          level: data.level,
          learnOutcomes: data.learnOutcomes?.filter(Boolean),
          faqs: data.faqs,
          mentorId: data.mentorId ?? null,
          translations,
        },
      )
      return course
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
    mutate({
      id: v4(),
      createdAt: new Date(),
      ...values,
      image: values.image,
    }),
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
    data,
    mentorsData,
    control,
    setTranslations,
  }
}

export const useCourses = (
  groupid: string,
  filter: "all" | "in_progress" | "completed" | "unpublished" = "all",
) => {
  const { data } = useQuery({
    queryKey: ["group-courses", groupid, filter],
    queryFn: () => onGetGroupCourses(groupid, filter),
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

export const useCourseSectionInfo = (sectionid: string, locale?: string) => {
  const { data } = useQuery({
    queryKey: ["section-info", sectionid, locale],
    queryFn: () => onGetSectionInfo(sectionid, locale),
  })
  return { data }
}

export const useCourseContent = (
  sectionid: string,
  groupid: string,
  description: string | null,
  jsonDescription: string | null,
  htmlDescription: string | null,
  locale?: string,
) => {
  const jsonContent =
    jsonDescription !== null ? JSON.parse(jsonDescription as string) : undefined
  const [onJsonDescription, setJsonDescription] = useState<
    JSONContent | undefined
  >(jsonContent)
  const [onDescription, setOnDescription] = useState<string | undefined>(
    description || undefined,
  )
  const [onHtmlDescription, setOnHtmlDescription] = useState<
    string | undefined
  >(htmlDescription || undefined)

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
    defaultValues: { name: "", typeId: SECTION_TYPES[1]?.id || "text" },
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-section", moduleid],
    mutationFn: async (data: { name: string; icon: string }) =>
      onCreateModuleSection(groupid, moduleid, v4(), data.name || "New Section", data.icon),
    onSuccess: (data) =>
      toast(data?.status !== 200 ? "Error" : "Success", { description: data?.message }),
    onSettled: async () =>
      await client.invalidateQueries({ queryKey: ["course-modules"] }),
  })

  const onCreateSection = handleSubmit(async (values) => {
    const selected = SECTION_TYPES.find((t) => t.id === values.typeId)
    mutate({ name: values.name, icon: selected?.icon || "doc" })
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