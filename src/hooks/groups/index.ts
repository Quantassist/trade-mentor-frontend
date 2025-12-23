"use client"
import {
  onAddCustomDomain,
  onClapPress,
  onCreateNewChannel,
  onDeleteGroupGalleryItem,
  onUpDateGroupSettings,
  onUpdateGroupGallery
} from "@/actions/groups"
import { GroupStateProps } from "@/app/[locale]/(discover)/explore/_components/group-list"
import { Post } from "@/app/[locale]/group/[groupid]/_components/post-card"
import { AddCustomDomainSchema } from "@/components/form/domain/schema"
import { GroupSettingsSchema } from "@/components/form/groups-settings/schema"
import { UpdateGallerySchema } from "@/components/form/media-gallery/schema"
import { NewPostSchema } from "@/components/form/new-post-form/schema"
import { IGroupInfo, IGroups } from "@/components/global/sidebar"
import { usePathname } from "@/i18n/navigation"
import { api } from "@/lib/api"
import { useSession } from "@/lib/auth-client"
import { supabaseClient, validateURLString } from "@/lib/utils"
import {
  onClearList,
  onInfiniteScroll,
} from "@/redux/slices/infinite-scroll-slice"
import { onOnline } from "@/redux/slices/online-member-slice"
import { onClearSearch, onSearch } from "@/redux/slices/search-slice"
import { AppDispatch } from "@/redux/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { GroupRole } from "@prisma/client"
import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query"
import { UploadClient } from "@uploadcare/upload-client"
import { useLocale } from "next-intl"
import { JSONContent } from "novel"
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import { z } from "zod"

// Lazy-initialized UploadClient to avoid module-level instantiation
let _uploadClient: UploadClient | null = null
const getUploadClient = () => {
  if (!_uploadClient) {
    _uploadClient = new UploadClient({
      publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
    })
  }
  return _uploadClient
}

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
    queryFn: () => api.groups.explore(query, paginate | 0),
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
        const groups = await api.groups.search(search, queryKey[1])
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
  const locale = useLocale()
  const { data } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => api.groups.getInfo(groupid, locale),
  })

  const jsonContent = (() => {
    const desc = data?.group?.jsonDescription
    if (!desc || desc === "") return undefined
    try {
      return JSON.parse(desc as string)
    } catch {
      return undefined
    }
  })()

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
        const uploaded = await getUploadClient().uploadFile(values.thumbnail[0])
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
        const uploaded = await getUploadClient().uploadFile(values.icon[0])
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

  const onUpdate = handleSubmit(async (values) => update(values))

  // Return error state instead of client-side redirect
  // Server components/layouts should handle auth protection
  const hasError = data?.status !== 200

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
    hasError,
  }
}

export const useGroupInfo = (groupid?: string, locale?: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => api.groups.getInfo(groupid as string, locale),
    enabled: !!groupid,
  })

  // Return loading/error states instead of client-side redirect
  // Server components/layouts should handle auth protection
  const group = data?.group as GroupStateProps | undefined
  const status = data?.status as number | undefined
  const role = data?.role as GroupRole | undefined

  return {
    group,
    role,
    isLoading,
    hasError: !groupid || !data || status !== 200,
  }
}

