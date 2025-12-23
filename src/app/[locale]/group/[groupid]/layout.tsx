import { onAuthenticatedUser } from "@/actions/auth"
import { onGetGroupChannels } from "@/actions/channel"
import {
  onGetAllGroupMembers,
  onGetGroupInfo,
  onGetGroupSubscription,
  onGetUserGroups,
} from "@/actions/groups"
import { SidebarProvider } from "@/components/global/sidebar/sidebar-context"
import { SessionProvider } from "@/components/providers/session-provider"
import { getQueryClient } from "@/lib/get-query-client"
import { getSession } from "@/lib/get-session"
import {
  HydrationBoundary,
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
  const query = getQueryClient()
  const { groupid, locale } = await params
  // Ensure server-side translations use the current locale
  setRequestLocale(locale)

  //prefetch all our group data in the layout file
  const [user, session] = await Promise.all([
    onAuthenticatedUser(),
    getSession(),
  ])

  if (!user.id) redirect("/sign-in")

  await Promise.allSettled([
    query.prefetchQuery({
      queryKey: ["about-group-info", groupid, locale],
      queryFn: () => onGetGroupInfo(groupid, locale),
      staleTime: 60000,
      gcTime: 300000,
    }),
    query.prefetchQuery({
      queryKey: ["user-groups"],
      queryFn: () => onGetUserGroups(user.id as string),
      staleTime: 60000,
      gcTime: 300000,
    }),
    query.prefetchQuery({
      queryKey: ["group-channels", groupid],
      queryFn: () => onGetGroupChannels(groupid),
      staleTime: 60000,
      gcTime: 300000,
    }),
    query.prefetchQuery({
      queryKey: ["group-subscription"],
      queryFn: () => onGetGroupSubscription(groupid),
      staleTime: 60000,
      gcTime: 300000,
    }),
    query.prefetchQuery({
      queryKey: ["member-chats"],
      queryFn: () => onGetAllGroupMembers(groupid),
      staleTime: 60000,
      gcTime: 300000,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <SessionProvider session={session}>
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
      </SessionProvider>
    </HydrationBoundary>
  )
}

export default GroupLayout
