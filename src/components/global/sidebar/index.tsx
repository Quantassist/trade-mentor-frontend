"use client"

import { Button } from "@/components/ui/button"
import { useGroupChatOnline } from "@/hooks/groups"
import { useSideBar } from "@/hooks/navigation"
import { CarotSort } from "@/icons"
import { cn } from "@/lib/utils"
import { Group } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { DropDown } from "../drop-down"
import { SideBarMenu } from "./menu"
import { useSidebar } from "./sidebar-context"

type SideBarProps = {
  groupid: string
  userid: string
  mobile?: boolean
}

export interface IGroupInfo {
  status: number
  group:
    | {
        id: string
        name: string
        category: string
        thumbnail: string | null
        description: string | null
        gallery: string[]
        jsonDescription: string | null
        htmlDescription: string | null
        privacy: boolean
        active: boolean
        createdAt: Date
        userId: string
        icon: string
        channel: IChannels[]
      }
    | undefined
}

export interface IChannels {
  id: string
  name: string
  icon: string
  slug: string
  createdAt: Date
  groupId: string | null
}

export interface IChannelInfo {
  status: number
  channels: IChannels[]
}

export interface IGroups {
  status: number
  groups:
    | {
        icon: string | null
        id: string
        slug?: string
        name: string
      }[]
    | undefined
}

export const SideBar = ({ groupid, userid, mobile }: SideBarProps) => {
  const pathname = usePathname()
  const { groupInfo, groups, mutate, variables, isPending, channels } =
    useSideBar(groupid)

  // console.log("sidebar groups", groups)

  useGroupChatOnline(userid)
  const { collapsed } = useSidebar()
  const effectiveCollapsed = collapsed
  const isSheet = Boolean(mobile)
  const showGroupText = isSheet || !effectiveCollapsed
  return (
    <div
      className={cn(
        "flex-col gap-y-10",
        !mobile
          ? cn(
              "h-screen fixed overflow-hidden hidden bg-black md:flex md:shrink-0",
              effectiveCollapsed
                ? "md:w-[70px] md:min-w-[70px] md:max-w-[70px] md:px-2"
                : "md:w-[280px] md:min-w-[280px] md:max-w-[280px] sm:px-5 md:px-5",
            )
          : "w-full flex",
      )}
    >
      {/* <div className="h-screen bg-black sm:w-[300px] w-[70px] flex-col gap-y-10 fixed sm:px-5 hidden sm:flex"> */}
      {groups.groups && groups.groups.length > 0 && (
        <DropDown
          title="Groups"
          trigger={
            <div
              title={groupInfo.group?.name}
              className={cn(
                "w-full flex items-center text-themeTextGray rounded-xl cursor-pointer transition-colors",
                "hover:bg-[#1e2329] hover:text-white",
                isSheet
                  ? "justify-between p-3"
                  : effectiveCollapsed
                    ? "justify-center px-0 py-2"
                    : "justify-between md:border-[1px] border-themeGray p-3",
              )}
            >
              <div className={cn(
                  "flex items-center",
                  isSheet ? "gap-x-3" : effectiveCollapsed ? "justify-center" : "gap-x-3",
                )}> 
                <div
                  className={cn(
                    "overflow-hidden rounded-xl bg-black/60 ring-1 ring-black/10",
                    "h-8 w-12",
                  )}
                >
                  <img
                    src={`https://ucarecdn.com/${groupInfo.group?.icon as string}/`}
                    alt="icon"
                    className="h-full w-full object-cover"
                  />
                </div>
                {(isSheet || !effectiveCollapsed) && (
                  <p
                    className={cn(
                      "text-sm truncate",
                      isSheet ? "inline max-w-[65%]" : "hidden md:inline max-w-[60%]",
                    )}
                  >
                    {groupInfo.group?.name}
                  </p>
                )}
              </div>
              <span
                className={cn(
                  isSheet ? "inline" : !effectiveCollapsed ? "hidden md:inline" : "hidden",
                )}
              > 
                <CarotSort />
              </span>
            </div>
          }
        >
          {groups &&
            groups.groups.length > 0 &&
            groups.groups.map((item) => (
              <Link key={item.id} href={`/group/${item.slug || item.id}/about`}>
                <Button
                  variant="ghost"
                  className="flex gap-2 w-full justify-start hover:bg-themeGray items-center"
                >
                  <Group />
                  {item.name}
                </Button>
              </Link>
            ))}
        </DropDown>
      )}
      {/* <div className="flex flex-col gap-y-5"> */}
      {/* <div className="flex justify-between items-center">
          <p className="text-xs text-[#F7ECE9]">CHANNELS</p>
          {userid === groupInfo.group?.userId && (
            <Plus
              size={16}
              className={cn(
                "text-themeTextGray cursor-pointer",
                isPending && "opacity-70",
              )}
              {...(!isPending && {
                onClick: () =>
                  mutate({
                    id: uuidv4(),
                    icon: "general",
                    name: "unnamed",
                    createdAt: new Date(),
                    groupId: groupid,
                  }),
              })}
            />
          )}
        </div> */}
      <SideBarMenu
        channels={channels.channels}
        optimisticChannel={variables}
        loading={isPending}
        groupid={groupid}
        groupUserid={groupInfo.group?.userId!}
        userId={userid}
        mutate={mutate}
        mobile={mobile}
      />
      {/* </div> */}
    </div>
  )
}
