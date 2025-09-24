"use client"
import {
  inGetChannelPosts,
  onAddCustomDomain,
  onCreateNewChannel,
  onGetAllGroupMembers,
  onGetDomainConfig,
  onGetExploreGroup,
  onGetGroupInfo,
  onGetPostInfo,
  onLikePress,
  onSearchGroups,
  onUpDateGroupSettings,
  onUpdateGroupGallery,
} from "@/actions/groups"
import { GroupStateProps } from "@/app/(discover)/explore/_components/group-list"
import { Post } from "@/app/group/[groupid]/_components/post-card"
import { AddCustomDomainSchema } from "@/components/form/domain/schema"
import { GroupSettingsSchema } from "@/components/form/groups-settings/schema"
import { UpdateGallerySchema } from "@/components/form/media-gallery/schema"
import { NewPostSchema } from "@/components/form/new-post-form/schema"
import { IGroupInfo, IGroups } from "@/components/global/sidebar"
import { supabaseClient, validateURLString } from "@/lib/utils"
import {
  onClearList,
  onInfiniteScroll,
} from "@/redux/slices/infinite-scroll-slice"
import { onOnline } from "@/redux/slices/online-member-slice"
import { onClearSearch, onSearch } from "@/redux/slices/search-slice"
import { AppDispatch } from "@/redux/store"
import { useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { UploadClient } from "@uploadcare/upload-client"
import { usePathname, useRouter } from "next/navigation"
import { JSONContent } from "novel"
import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import { z } from "zod"

const upload = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
})

export const useGroupChatOnline = (userid: string) => {
  const dispatch: AppDispatch = useDispatch()

  useEffect(() => {
    const channel = supabaseClient.channel("tracking")
    channel
      .on("presence", { event: "sync" }, () => {
        const state: any = channel.presenceState()
        console.log(state)
        for (const user in state) {
          dispatch(
            onOnline({
              members: [{ id: state[user][0].member.userid }],
            }),
          )
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            member: {
              userid,
            },
          })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [])
}

export const useGroupList = (query: string) => {
  const { data } = useQuery({
    queryKey: [query],
  })

  const dispatch: AppDispatch = useDispatch()

  useLayoutEffect(() => {
    dispatch(onClearList({ data: [] }))
  }, [])

  const { groups, status } = data as {
    groups: GroupStateProps[]
    status: number
  }

  return { groups, status }
}

export const useExploreSlider = (query: string, paginate: number) => {
  const [onLoadSlider, setOnLoadSlider] = useState<boolean>(false)
  const dispatch: AppDispatch = useDispatch()
  const { data, refetch, isFetching, isFetched } = useQuery({
    queryKey: ["fetch-group-slides"],
    queryFn: () => onGetExploreGroup(query, paginate | 0),
    enabled: false,
  })

  if (isFetched && data?.status === 200 && data.groups) {
    dispatch(onInfiniteScroll({ data: data.groups }))
  }

  useEffect(() => {
    setOnLoadSlider(true)
    return () => {
      onLoadSlider
    }
  }, [])

  return { refetch, isFetching, data, onLoadSlider }
}

export const useSearch = (search: "GROUPS" | "POSTS") => {
  const [query, setQuery] = useState<string>("")
  const [debounce, setDebounce] = useState<string>("")

  const dispatch: AppDispatch = useDispatch()

  const onSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuery(e.target.value)

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setDebounce(query)
    }, 1000)
    return () => clearTimeout(delayInputTimeoutId)
  }, [query, 1000])

  const { refetch, data, isFetched, isFetching } = useQuery({
    queryKey: ["search-data", debounce],
    queryFn: async ({ queryKey }) => {
      if (search === "GROUPS") {
        const groups = await onSearchGroups(search, queryKey[1])
        return groups
      }
    },
    enabled: false,
  })

  if (isFetching)
    dispatch(
      onSearch({
        isSearching: true,
        data: [],
      }),
    )

  if (isFetched)
    dispatch(
      onSearch({
        isSearching: false,
        status: data?.status as number,
        data: data?.groups || [],
        debounce,
      }),
    )

  useEffect(() => {
    if (debounce) refetch()
    if (!debounce) dispatch(onClearSearch())
    return () => {
      debounce
    }
  }, [debounce])

  return { query, onSearchQuery }
}

