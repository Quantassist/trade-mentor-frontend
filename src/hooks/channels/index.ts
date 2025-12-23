"use client"
import {
  onClapComment,
  onCreateChannelPost,
  onCreateChannelPostMulti,
  onCreateCommentReply,
  onCreateNewComment,
  onDeleteChannel,
  onUpdateChannelInfo,
  onUpdateChannelPostMulti
} from "@/actions/channel"
import {
  onDeletePost,
  onUpdatePost,
} from "@/actions/groups"
import { CreateCommentSchema } from "@/components/form/post-comments/schema"
import type { LocalePayload } from "@/components/global/post-content/multi"
import { CreateChannelPostSchema, MultiChannelPostSchema } from "@/components/global/post-content/schema"
import { defaultLocale, locales } from "@/i18n/config"
import { api } from "@/lib/api"
import { onRemoveItem } from "@/redux/slices/infinite-scroll-slice"
import type { AppDispatch } from "@/redux/store"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { JSONContent } from "novel"
import { useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import { v4 } from "uuid"
import z from "zod"

export const useChannelInfo = () => {
  const channelRef = useRef<HTMLAnchorElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [channel, setChannel] = useState<string | undefined>(undefined)
  const [edit, setEdit] = useState<boolean>(false)
  const [icon, setIcon] = useState<string | undefined>(undefined)
  const client = useQueryClient()
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const onEditChannel = (id: string | undefined) => {
    setChannel(id)
    setEdit(true)
  }
  const onSetIcon = (icon: string | undefined) => setIcon(icon)

  const { isPending, mutate, variables } = useMutation({
    mutationFn: (data: { name?: string; icon?: string }) =>
      onUpdateChannelInfo(channel!, data.name, data.icon),
    onMutate: () => {
      setEdit(false)
      onSetIcon(undefined)
    },
    onSuccess: (data) => {
      return toast(data.status !== 200 ? "Error" : "Success", {
        description: data.message,
      })
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["group-channels"],
      })
    },
  })

  const { variables: deleteVariables, mutate: deleteMutation } = useMutation({
    mutationFn: (data: { id: string }) => onDeleteChannel(data.id),
    onSuccess: (data) => {
      return toast(data.status !== 200 ? "Error" : "Success", {
        description: data.message,
      })
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["group-channels"],
      })
    },
  })

  useEffect(() => {
    document.addEventListener("click", onEndChannelEdit, false)
    return () => {
      document.removeEventListener("click", onEndChannelEdit, false)
    }
  }, [icon])

  const onEndChannelEdit = (event: Event) => {
    if (inputRef.current && channelRef.current && triggerRef.current) {
      if (
        !inputRef.current.contains(event.target as Node | null) &&
        !channelRef.current.contains(event.target as Node | null) &&
        !triggerRef.current.contains(event.target as Node | null) &&
        !document.getElementById("icon-list")
      ) {
        if (inputRef.current.value) {
          mutate({
            name: inputRef.current.value,
          })
        }
        if (icon) {
          mutate({ icon })
        } else {
          setEdit(false)
        }
      }
    }
  }

  const onChannelDetele = (id: string) => deleteMutation({ id })

  return {
    channel,
    onEditChannel,
    channelRef,
    edit,
    inputRef,
    variables,
    isPending,
    triggerRef,
    onSetIcon,
    icon,
    onChannelDetele,
    deleteVariables,
  }
}

export const useChannelPage = (channelid: string, locale?: string) => {
  const { data } = useQuery({
    queryKey: ["channel-info", channelid, locale],
    queryFn: () => api.channels.getInfo(channelid, locale),
  })

  const mutation = useMutationState({
    filters: { mutationKey: ["create-post"], status: "pending" },
    select: (mutation) => {
      return {
        state: mutation.state.variables as any,
        status: mutation.state.status,
      }
    },
  })

  return { data, mutation }
}

