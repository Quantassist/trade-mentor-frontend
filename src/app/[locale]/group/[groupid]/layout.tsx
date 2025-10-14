import { onAuthenticatedUser } from "@/actions/auth"
import { onGetGroupChannels } from "@/actions/channel"
import {
  onGetAllGroupMembers,
  onGetGroupInfo,
  onGetGroupSubscription,
  onGetUserGroups,
} from "@/actions/groups"
import { SidebarProvider } from "@/components/global/sidebar/sidebar-context"
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
import { GroupShell } from "../_components/shell"

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
      <SidebarProvider>
        <GroupShell
          groupid={groupid}
          userid={user.id}
          navbar={<Navbar groupid={groupid} userid={user.id} />}
        >
          {children}
          <MobileBottomGroupNav />
        </GroupShell>
      </SidebarProvider>
    </HydrationBoundary>
  )
}

export default GroupLayout