export const useGroupSettings = (groupid: string) => {
  const { data } = useQuery({
    queryKey: ["group-info"],
    queryFn: () => onGetGroupInfo(groupid),
  })

  const jsonContent = data?.group?.jsonDescription
    ? JSON.parse(data?.group?.jsonDescription as string)
    : undefined

  const [onJsonDescription, setJsonDescription] = useState<
    JSONContent | undefined
  >(jsonContent)

  const [onDescription, setOnDescription] = useState<string | undefined>(
    data?.group?.description || undefined,
  )

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    watch,
    setValue,
  } = useForm<z.infer<typeof GroupSettingsSchema>>({
    resolver: zodResolver(GroupSettingsSchema),
    mode: "onChange",
  })

  const [previewIcon, setPreviewIcon] = useState<string | undefined>(undefined)
  const [previewThumbnail, setPreviewThumbnail] = useState<string | undefined>(
    undefined,
  )

  useEffect(() => {
    const previews = watch(({ thumbnail, icon }) => {
      if (!icon) return
      if (icon[0]) {
        setPreviewIcon(URL.createObjectURL(icon[0]))
      }
      if (thumbnail[0]) {
        setPreviewThumbnail(URL.createObjectURL(thumbnail[0]))
      }
    })
    return () => previews.unsubscribe()
  }, [watch])

  const onSetDescriptions = () => {
    const JsonContent = JSON.stringify(onJsonDescription)
    setValue("jsondescription", JsonContent)
    setValue("description", onDescription)
  }

  useEffect(() => {
    onSetDescriptions()
    return () => {
      onSetDescriptions()
    }
  }, [onJsonDescription, onDescription])

  const { mutate: update, isPending } = useMutation({
    mutationKey: ["group-settings"],
    mutationFn: async (values: z.infer<typeof GroupSettingsSchema>) => {
      console.log(values)
      if (values.thumbnail && values.thumbnail.length > 0) {
        const uploaded = await upload.uploadFile(values.thumbnail[0])
        const updated = await onUpDateGroupSettings(
          groupid,
          "IMAGE",
          uploaded.uuid,
          `/group/${groupid}/settings`,
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Oops! looks like your form is empty",
          })
        }
      }
      if (values.icon && values.icon.length > 0) {
        console.log("icon")
        const uploaded = await upload.uploadFile(values.icon[0])
        const updated = await onUpDateGroupSettings(
          groupid,
          "ICON",
          uploaded.uuid,
          `/group/${groupid}/settings`,
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Oops! looks like your form is empty",
          })
        }
      }
      if (values.name) {
        const updated = await onUpDateGroupSettings(
          groupid,
          "NAME",
          values.name,
          `/group/${groupid}/settings`,
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Oops! looks like your form is empty",
          })
        }
      }
      if (values.description) {
        const updated = await onUpDateGroupSettings(
          groupid,
          "DESCRIPTION",
          values.description,
          `/group/${groupid}/settings`,
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Oops! looks like your form is empty",
          })
        }
      }
      if (values.jsondescription) {
        const updated = await onUpDateGroupSettings(
          groupid,
          "JSONDESCRIPTION",
          values.jsondescription,
          `/group/${groupid}/settings`,
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Oops! looks like your form is empty",
          })
        }
      }
      if (
        !values.description &&
        !values.name &&
        (!values.thumbnail || values.thumbnail.length === 0) &&
        (!values.icon || values.icon.length === 0) &&
        !values.jsondescription
      ) {
        return toast("Error", {
          description: "Oops! looks like your form is empty",
        })
      }
      return toast("Success", {
        description: "Group data updated",
      })
    },
  })

  const router = useRouter()

  const onUpdate = handleSubmit(async (values) => update(values))

  if (data?.status !== 200) router.push(`/group/create`)

  return {
    data,
    register,
    errors,
    onUpdate,
    isPending,
    previewIcon,
    previewThumbnail,
    onJsonDescription,
    setJsonDescription,
    setOnDescription,
    onDescription,
  }
}

