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
import { setRequestLocale } from "next-intl/server"
import { redirect } from "next/navigation"
import React from "react"
import { MobileBottomGroupNav } from "../_components/group-navbar"
import { Navbar } from "../_components/navbar"

type GroupLayoutProps = {
  children: React.ReactNode
  params: Promise<{ groupid: string; locale: string }>
}

const GroupLayout = async ({ children, params }: GroupLayoutProps) => {
  const query = new QueryClient()
  const { groupid, locale } = await params
  // Ensure server-side translations use the current locale
  setRequestLocale(locale)

  //prefetch all our group data in the layout file
  const user = await onAuthenticatedUser()

  if (!user.id) redirect("/sign-in")

  await query.prefetchQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => onGetGroupInfo(groupid, locale),
  })

  await query.prefetchQuery({
    queryKey: ["user-groups"],
    queryFn: () => onGetUserGroups(user.id as string),
  })

  await query.prefetchQuery({
    queryKey: ["group-channels", groupid],
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
        <div className="md:ml-[300px] flex flex-col ml-[70px] flex-1 bg-[#101011] rounded-tl-xl overflow-hidden border-l-[1px] border-t-[1px] border-[#28282D] pb-16 sm:pb-0">
          <Navbar groupid={groupid} userid={user.id} />
          {children}
          <MobileBottomGroupNav />
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default GroupLayout
