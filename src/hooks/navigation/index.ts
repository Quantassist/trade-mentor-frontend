import { onCreateNewChannel, onGetGroupChannels } from "@/actions/channel"
import { onGetGroupInfo } from "@/actions/groups"

import { IChannelInfo, IGroupInfo, IGroups } from "@/components/global/sidebar"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export const useNavigation = (groupid?: string) => {
  const pathName = usePathname()
  const [section, setSection] = useState<string>(pathName)

  const onSetSection = (page: string) => {
    if (groupid) {
      // If it's the root group page, navigate to /group/[groupid]
      const targetPath =
        page === "/" ? `/group/${groupid}` : `/group/${groupid}/${page}`
      setSection(targetPath)
    } else {
      setSection(page)
    }
  }

  return {
    section,
    onSetSection,
  }
}

export const useSideBar = (groupid: string) => {
  const { user } = useUser()
  // const userFromClerkId = await onGetUserFromClerkId(user?.id!)
  // console.log("sidebar user", user)
  const { data: groups } = useQuery({
    queryKey: ["user-groups"],
    // queryFn: () => onGetUserGroups(userFromClerkId?.id!), // This will be overridden by prefetched data
  }) as { data: IGroups }

  const { data: groupInfo } = useQuery({
    queryKey: ["group-info"],
    queryFn: () => onGetGroupInfo(groupid), // This will be overridden by prefetched data
  }) as { data: IGroupInfo }

  const { data: channels } = useQuery({
    queryKey: ["group-channels"],
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
    onSettled: async () => {
      return await client.invalidateQueries({
        queryKey: ["group-channels", "channel-info"],
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

  return { groupInfo, groups, mutate, variables, isPending, channels }
}