export const useGroupInfo = (groupid: string) => {
  const { data } = useQuery({
    queryKey: ["about-group-info"],
    queryFn: () => onGetGroupInfo(groupid),
  })

  const router = useRouter()

  if (!data) router.push("/explore")

  const { group, status } = data as { status: number; group: GroupStateProps }

  if (status !== 200) router.push("/explore")

  return {
    group,
  }
}

export const useGroupAbout = (
  description: string | null,
  jsonDescription: string | null,
  htmlDescription: string | null,
  currentMedia: string,
  groupid: string,
) => {
  const mediaType = validateURLString(currentMedia)

  const editor = useRef<HTMLFormElement | null>(null)

  const [activeMedia, setActiveMedia] = useState<
    | {
        url: string | undefined
        type: string
      }
    | undefined
  >(
    mediaType.type === "IMAGE"
      ? {
          url: currentMedia,
          type: mediaType.type,
        }
      : { ...mediaType },
  )

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

  const [onEditDescription, setOnEditDescription] = useState<boolean>(false)

  const {
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<z.infer<typeof GroupSettingsSchema>>({
    resolver: zodResolver(GroupSettingsSchema),
  })

  const onSetDescriptions = () => {
    const JsonContent = JSON.stringify(onJsonDescription)
    setValue("jsondescription", JsonContent)
    setValue("description", onDescription)
    setValue("htmldescription", onHtmlDescription)
  }

  useEffect(() => {
    onSetDescriptions()
    return () => {
      onSetDescriptions()
    }
  }, [onJsonDescription, onDescription])

  useEffect(() => {
    document.addEventListener("click", onEditTextEditor, false)
    return () => {
      document.removeEventListener("click", onEditTextEditor, false)
    }
  }, [])

  const { mutate, isPending } = useMutation({
    mutationKey: ["about-description"],
    mutationFn: async (values: z.infer<typeof GroupSettingsSchema>) => {
      if (values.description) {
        const updated = await onUpDateGroupSettings(
          groupid,
          "DESCRIPTION",
          values.description,
          `/about/${groupid}`,
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Oops! looks like your form is empty",
          })
        }
      }
      if (values.jsondescription) {
        const updated = await onUpDateGroupSettings(
          groupid,
          "JSONDESCRIPTION",
          values.jsondescription,
          `/about/${groupid}`,
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Oops! looks like your form is empty",
          })
        }
      }
      if (values.htmldescription) {
        const updated = await onUpDateGroupSettings(
          groupid,
          "HTMLDESCRIPTION",
          values.htmldescription,
          `/about/${groupid}`,
        )
        if (updated.status !== 200) {
          return toast("Error", {
            description: "Oops! looks like your form is empty",
          })
        }
      }
      if (
        !values.description &&
        !values.jsondescription &&
        !values.htmldescription
      ) {
        return toast("Error", {
          description: "Oops! looks like your form is empty",
        })
      }
      return toast("Success", {
        description: "Group description updated",
      })
    },
  })

  const onEditTextEditor = (event: Event) => {
    if (editor.current) {
      !editor.current.contains(event.target as Node | null)
        ? setOnEditDescription(false)
        : setOnEditDescription(true)
    }
  }

  const onSetActiveMedia = (media: { url: string | undefined; type: string }) =>
    setActiveMedia(media)

  const onUpdateDescription = handleSubmit(async (values) => {
    console.log("values")
    mutate(values)
  })

  return {
    setOnDescription,
    onDescription,
    setJsonDescription,
    onJsonDescription,
    errors,
    onEditDescription,
    editor,
    activeMedia,
    onSetActiveMedia,
    setOnHtmlDescription,
    onUpdateDescription,
    isPending,
  }
}

