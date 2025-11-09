"use client"

import { SideBar } from "@/components/global/sidebar"
import { useSidebar } from "@/components/global/sidebar/sidebar-context"
import { cn } from "@/lib/utils"
import React from "react"
import ClientNavbarWrapper from "./navbar/ClientNavbarWrapper"
import { MobileChannelBar } from "./mobile-channels"

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
    <div className="flex min-h-screen">
      <SideBar groupid={groupid} userid={userid} />
      <div
        className={cn(
          "flex flex-col flex-1 bg-[#101011] rounded-tl-xl border-l-[1px] border-t-[1px] border-[#28282D] pb-16 sm:pb-0",
          // keep small screen left gutter 70px (sidebar width in mobile layout)
          collapsed
            ? "md:ml-[70px] lg:ml-[70px] xl:ml-[70px]"
            : "md:ml-[300px] lg:ml-[300px] xl:ml-[300px]",
        )}
      >
        <div className="sticky top-0 z-40">
          <ClientNavbarWrapper>{navbar}</ClientNavbarWrapper>
        </div>
        <div className="overflow-hidden">
          {/* Mobile channels bar under navbar */}
          <MobileChannelBar groupid={groupid} userid={userid} />
          {children}
        </div>
      </div>
    </div>
  )
}
