"use client"

import { SideBar } from "@/components/global/sidebar"
import { useSidebar } from "@/components/global/sidebar/sidebar-context"
import { cn } from "@/lib/utils"
import React from "react"
import ClientNavbarWrapper from "./navbar/ClientNavbarWrapper"

export function GroupShell({
  groupid,
  userid,
  navbar,
  children,
}: {
  groupid: string
  userid: string
  navbar: React.ReactNode
  children: React.ReactNode
}) {
  const { collapsed } = useSidebar()

  return (
    <div className="flex h-screen md:pt-4 overflow-hidden">
      <SideBar groupid={groupid} userid={userid} />
      <div
        className={cn(
          "flex flex-col flex-1 bg-[#101011] rounded-tl-xl border-l-[1px] border-t-[1px] border-[#28282D] overflow-hidden",
          // keep small screen left gutter 70px (sidebar width in mobile layout)
          collapsed
            ? "md:ml-[70px] lg:ml-[70px] xl:ml-[70px]"
            : "md:ml-[280px] lg:ml-[280px] xl:ml-[280px]",
        )}
      >
        <ClientNavbarWrapper>{navbar}</ClientNavbarWrapper>
        {/* Mobile channels bar under navbar - scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-16 sm:pb-0">
          {/* <MobileChannelBar groupid={groupid} userid={userid} /> */}
          {children}
        </div>
      </div>
    </div>
  )
}
