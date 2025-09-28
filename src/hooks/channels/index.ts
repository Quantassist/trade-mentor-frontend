"use client"
import {
  onCreateChannelPost,
  onCreateChannelPostMulti,
  onCreateCommentReply,
  onCreateNewComment,
  onDeleteChannel,
  onGetChannelInfo,
  onLikeChannelPost,
  onUpdateChannelInfo,
} from "@/actions/channel"
import {
  onDeletePost,
  onGetCommentReplies,
  onGetPostComments,
  onGetPostInfo,
  onUpdatePost,
} from "@/actions/groups"
import { CreateCommentSchema } from "@/components/form/post-comments/schema"
import { CreateChannelPostSchema } from "@/components/global/post-content/schema"
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
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import { v4 } from "uuid"
import z from "zod"
import { defaultLocale, locales } from "@/i18n/config"
import type { LocalePayload } from "@/components/global/post-content/multi"
import { MultiChannelPostSchema } from "@/components/global/post-content/schema"
import { onGetPostAllLocales, onUpdateChannelPostMulti } from "@/actions/channel"

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
    queryFn: () => onGetChannelInfo(channelid, locale),
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
    initial?.jsoncontent
      ? (JSON.parse(initial.jsoncontent) as JSONContent)
      : undefined,
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
    queryFn: () => onGetPostAllLocales(postid),
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
    queryFn: () => onGetPostAllLocales(postid),
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

export const useLikeChannelPost = (postid: string) => {
  const client = useQueryClient()
  const { mutate, variables, isPending } = useMutation({
    mutationFn: () => onLikeChannelPost(postid),
    onSuccess: (data) => {
      return toast(data.status !== 200 ? "Error" : "Success", {
        description: data.message,
      })
    },
    onSettled: async () => {
      await client.invalidateQueries({
        queryKey: ["unique-post"],
      })

      return await client.invalidateQueries({
        queryKey: ["channel-info"],
      })
    },
  })

  return {
    mutate,
    isPending,
  }
}

export const useGetPost = (postid: string, locale?: string) => {
  const { data } = useQuery({
    queryKey: ["unique-post", postid, locale],
    queryFn: () => onGetPostInfo(postid, locale),
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

export const useComments = (postid: string) => {
  const { data } = useQuery({
    queryKey: ["post-comments", postid],
    queryFn: () => onGetPostComments(postid),
  })

  return { data }
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
    queryFn: () => onGetCommentReplies(commentid),
    enabled: Boolean(commentid),
  })

  return { isFetching, data }
}

export const usePostReply = (postid: string, commentid: string) => {
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
    initial.jsoncontent
      ? (JSON.parse(initial.jsoncontent) as JSONContent)
      : undefined,
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
