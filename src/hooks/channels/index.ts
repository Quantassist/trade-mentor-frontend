"use client"
import {
  onCreateChannelPost,
  onCreateCommentReply,
  onCreateNewComment,
  onDeleteChannel,
  onGetChannelInfo,
  onLikeChannelPost,
  onUpdateChannelInfo,
} from "@/actions/channel"
import {
  onGetCommentReplies,
  onGetPostComments,
  onGetPostInfo,
} from "@/actions/groups"
import { CreateCommentSchema } from "@/components/form/post-comments/schema"
import { CreateChannelPostSchema } from "@/components/global/post-content/schema"
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

export const useChannelPage = (channelid: string) => {
  const { data } = useQuery({
    queryKey: ["channel-info"],
    queryFn: () => onGetChannelInfo(channelid),
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

export const useCreateChannelPost = (channelid: string) => {
  const [onJsonDescription, setJsonDescription] = useState<
    JSONContent | undefined
  >(undefined)
  const [onHtmlDescription, setOnHtmlDescription] = useState<
    string | undefined
  >(undefined)
  const [onDescription, setOnDescription] = useState<string | undefined>(
    undefined,
  )

  const {
    formState: { errors },
    register,
    handleSubmit,
    setValue,
  } = useForm<z.infer<typeof CreateChannelPostSchema>>({
    resolver: zodResolver(CreateChannelPostSchema),
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
  }, [onJsonDescription, onDescription])

  const client = useQueryClient()

  const { mutate, variables, isPending } = useMutation({
    mutationKey: ["create-post"],
    mutationFn: (data: {
      title: string
      content: string
      htmlcontent: string
      jsoncontent: string
      postid: string
    }) =>
      onCreateChannelPost(
        channelid,
        data.title,
        data.content,
        data.htmlcontent,
        data.jsoncontent,
        data.postid,
      ),
    onSuccess: (data) => {
      setJsonDescription(undefined)
      setOnHtmlDescription(undefined)
      setOnDescription(undefined)
      return toast(data.status !== 200 ? "Error" : "Success", {
        description: data.message,
      })
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["channel-info"],
      })
    },
  })

  const onCreatePost = handleSubmit(async (values) =>
    mutate({
      title: values.title,
      content: values.content!,
      htmlcontent: values.htmlcontent!,
      jsoncontent: values.jsoncontent!,
      postid: v4(),
    }),
  )

  return {
    onJsonDescription,
    onDescription,
    onHtmlDescription,
    setJsonDescription,
    setOnHtmlDescription,
    setOnDescription,
    onCreatePost,
    register,
    errors,
  }
}

export const useLikeChannelPost = (postid: string) => {
  const client = useQueryClient()
  const { mutate, variables, isPending } = useMutation({
    mutationFn: (data: { likeid: string }) =>
      onLikeChannelPost(postid, data.likeid),
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

export const useGetPost = (postid: string) => {
  const { data } = useQuery({
    queryKey: ["unique-post", postid],
    queryFn: () => onGetPostInfo(postid),
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
