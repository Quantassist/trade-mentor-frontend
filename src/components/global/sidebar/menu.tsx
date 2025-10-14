"use client"

import { onGetGroupInfo } from "@/actions/groups"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SIDEBAR_SETTINGS_MENU } from "@/constants/menus"
import { useChannelInfo } from "@/hooks/channels"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Plus, Trash } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"
import { v4 as uuidv4 } from "uuid"
import { IChannels } from "."
import { IconRenderer } from "../icon-renderer"
import { IconDropDown } from "./icon-dropdown"
import { useSidebar } from "./sidebar-context"

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
  mobile?: boolean
}

export const SideBarMenu = ({
  channels,
  optimisticChannel,
  loading,
  groupid,
  groupUserid,
  userId,
  mutate,
  mobile,
}: SideBarMenuProps) => {
  const pathname = usePathname()
  const locale = useLocale()
  const currentPage = pathname.includes("settings") ? "settings" : "channels"
  const currentSection = pathname.split("/").pop() // TODO: Fix the bug by resolving current page in robust way
  const tr = useTranslations("menu.settings")
  const { collapsed } = useSidebar()
  const showLabels = Boolean(mobile || !collapsed)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null)

  // Fetch group role info (SSR-prefetched in layout with the same key)
  const { data: groupInfo } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => onGetGroupInfo(groupid, locale),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })
  const canManage = Boolean(
    (groupInfo as any)?.isSuperAdmin || (groupInfo as any)?.groupOwner || (groupInfo as any)?.role === "ADMIN",
  )

  const settingsPathToKey = (path?: string) => {
    switch (path) {
      case "general":
        return "general"
      case "subscriptions":
        return "subscriptions"
      case "affiliates":
        return "affiliates"
      case "domains":
        return "domains"
      case "integrations":
        return "integrations"
      default:
        return path || "general"
    }
  }
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
              href={`/${locale}/group/${groupid}/settings/${item.path}`}
            >
              {item.icon}
              <span className={cn("hidden md:inline", !showLabels && "md:hidden")}> 
                {tr(settingsPathToKey(item.path))}
              </span>
            </Link>
          ) : (
            <Link
              key={item.id}
              href={`/${locale}/group/${groupid}/settings/${item.path}`}
              className={cn(
                "flex items-center gap-x-2 p-2 hover:bg-themeGray rounded-lg",
                item.path === currentSection && "text-white",
              )}
            >
              {/* <IconRenderer icon={item.icon} mode="DARK" />
                    <p className="text-lg capitalize">{item.label}</p> */}
              {item.icon}
              <span className={cn("hidden md:inline", !showLabels && "md:hidden")}> 
                {tr(settingsPathToKey(item.path))}
              </span>
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
      <div className={cn("flex items-center", showLabels ? "justify-between" : "justify-center")}> 
        {showLabels && <p className="text-xs text-[#F7ECE9]">CHANNELS</p>}
        {userId === groupUserid && (
          <span title="Create channel">
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
          </span>
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
                      "flex hover:bg-themeGray p-2 group rounded-lg items-center",
                      showLabels ? "justify-between" : "justify-center",
                      (currentSection === channel.id || (channel.id === current && edit)) && "bg-themeGray",
                    )}
                  >
                    <Link
                      id="channel-link"
                      title={channel.name}
                      className={cn(!showLabels && "flex items-center justify-center w-full")}
                      href={`/${locale}/group/${channel.groupId}/feed/${channel.id}`}
                      {...(canManage &&
                        channel.name !== "general" &&
                        channel.name !== "announcements" && {
                          onDoubleClick: () => onEditChannel(channel.id),
                          ref: channelRef,
                        })}
                    >
                      <div className={cn("flex items-center", !showLabels ? "justify-center" : "gap-x-2")}> 
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
                        {showLabels && channel.id === current && edit ? (
                          <Input
                            type="text"
                            ref={inputRef}
                            className="bg-transparent p-0 text-lg m-0 h-full"
                          />
                        ) : showLabels ? (
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
                        ) : null}
                      </div>
                    </Link>
                    {showLabels && canManage && channel.name !== "general" &&
                      channel.name !== "announcements" && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setConfirmDeleteId(channel.id)
                          }}
                          className={cn(
                            "ml-2 content-end text-themeTextGray hover:text-gray-400",
                            mobile ? "inline" : "group-hover:inline hidden",
                          )}
                          aria-label="Delete channel"
                          title="Delete channel"
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
        {confirmDeleteId && (
          <div className="mt-2">
            <Alert variant="destructive">
              <AlertTitle>Delete channel?</AlertTitle>
              <AlertDescription>
                This action cannot be undone. The channel will be permanently removed.
              </AlertDescription>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setConfirmDeleteId(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    onChannelDetele(confirmDeleteId)
                    setConfirmDeleteId(null)
                  }}
                >
                  Delete
                </Button>
              </div>
            </Alert>
          </div>
        )}
      </div>
    </div>
  )
}
