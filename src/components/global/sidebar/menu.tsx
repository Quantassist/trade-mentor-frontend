"use client"

import { Input } from "@/components/ui/input"
import { SIDEBAR_SETTINGS_MENU } from "@/constants/menus"
import { useChannelInfo } from "@/hooks/channels"
import { cn } from "@/lib/utils"
import { Plus, Trash } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { IChannels } from "."
import { IconRenderer } from "../icon-renderer"
import { IconDropDown } from "./icon-dropdown"

type SideBarMenuProps = {
  channels: IChannels[]
  optimisticChannel:
    | {
        id: string
        name: string
        icon: string
        createdAt: Date
        groupId: string | null
      }
    | undefined
  loading: boolean
  groupid: string
  groupUserid: string
  userId: string
  mutate: any
}

export const SideBarMenu = ({
  channels,
  optimisticChannel,
  loading,
  groupid,
  groupUserid,
  userId,
  mutate,
}: SideBarMenuProps) => {
  const pathname = usePathname()
  const currentPage = pathname.includes("settings") ? "settings" : "channels"
  const currentSection = pathname.split("/").pop() // TODO: Fix the bug by resolving current page in robust way
  const {
    channel: current,
    onEditChannel,
    channelRef,
    inputRef,
    variables,
    isPending,
    edit,
    triggerRef,
    onSetIcon,
    icon,
    onChannelDetele,
    deleteVariables,
  } = useChannelInfo()
  if (currentPage === "settings") {
    return (
      <div className="flex flex-col">
        {SIDEBAR_SETTINGS_MENU.map((item) =>
          item.integration ? (
            <Link
              className={cn(
                "flex items-center gap-x-2 font-semibold rounded-xl text-themeTextGray p-2 hover:bg-themeGray",
                currentPage === "settings"
                  ? !item.path && "text-white"
                  : item.path === currentSection && "text-white",
              )}
              key={item.id}
              href={`/group/${groupid}/settings/${item.path}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <Link
              key={item.id}
              href={`/group/${groupid}/settings/${item.path}`}
              className={cn(
                "flex items-center gap-x-2 p-2 hover:bg-themeGray rounded-lg",
                item.path === currentSection && "text-white",
              )}
            >
              {/* <IconRenderer icon={item.icon} mode="DARK" />
                    <p className="text-lg capitalize">{item.label}</p> */}
              {item.icon}
              {item.label}
            </Link>
          ),
        )}
      </div>
    )
  }

  //side menu component for channels
  //in the link tag we destructor the jsx element attributes to conditionally pass ref to elements we want
  //this eliminates the need for duplicates for different states
  //under the loop/map we add our optimistic ui
  return (
    <div className="flex flex-col gap-y-5">
      <div className="flex justify-between items-center">
        <p className="text-xs text-[#F7ECE9]">CHANNELS</p>
        {userId === groupUserid && (
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
      </div>
      <div className="flex flex-col">
        {channels && channels.length > 0 ? (
          <>
            {channels.map(
              (channel) =>
                channel.id !== deleteVariables?.id && (
                  <div
                    key={channel.id}
                    className={cn(
                      "flex justify-between hover:bg-themeGray p-2 group rounded-lg items-center",
                      channel.id === current && edit && "bg-themeGray",
                    )}
                  >
                    <Link
                      id="channel-link"
                      href={`/group/${channel.groupId}/channel/${channel.id}`}
                      {...(channel.name !== "general" &&
                        channel.name !== "announcements" && {
                          onDoubleClick: () => onEditChannel(channel.id),
                          ref: channelRef,
                        })}
                    >
                      <div className="flex gap-x-2 items-center">
                        {channel.id === current && edit ? (
                          <IconDropDown
                            ref={triggerRef as any}
                            page={currentPage}
                            onSetIcon={onSetIcon}
                            channelid={channel.id}
                            icon={channel.icon}
                            currentIcon={icon}
                          />
                        ) : (
                          <IconRenderer
                            icon={channel.icon}
                            mode={
                              currentSection === channel.id ? "LIGHT" : "DARK"
                            }
                          />
                        )}
                        {channel.id === current && edit ? (
                          <Input
                            type="text"
                            ref={inputRef}
                            className="bg-transparent p-0 text-lg m-0 h-full"
                          />
                        ) : (
                          <p
                            className={cn(
                              "text-lg capitalize",
                              currentSection === channel.id
                                ? "text-white"
                                : "text-themeTextGray",
                            )}
                          >
                            {isPending &&
                            variables &&
                            currentSection === channel.id
                              ? variables.name
                              : channel.name}
                          </p>
                        )}
                      </div>
                    </Link>
                    {channel.name !== "general" &&
                      channel.name !== "announcements" && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onChannelDetele(channel.id)
                          }}
                          className="group-hover:inline hidden content-end text-themeTextGray hover:text-gray-400"
                          aria-label="Delete channel"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                  </div>
                ),
            )}
            {/* Removed duplicate optimistic row; handled by react-query cache onMutate */}
          </>
        ) : (
          <p>No Channels</p>
        )}
      </div>
    </div>
  )
}
