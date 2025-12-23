import { onCreateNewChannel, onGetGroupChannels } from "@/actions/channel"
import { onGetGroupInfo, onGetUserGroups } from "@/actions/groups"

import { IChannelInfo, IGroupInfo, IGroups } from "@/components/global/sidebar"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocale } from "next-intl"
import { usePathname as useNextPathname } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
export const useLandingNavigation = () => {
  const pathName = useNextPathname()
  const [section, setSection] = useState<string>(pathName)

  const onSetSection = (page: string) => {
    setSection(page)
  }

  return {
    section,
    onSetSection,
  }
}


export const useNavigation = (groupid?: string) => {
  const pathName = usePathname()
  const [section, setSection] = useState<string>(pathName)
  const router = useRouter()

  const onSetSection = (page: string) => {
    if (groupid) {
      // If it's the root group page, navigate to /group/[groupid]
      const targetPath = page === "/" ? `/group/${groupid}` : `/group/${groupid}/${page}`
      router.push(targetPath)
      setSection(targetPath)
    } else {
      router.push(page)
      setSection(page)
    }
  }

  return {
    section,
    onSetSection,
  }
}

export const useSideBar = (groupid: string) => {
  const locale = useLocale()
  const { data: groups } = useQuery({
    queryKey: ["user-groups"],
    queryFn: () => onGetUserGroups(""), // Fallback - actual data comes from prefetch in layout
    staleTime: Infinity, // Rely on prefetched data
  }) as { data: IGroups }

  const { data: groupInfo } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => onGetGroupInfo(groupid, locale), // This will be overridden by prefetched data
  }) as { data: IGroupInfo }

  const { data: channels } = useQuery({
    queryKey: ["group-channels", groupid],
    queryFn: () => onGetGroupChannels(groupid),
  }) as { data: IChannelInfo }

  const client = useQueryClient()

  //we use usemutation to optimistically add a channel
  //once the mutation is settled or complete we invalidate the group-channel query and trigger a refetch
  //this makes the optimistic ui seamless

  const { isPending, mutate, isError, variables } = useMutation({
    mutationFn: (data: {
      id: string
      name: string
      icon: string
      createdAt: Date
      groupId: string | null
    }) =>
      onCreateNewChannel(groupid, {
        id: data.id,
        name: data.name.toLowerCase(),
        icon: data.icon,
      }),
    onMutate: async (data) => {
      // Cancel any outgoing refetches so we don't overwrite our optimistic update
      await client.cancelQueries({ queryKey: ["group-channels", groupid] })

      // Snapshot the previous value
      const previous = client.getQueryData(["group-channels", groupid]) as
        | IChannelInfo
        | undefined

      // Optimistically update to the new value
      const optimisticChannel = {
        id: data.id,
        name: data.name.toLowerCase(),
        icon: data.icon,
        createdAt: data.createdAt,
        groupId: data.groupId,
      }

      client.setQueryData(
        ["group-channels", groupid],
        (old: IChannelInfo | undefined) => {
          if (!old)
            return {
              status: 200,
              channels: [optimisticChannel],
            } as IChannelInfo
          // De-duplication guard: if the optimistic id already exists, don't add again
          if (old.channels.some((c) => c.id === optimisticChannel.id))
            return old
          return { ...old, channels: [...old.channels, optimisticChannel] }
        },
      )

      // Return context for potential rollback
      return { previous }
    },
    onError: (_err, _variables, context: any) => {
      // Rollback to previous cache on error
      if (context?.previous) {
        client.setQueryData(["group-channels", groupid], context.previous)
      }
    },
    onSettled: async () => {
      // Refetch channels and any dependent info after mutation completes
      await client.invalidateQueries({ queryKey: ["group-channels"] })
      await client.invalidateQueries({ queryKey: ["channel-info"] })
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

  return { groupInfo, groups, mutate, variables, isPending, channels }
}