export const useCreateChannelPost = (
  params:
    | { mode?: "create"; channelid: string }
    | {
        mode: "edit"
        postid: string
        initial: {
          title: string
          htmlcontent?: string | null
          jsoncontent?: string | null
          content?: string | null
        }
      },
) => {
  const mode = ("mode" in params ? params.mode : "create") as "create" | "edit"
  const channelid = (params as any).channelid as string | undefined
  const postid = (params as any).postid as string | undefined
  const initial = (params as any).initial as
    | {
        title: string
        htmlcontent?: string | null
        jsoncontent?: string | null
        content?: string | null
      }
    | undefined

  const [onJsonDescription, setJsonDescription] = useState<
    JSONContent | undefined
  >(
    (() => {
      if (!initial?.jsoncontent || initial.jsoncontent === "") return undefined
      try {
        return JSON.parse(initial.jsoncontent) as JSONContent
      } catch {
        return undefined
      }
    })(),
  )
  const [onHtmlDescription, setOnHtmlDescription] = useState<
    string | undefined
  >(initial?.htmlcontent ?? undefined)
  const [onDescription, setOnDescription] = useState<string | undefined>(
    initial?.content ?? undefined,
  )

  const {
    formState: { errors },
    register,
    handleSubmit,
    setValue,
  } = useForm<z.infer<typeof CreateChannelPostSchema>>({
    resolver: zodResolver(CreateChannelPostSchema),
    defaultValues: {
      title: initial?.title ?? "",
    },
  })

  const onSetDescription = () => {
    const jsonContent = JSON.stringify(onJsonDescription)
    setValue("jsoncontent", jsonContent)
    setValue("htmlcontent", onHtmlDescription)
    setValue("content", onDescription)
  }

  useEffect(() => {
    onSetDescription()
    return () => {
      onSetDescription()
    }
  }, [onJsonDescription, onDescription, onHtmlDescription])

  const client = useQueryClient()

  const { mutate, variables, isPending } = useMutation({
    mutationKey:
      mode === "create" ? ["create-post"] : (["update-post", postid] as const),
    mutationFn: (data: {
      title: string
      content?: string
      htmlcontent?: string
      jsoncontent?: string
      postid?: string
    }) =>
      mode === "create"
        ? onCreateChannelPost(
            channelid!,
            data.title,
            data.content || "",
            data.htmlcontent || "",
            data.jsoncontent || "",
            data.postid!,
          )
        : onUpdatePost(
            postid!,
            data.title,
            data.htmlcontent,
            data.jsoncontent,
            data.content,
          ),
    onSuccess: (data) => {
      if (mode === "create") {
        setJsonDescription(undefined)
        setOnHtmlDescription(undefined)
        setOnDescription(undefined)
      }
      return toast(data.status !== 200 ? "Error" : "Success", {
        description: data.message,
      })
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["channel-info"] })
      if (mode === "edit") {
        await client.invalidateQueries({ queryKey: ["unique-post", postid] })
      }
    },
  })

  const onSubmitPost = handleSubmit(async (values) =>
    mutate({
      title: values.title,
      content: values.content,
      htmlcontent: values.htmlcontent,
      jsoncontent: values.jsoncontent,
      postid: mode === "create" ? v4() : undefined,
    }),
  )

  return {
    onJsonDescription,
    onDescription,
    onHtmlDescription,
    setJsonDescription,
    setOnHtmlDescription,
    setOnDescription,
    onSubmitPost,
    register,
    errors,
    variables,
    isPending,
  }
}

// Multi-locale create hook. Keeps mutationKey ["create-post"] to preserve optimistic preview behavior.
export const useCreateChannelPostMulti = (channelid: string) => {
  // Per-locale editor states managed here and synced into RHF values like in course hooks
  const [titles, setTitles] = useState<Record<string, string>>({})
  const [jsonByLocale, setJsonByLocale] = useState<Record<string, JSONContent | undefined>>({})
  const [htmlByLocale, setHtmlByLocale] = useState<Record<string, string | undefined>>({})
  const [textByLocale, setTextByLocale] = useState<Record<string, string | undefined>>({})

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof MultiChannelPostSchema>>({
    resolver: zodResolver(MultiChannelPostSchema),
    defaultValues: { payloads: [] },
  })

  const computePayloads = (): LocalePayload[] => {
    return (locales as readonly string[]).map((l) => ({
      locale: l,
      title: titles[l] ?? "",
      htmlcontent: htmlByLocale[l] ?? null,
      jsoncontent: jsonByLocale[l] ? JSON.stringify(jsonByLocale[l]) : null,
      content: textByLocale[l] ?? null,
    }))
  }

  const onSetPayloads = () => setValue("payloads", computePayloads() as any)

  useEffect(() => {
    onSetPayloads()
    return () => {
      onSetPayloads()
    }
  }, [titles, jsonByLocale, htmlByLocale, textByLocale])

  const client = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-post"],
    mutationFn: (data: { postid: string; payloads: LocalePayload[]; title: string; htmlcontent: string }) =>
      onCreateChannelPostMulti(channelid, data.postid, data.payloads),
    onSuccess: (data) => {
      toast(data.status !== 200 ? "Error" : "Success", { description: data.message })
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["channel-info", channelid] })
    },
  })

  const onSubmitMulti = handleSubmit(async (values) => {
    const payloads = values.payloads as LocalePayload[]
    const postid = v4()
    const base = payloads.find((p) => p.locale === defaultLocale) ?? payloads[0]
    ;(mutate as any)({ postid, payloads, title: base?.title ?? "", htmlcontent: base?.htmlcontent ?? "" })
  })

  return {
    // RHF
    errors,
    onSubmitMulti,
    // per-locale state and setters (consumed by the component)
    titles,
    setTitles,
    jsonByLocale,
    setJsonByLocale,
    htmlByLocale,
    setHtmlByLocale,
    textByLocale,
    setTextByLocale,
    isPending,
  }
}