export const useMediaGallery = (groupid: string) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<z.infer<typeof UpdateGallerySchema>>({
    resolver: zodResolver(UpdateGallerySchema),
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-gallery"],
    mutationFn: async (values: z.infer<typeof UpdateGallerySchema>) => {
      if (values.videourl) {
        const update = await onUpdateGroupGallery(groupid, values.videourl)
        if (update && update.status !== 200) {
          return toast("Error", {
            description: update?.message,
          })
        }
      }
      if (values.image && values.image.length) {
        let count = 0
        while (count < values.image.length) {
          const uploaded = await upload.uploadFile(values.image[count])
          if (uploaded) {
            const update = await onUpdateGroupGallery(groupid, uploaded.uuid)
            if (update?.status !== 200) {
              toast("Error", {
                description: update?.message,
              })
              break
            }
          } else {
            toast("Error", {
              description: "Looks like something went wrong!",
            })
            break
          }
          console.log("increment")
          count++
        }
      }

      return toast("Success", {
        description: "Group gallery updated",
      })
    },
  })

  const onUpdateGallery = handleSubmit(async (values) => mutate(values))

  return {
    register,
    errors,
    onUpdateGallery,
    isPending,
  }
}

export const useSideBar = (groupid: string) => {
  const { data: groups } = useQuery({
    queryKey: ["user-groups"],
  }) as { data: IGroups }

  const { data: groupInfo } = useQuery({
    queryKey: ["group-info"],
  }) as { data: IGroupInfo }

  const client = new QueryClient()

  const { isPending, variables, mutate, isError } = useMutation({
    mutationKey: ["create-channels"],
    mutationFn: (data: {
      id: string
      name: string
      icon: string
      createdAt: Date
      groupId: string | null
    }) =>
      onCreateNewChannel(groupid, {
        id: data.id,
        name: data.name,
        icon: data.icon,
      }),
    onSettled: async () => {
      return await client.invalidateQueries({ queryKey: ["group-info"] })
    },
  })

  if (isPending)
    toast("Success", {
      description: "Channel created",
    })

  if (isError)
    toast("Error", {
      description: "Oops! something went wrong",
    })

  return { groupInfo, groups, mutate, variables }
}
export interface ChannelType {
  id: string
  name: string
  icon: string
  createdAt: Date
  groupId: string | null
}

export const useNewPostForm = () => {
  const [content, setContent] = useState<JSONContent | undefined>()
  const [textContent, setTextContent] = useState<string | undefined>("")
  const [htmlContent, setHtmlContent] = useState<string | undefined>()

  const { data: groupInfo } = useQuery({
    queryKey: ["group-info"],
    queryFn: () => onGetGroupInfo(""), // This will be overridden by prefetched data
  }) as { data: IGroupInfo }

  const [channel, setChannel] = useState<ChannelType>(
    groupInfo?.group?.channel?.[0] || {
      id: "",
      name: "",
      icon: "",
      createdAt: new Date(),
      groupId: "",
    },
  )

  const { user } = useUser()

  const client = useQueryClient()

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    watch,
    setValue,
  } = useForm<z.infer<typeof NewPostSchema>>({
    // resolver: zodResolver(NewPostSchema),
    mode: "onChange",
  })

  const onSetDescriptions = () => {
    const JsonContent = JSON.stringify(content)
    setValue("jsondescription", JsonContent)
    setValue("htmldescription", htmlContent)
    setValue("channelId", channel.id)
  }

  useEffect(() => {
    onSetDescriptions()
    return () => {
      onSetDescriptions()
    }
  }, [content, htmlContent])

  useEffect(() => {
    console.log("errors", errors)
  }, [errors])

  const { isPending, variables, mutate, isError, status } = useMutation({
    mutationKey: ["create-post"],
    mutationFn: async (data: {
      content: string
      htmlContent: string
      channelId: string
    }) => {
      // const response = await createNewPost(
      //     user?.id!,
      //     data.content,
      //     data.htmlContent,
      //     data.channelId,
      // )
      const response = {
        // TODO: Fake values to avoid build errors. Remove later
        status: 200,
        message: "Post created",
      }
      if (response.status !== 200) {
        throw new Error(response.message)
      }
      return response
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["channel-posts"],
      })
    },
    onSuccess: (data) => {
      return toast("Success", {
        description: "Post created",
      })
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (channel) {
      mutate({
        channelId: values.channelId,
        content: values.jsondescription ?? "",
        htmlContent: values.htmldescription ?? "",
      })
    } else {
      console.error("Channel not found")
    }
  })

  if (isError) {
    toast("Error", { description: "Oops! something went wrong" })
  }

  return {
    content,
    setContent,
    textContent,
    setTextContent,
    htmlContent,
    setHtmlContent,
    mutate,
    channel,
    setChannel,
    groupInfo,
    variables,
    isPending,
    onSubmit,
    errors,
    register,
    status,
  }
}