export const useGroupAbout = (
  description: string | null,
  jsonDescription: string | null,
  htmlDescription: string | null,
  currentMedia: string,
  groupid: string,
  locale?: string,
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
    currentMedia
      ? mediaType.type === "IMAGE"
        ? {
            url: currentMedia,
            type: mediaType.type,
          }
        : { ...mediaType }
      : undefined,
  )

  // Update activeMedia when currentMedia changes (e.g., after gallery deletion)
  useEffect(() => {
    if (currentMedia) {
      const newMediaType = validateURLString(currentMedia)
      setActiveMedia(
        newMediaType.type === "IMAGE"
          ? { url: currentMedia, type: newMediaType.type }
          : { ...newMediaType },
      )
    } else {
      setActiveMedia(undefined)
    }
  }, [currentMedia])

  const jsonContent = (() => {
    if (jsonDescription === null || jsonDescription === "") return undefined
    try {
      return JSON.parse(jsonDescription as string)
    } catch {
      return undefined
    }
  })()

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
          `/${locale ?? 'en'}/about/${groupid}`,
          locale,
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
          `/${locale ?? 'en'}/about/${groupid}`,
          locale,
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
          `/${locale ?? 'en'}/about/${groupid}`,
          locale,
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
  const queryClient = useQueryClient()
  const locale = useLocale()
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
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
          const uploaded = await getUploadClient().uploadFile(values.image[count])
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
    onSuccess: () => {
      reset()
      queryClient.invalidateQueries({ queryKey: ["about-group-info", groupid, locale] })
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

export const useDeleteGalleryItem = (groupid: string) => {
  const queryClient = useQueryClient()
  const locale = useLocale()

  const { mutate: deleteGalleryItem, isPending: isDeleting } = useMutation({
    mutationKey: ["delete-gallery-item"],
    mutationFn: async (mediaUrl: string) => {
      const result = await onDeleteGroupGalleryItem(groupid, mediaUrl)
      if (result.status !== 200) {
        throw new Error(result.message)
      }
      return result
    },
    onSuccess: () => {
      toast.success("Gallery item deleted")
      queryClient.invalidateQueries({ queryKey: ["about-group-info", groupid, locale] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete gallery item")
    },
  })

  return {
    deleteGalleryItem,
    isDeleting,
  }
}

export const useSideBar = (groupid: string) => {
  const { data: groups } = useQuery({
    queryKey: ["user-groups"],
    queryFn: () => api.groups.getUserGroups(), // Fallback - actual data comes from prefetch in layout
    staleTime: Infinity, // Rely on prefetched data
  }) as { data: IGroups }

  const locale = useLocale()
  const { data: groupInfo } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => api.groups.getInfo(groupid, locale),
  }) as { data: IGroupInfo }

  const client = useQueryClient()

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
      return await client.invalidateQueries({
        queryKey: ["about-group-info", groupid, locale],
      })
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

export const useNewPostForm = (groupid: string) => {
  const [content, setContent] = useState<JSONContent | undefined>()
  const [textContent, setTextContent] = useState<string | undefined>("")
  const [htmlContent, setHtmlContent] = useState<string | undefined>()

  const locale = useLocale()
  const { data: groupInfo } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => api.groups.getInfo(groupid, locale), // This will be overridden by prefetched data
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

  const { data: session } = useSession()

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
  const locale = useLocale()
  const { data: groupInfo } = useQuery({
    queryKey: ["group-info"],
    queryFn: () => api.groups.getInfo(""), // This will be overridden by prefetched data
  }) as { data: IGroupInfo }

  const { data, error, isLoading } = useQuery({
    queryKey: ["channel-posts", slug, locale],
    queryFn: () => api.channels.getPosts(slug, locale),
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
    queryFn: () => api.posts.getInfo(postid),
  })

  const { post, status } = data as {
    post: any
    status: number
  }

  return { post, status }
}

export const usePostClaps = (post: Post, userId: string) => {
  // Calculate total claps from all users
  const initialTotalClaps = post.claps?.reduce((sum, clap) => sum + (clap.count || 0), 0) || 0
  // Get my claps count
  const myInitialClaps = post.claps?.find((clap) => clap.userId === userId)?.count || 0

  const [totalClaps, setTotalClaps] = useState<number>(initialTotalClaps)
  const [myClaps, setMyClaps] = useState<number>(myInitialClaps)
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [showMyClaps, setShowMyClaps] = useState<boolean>(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingClapsRef = useRef<number>(0)
  const myClapsHideTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only sync if no pending claps to avoid race conditions
    if (pendingClapsRef.current === 0) {
      const newTotalClaps = post.claps?.reduce((sum, clap) => sum + (clap.count || 0), 0) || 0
      const newMyClaps = post.claps?.find((clap) => clap.userId === userId)?.count || 0
      setTotalClaps(newTotalClaps)
      setMyClaps(newMyClaps)
    }
  }, [post, userId])

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationKey: ["clap-post", post.id],
    mutationFn: async (clapCount: number) => {
      const response = await onClapPress(post.id!, userId, clapCount)
      if (response.status !== 200) {
        throw new Error(response.message)
      }
      return response
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["channel-posts"],
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
  }, [mutate])

  // Flush pending claps before unmount or page unload
  useEffect(() => {
    const flushPendingClaps = () => {
      if (pendingClapsRef.current > 0) {
        // Use sendBeacon for reliable delivery on page unload
        const data = JSON.stringify({ postId: post.id, userId, count: pendingClapsRef.current })
        navigator.sendBeacon?.('/api/clap-post', data)
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
  }, [post.id, userId, mutate])

  return {
    totalClaps,
    myClaps,
    handleClap,
    showConfetti,
    showMyClaps,
    isPending,
  }
}

export const useGroupChat = (groupid: string) => {
  const { data } = useQuery({
    queryKey: ["member-chats"],
    queryFn: () => api.groups.getMembers(groupid),
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
    queryFn: () => api.groups.getDomain(groupid),
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