export const useGetPostAllLocales = (postid: string) => {
  const { data } = useQuery({
    queryKey: ["post-all-locales", postid],
    queryFn: () => api.posts.getAllLocales(postid),
  })
  return { data }
}

export const useEditChannelPostMulti = (postid: string) => {
  const [titles, setTitles] = useState<Record<string, string>>({})
  const [jsonByLocale, setJsonByLocale] = useState<Record<string, JSONContent | undefined>>({})
  const [htmlByLocale, setHtmlByLocale] = useState<Record<string, string | undefined>>({})
  const [textByLocale, setTextByLocale] = useState<Record<string, string | undefined>>({})

  const { data } = useQuery({
    queryKey: ["post-all-locales", postid],
    queryFn: () => api.posts.getAllLocales(postid),
  })

  useEffect(() => {
    const post = (data as any)?.post
    if (!post) return
    const nextTitles: Record<string, string> = {}
    const nextJson: Record<string, JSONContent | undefined> = {}
    const nextHtml: Record<string, string | undefined> = {}
    const nextText: Record<string, string | undefined> = {}

    nextTitles[defaultLocale] = post.title ?? ""
    nextHtml[defaultLocale] = post.htmlContent ?? undefined
    nextText[defaultLocale] = post.content ?? undefined
    try {
      nextJson[defaultLocale] = post.jsonContent ? (JSON.parse(post.jsonContent) as JSONContent) : undefined
    } catch {
      nextJson[defaultLocale] = undefined
    }

    const translations = post.translations || {}
    for (const l of locales as readonly string[]) {
      const t = translations[l]
      if (l === defaultLocale) continue
      if (!t) continue
      nextTitles[l] = t.title ?? ""
      nextHtml[l] = t.html ?? undefined
      nextText[l] = t.content ?? undefined
      try {
        nextJson[l] = t.json ? (JSON.parse(t.json) as JSONContent) : undefined
      } catch {
        nextJson[l] = undefined
      }
    }

    setTitles(nextTitles)
    setJsonByLocale(nextJson)
    setHtmlByLocale(nextHtml)
    setTextByLocale(nextText)
  }, [data])

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof MultiChannelPostSchema>>({
    resolver: zodResolver(MultiChannelPostSchema),
    defaultValues: { payloads: [] },
  })

  const computePayloads = (): LocalePayload[] => {
    return (locales as readonly string[]).map((l) => ({
      locale: l,
      title: titles[l] ?? "",
      htmlcontent: htmlByLocale[l] ?? null,
      jsoncontent: jsonByLocale[l] ? JSON.stringify(jsonByLocale[l]) : null,
      content: textByLocale[l] ?? null,
    }))
  }

  const onSetPayloads = () => setValue("payloads", computePayloads() as any)

  useEffect(() => {
    onSetPayloads()
    return () => {
      onSetPayloads()
    }
  }, [titles, jsonByLocale, htmlByLocale, textByLocale])

  const client = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-post", postid],
    mutationFn: (data: { payloads: LocalePayload[] }) =>
      onUpdateChannelPostMulti(postid, data.payloads),
    onSuccess: (data) => {
      toast(data.status !== 200 ? "Error" : "Success", { description: data.message })
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["unique-post", postid] })
      await client.invalidateQueries({ queryKey: ["channel-info"] })
    },
  })

  const onSubmitEdit = handleSubmit(async (values) => {
    const payloads = values.payloads as LocalePayload[]
    mutate({ payloads })
  })

  return {
    errors,
    onSubmitEdit,
    titles,
    setTitles,
    jsonByLocale,
    setJsonByLocale,
    htmlByLocale,
    setHtmlByLocale,
    textByLocale,
    setTextByLocale,
    isPending,
    isLoading: !data,
  }
}


export const useGetPost = (postid: string, locale?: string) => {
  const { data } = useQuery({
    queryKey: ["unique-post", postid, locale],
    queryFn: () => api.posts.getInfo(postid, locale),
  })

  return { data }
}