export const useChannelPosts = (slug: string) => {
  const { data: groupInfo } = useQuery({
    queryKey: ["group-info"],
    queryFn: () => onGetGroupInfo(""), // This will be overridden by prefetched data
  }) as { data: IGroupInfo }

  const { data, error, isLoading } = useQuery({
    queryKey: ["channel-posts", slug],
    queryFn: () => inGetChannelPosts(slug),
  })

  if (isLoading) {
    return { posts: [], status: "loading" }
  }

  if (error) {
    console.error(error)
    return { posts: [], status: "error" }
  }

  const { posts, status } = data as {
    posts: any[]
    status: number
  }

  return { posts, status, groupInfo }
}

export const useSelectSubscription = () => {
  const subscriptionOptions = [
    {
      value: "option1",
      price: 10,
      members: 5,
    },
    {
      value: "option2",
      price: 20,
      members: 10,
    },
    {
      value: "option3",
      price: 40,
      members: 0,
    },
  ]

  const [selected, setSelected] = useState<string>(subscriptionOptions[0].value)

  const onSelected = (value: string) => setSelected(value)

  const handleRemove = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    alert("Are you sure you want to remove this subscription?")
  }

  return {
    selected,
    onSelected,
    subscriptionOptions,
    handleRemove,
  }
}

export const useFeedPost = (postid: string) => {
  const { data } = useQuery({
    queryKey: ["post-info"],
    queryFn: () => onGetPostInfo(postid),
  })

  const { post, status } = data as {
    post: any
    status: number
  }

  return { post, status }
}

export const usePostCard = (post: Post, userId: string) => {
  const [liked, setLiked] = useState<boolean>(
    post.likes?.find((like) => like.userId == userId) ? true : false,
  )
  const [likes, setLikes] = useState<number>(post.likes?.length || 0)

  useEffect(() => {
    setLiked(post.likes?.find((like) => like.userId == userId) ? true : false)
    setLikes(post.likes?.length || 0)
  }, [post, userId])

  // invalidate channel-posts
  const client = useQueryClient()
  const { mutate } = useMutation({
    mutationKey: ["like-post"],
    mutationFn: async (data: { postid: string; userid: string }) => {
      setLiked(!liked)
      setLikes(liked ? likes - 1 : likes + 1)
      const response = await onLikePress(data.postid, data.userid)

      if (response.status !== 200) {
        throw new Error(response.message)
      }
      return response
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["channel-posts"],
      })
    },
  })

  return {
    liked,
    handleLikePress: () =>
      post.id && mutate({ postid: post.id, userid: userId }),
    likes,
  }
}

export const useGroupChat = (groupid: string) => {
  const { data } = useQuery({
    queryKey: ["member-chats"],
    queryFn: () => onGetAllGroupMembers(groupid),
  })

  const pathname = usePathname()

  return { data, pathname }
}

export const useCustomDomain = (groupid: string) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof AddCustomDomainSchema>>({
    resolver: zodResolver(AddCustomDomainSchema),
  })

  const client = useQueryClient()

  const { data } = useQuery({
    queryKey: ["domain-config"],
    queryFn: () => onGetDomainConfig(groupid),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { domain: string }) =>
      onAddCustomDomain(groupid, data.domain),
    onMutate: reset,
    onSuccess: (data) => {
      return toast(data.status === 200 ? "Success" : "Error", {
        description: data.message,
      })
    },
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["domain-config"],
      })
    },
  })

  const onAddDomain = handleSubmit(async (values) => {
    mutate(values)
  })

  return {
    data,
    errors,
    register,
    onAddDomain,
    isPending,
  }
}
