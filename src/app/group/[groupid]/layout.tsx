import { onAuthenticatedUser } from "@/actions/auth"
import { onGetGroupChannels } from "@/actions/channel"
import {
  onGetAllGroupMembers,
  onGetGroupInfo,
  onGetGroupSubscription,
  onGetUserGroups,
} from "@/actions/groups"
import { SideBar } from "@/components/global/sidebar"
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query"
import { redirect } from "next/navigation"
import React from "react"
import { MobileNav } from "../_components/mobile-nav"
import { Navbar } from "../_components/navbar"

type GroupLayoutProps = {
  children: React.ReactNode
  params: Promise<{ groupid: string }>
}

const GroupLayout = async ({ children, params }: GroupLayoutProps) => {
  const query = new QueryClient()
  const { groupid } = await params

  //prefetch all our group data in the layout file
  const user = await onAuthenticatedUser()

  if (!user.id) redirect("/sign-in")

  await query.prefetchQuery({
    queryKey: ["group-info"],
    queryFn: () => onGetGroupInfo(groupid),
  })

  await query.prefetchQuery({
    queryKey: ["user-groups"],
    queryFn: () => onGetUserGroups(user.id as string),
  })

  await query.prefetchQuery({
    queryKey: ["group-channels"],
    queryFn: () => onGetGroupChannels(groupid),
  })

  await query.prefetchQuery({
    queryKey: ["group-subscription"],
    queryFn: () => onGetGroupSubscription(groupid),
  })

  await query.prefetchQuery({
    queryKey: ["member-chats"],
    queryFn: () => onGetAllGroupMembers(groupid),
  })

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="flex min-h-screen md:pt-5">
        <SideBar groupid={groupid} userid={user.id} />
        <div className="md:ml-[300px] flex flex-col ml-[70px] flex-1 bg-[#101011] rounded-tl-xl overflow-hidden border-l-[1px] border-t-[1px] border-[#28282D]">
          <Navbar groupid={groupid} userid={user.id} />
          {children}
          <MobileNav groupid={groupid} />
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default GroupLayout