export const usePostComment = (postid: string) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof CreateCommentSchema>>({
    resolver: zodResolver(CreateCommentSchema),
  })

  const client = useQueryClient()

  const { mutate, variables, isPending } = useMutation({
    mutationFn: (data: { content: string; commentid: string }) =>
      onCreateNewComment(postid, data.content, data.commentid),
    onMutate: () => {
      reset()
    },
    onSuccess: (data) => {
      return toast(data.status !== 200 ? "Error" : "Success", {
        description: data.message,
      })
    },
    onSettled: async () => {
      await client.invalidateQueries({
        queryKey: ["post-comments"],
      })
    },
  })

  const onCreateComment = handleSubmit(async (values) =>
    mutate({
      content: values.comment,
      commentid: v4(),
    }),
  )

  return {
    onCreateComment,
    register,
    errors,
    isPending,
    variables,
  }
}

export const useComments = (postid: string, userId?: string, enabled: boolean = true) => {
  const { data, isLoading } = useQuery({
    queryKey: ["post-comments", postid],
    queryFn: () => api.posts.getComments(postid, userId),
    enabled,
  })

  return { data, isLoading }
}

export const useReply = () => {
  const [onReply, setOnReply] = useState<{
    comment?: string
    reply: boolean
  }>({ comment: undefined, reply: false })

  const [activeComment, setActiveComment] = useState<string | undefined>(
    undefined,
  )

  const onSetReply = (commentid: string) =>
    setOnReply((prev) => ({ ...prev, comment: commentid, reply: true }))

  const onSetActiveComment = (id: string) => setActiveComment(id)

  return {
    onReply,
    onSetReply,
    activeComment,
    onSetActiveComment,
  }
}

export const useGetReplies = (commentid: string) => {
  const { isFetching, data } = useQuery({
    queryKey: ["comment-replies", commentid],
    queryFn: () => api.comments.getReplies(commentid),
    enabled: Boolean(commentid),
  })

  return { isFetching, data }
}

export const usePostReply = (postid: string, commentid: string, userid?: string) => {
  const client = useQueryClient()
  const { register, handleSubmit, reset } = useForm<
    z.infer<typeof CreateCommentSchema>
  >({
    resolver: zodResolver(CreateCommentSchema),
  })

  const { mutate, variables, isPending } = useMutation({
    mutationFn: (data: { comment: string; replyid: string }) =>
      onCreateCommentReply(postid, commentid, data.comment, data.replyid),
    onMutate: () => {
      reset()
    },
    onSuccess: (data) => {
      return toast(data?.status !== 200 ? "Error" : "Success", {
        description: data?.message,
      })
    },
    onSettled: async () => {
      // Invalidate both the replies for this comment and the post comments
      await Promise.all([
        client.invalidateQueries({ queryKey: ["comment-replies", commentid] }),
        client.invalidateQueries({ queryKey: ["post-comments", postid, userid] }),
      ])
    },
  })

  const onCreateReply = handleSubmit(async (values) =>
    mutate({
      comment: values.comment,
      replyid: v4(),
    }),
  )

  return {
    onCreateReply,
    register,
    isPending,
    variables,
  }
}

export const useEditPost = (
  postid: string,
  initial: {
    title: string
    htmlcontent?: string | null
    jsoncontent?: string | null
    content?: string | null
  },
) => {
  const [onJsonDescription, setJsonDescription] = useState<
    JSONContent | undefined
  >(
    (() => {
      if (!initial.jsoncontent || initial.jsoncontent === "") return undefined
      try {
        return JSON.parse(initial.jsoncontent) as JSONContent
      } catch {
        return undefined
      }
    })(),
  )
  const [onHtmlDescription, setOnHtmlDescription] = useState<
    string | undefined
  >(initial.htmlcontent ?? undefined)
  const [onDescription, setOnDescription] = useState<string | undefined>(
    initial.content ?? undefined,
  )

  const {
    formState: { errors },
    register,
    handleSubmit,
    setValue,
  } = useForm<z.infer<typeof CreateChannelPostSchema>>({
    resolver: zodResolver(CreateChannelPostSchema),
    defaultValues: {
      title: initial.title,
    },
  })

  const onSetDescription = () => {
    const jsonContent = JSON.stringify(onJsonDescription)
    setValue("jsoncontent", jsonContent)
    setValue("htmlcontent", onHtmlDescription)
    setValue("content", onDescription)
  }

  useEffect(() => {
    onSetDescription()
    return () => {
      onSetDescription()
    }
  }, [onJsonDescription, onDescription, onHtmlDescription])

  const client = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (data: {
      title: string
      content?: string
      htmlcontent?: string
      jsoncontent?: string
    }) =>
      onUpdatePost(
        postid,
        data.title,
        data.htmlcontent,
        data.jsoncontent,
        data.content,
      ),
    onSuccess: (data) => {
      return toast(data.status !== 200 ? "Error" : "Success", {
        description: data.message,
      })
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["unique-post"] })
      return await client.invalidateQueries({ queryKey: ["channel-info"] })
    },
  })

  const onUpdate = handleSubmit(async (values) =>
    mutate({
      title: values.title,
      content: values.content,
      htmlcontent: values.htmlcontent,
      jsoncontent: values.jsoncontent,
    }),
  )

  return {
    register,
    errors,
    onUpdate,
    onJsonDescription,
    setJsonDescription,
    onDescription,
    setOnDescription,
    onHtmlDescription,
    setOnHtmlDescription,
    isPending,
  }
}

export const useDeletePost = (postid: string) => {
  const client = useQueryClient()
  const dispatch: AppDispatch = useDispatch()
  const { mutate, isPending } = useMutation({
    mutationFn: () => onDeletePost(postid),
    onSuccess: (data) => {
      // Remove from infinite scroll list immediately
      dispatch(onRemoveItem({ id: postid }))
      return toast(data.status !== 200 ? "Error" : "Success", {
        description: data.message,
      })
    },
    onSettled: async () => {
      // Refresh initial feed query
      await client.invalidateQueries({ queryKey: ["channel-info"] })
      await client.invalidateQueries({ queryKey: ["unique-post", postid] })
    },
  })
  return { mutate, isPending }
}

export const useCommentClaps = (commentId: string, initialClaps: number = 0, initialMyClaps: number = 0) => {
  const [totalClaps, setTotalClaps] = useState<number>(initialClaps)
  const [myClaps, setMyClaps] = useState<number>(initialMyClaps)
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [showMyClaps, setShowMyClaps] = useState<boolean>(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingClapsRef = useRef<number>(0)
  const myClapsHideTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSyncedClapsRef = useRef<{ total: number; my: number }>({ total: initialClaps, my: initialMyClaps })

  // Sync with initial values when they change (only if no pending claps)
  useEffect(() => {
    if (pendingClapsRef.current === 0) {
      setTotalClaps(initialClaps)
      setMyClaps(initialMyClaps)
      lastSyncedClapsRef.current = { total: initialClaps, my: initialMyClaps }
    }
  }, [initialClaps, initialMyClaps])

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationKey: ["clap-comment", commentId],
    mutationFn: async (clapCount: number) => {
      const response = await onClapComment(commentId, clapCount)
      if (response.status !== 200) {
        throw new Error(response.message)
      }
      return response
    },
    onSuccess: () => {
      // After successful mutation, update the synced refs
      lastSyncedClapsRef.current = { total: totalClaps, my: myClaps }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["post-comments"],
      })
    },
  })

  const handleClap = useCallback(() => {
    // Optimistic update
    setTotalClaps((prev) => prev + 1)
    setMyClaps((prev) => prev + 1)
    pendingClapsRef.current += 1
    setShowConfetti(true)
    setShowMyClaps(true)

    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 700)

    // Reset the hide timer for myClaps badge
    if (myClapsHideTimerRef.current) {
      clearTimeout(myClapsHideTimerRef.current)
    }
    myClapsHideTimerRef.current = setTimeout(() => {
      setShowMyClaps(false)
    }, 2000)

    // Debounce the actual API call
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (pendingClapsRef.current > 0) {
        mutate(pendingClapsRef.current)
        pendingClapsRef.current = 0
      }
    }, 500)
  }, [mutate, totalClaps, myClaps])

  // Flush pending claps before unmount or page unload
  useEffect(() => {
    const flushPendingClaps = () => {
      if (pendingClapsRef.current > 0) {
        // Use sendBeacon for reliable delivery on page unload
        const data = JSON.stringify({ commentId, count: pendingClapsRef.current })
        navigator.sendBeacon?.('/api/clap-comment', data)
      }
    }

    window.addEventListener('beforeunload', flushPendingClaps)
    
    return () => {
      window.removeEventListener('beforeunload', flushPendingClaps)
      if (myClapsHideTimerRef.current) {
        clearTimeout(myClapsHideTimerRef.current)
      }
      // Also flush on component unmount
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (pendingClapsRef.current > 0) {
        mutate(pendingClapsRef.current)
        pendingClapsRef.current = 0
      }
    }
  }, [commentId, mutate])

  return {
    totalClaps,
    myClaps,
    handleClap,
    showConfetti,
    showMyClaps,
    isPending,
  }
}
