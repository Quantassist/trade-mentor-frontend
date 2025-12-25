"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SIDEBAR_SETTINGS_MENU } from "@/constants/menus"
import { useChannelInfo } from "@/hooks/channels"
import { api } from "@/lib/api"
import { generateId } from "@/lib/id-utils"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Check, ChevronDown, Globe, Monitor, Moon, Pencil, Plus, Sun, Trash } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React from "react"
import { IChannels } from "."
import { IconRenderer } from "../icon-renderer"
import { IconDropDown } from "./icon-dropdown"
import { useSidebar } from "./sidebar-context"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter as useIntlRouter, usePathname as useIntlPathname } from "@/i18n/navigation"

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

  // Per-channel edit state with prepopulated name
  const [editingChannelId, setEditingChannelId] = React.useState<string | null>(null)
  const [editingChannelName, setEditingChannelName] = React.useState<string>("")
  const channelInputRef = React.useRef<HTMLInputElement | null>(null)

  // Focus input when editing starts
  React.useEffect(() => {
    if (editingChannelId && channelInputRef.current) {
      channelInputRef.current.focus()
      channelInputRef.current.select()
    }
  }, [editingChannelId])

  const startEditingChannel = (channelId: string, currentName: string) => {
    setEditingChannelId(channelId)
    setEditingChannelName(currentName)
  }

  const cancelEditingChannel = () => {
    setEditingChannelId(null)
    setEditingChannelName("")
  }

  const saveChannelName = (channelId: string) => {
    if (editingChannelName.trim()) {
      onEditChannel(channelId)
      if (inputRef.current) inputRef.current.value = editingChannelName
      setTimeout(() => document.dispatchEvent(new MouseEvent('click', { bubbles: true })), 0)
    }
    cancelEditingChannel()
  }

  // Fetch group role info (SSR-prefetched in layout with the same key)
  const { data: groupInfo } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => api.groups.getInfo(groupid, locale),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })
  const canManage = Boolean(
    (groupInfo as any)?.isSuperAdmin || (groupInfo as any)?.groupOwner || (groupInfo as any)?.role === "ADMIN",
  )
  // Use group slug for URL-friendly links (fallback to groupid for backward compatibility)
  const groupSlug = (groupInfo as any)?.group?.slug || groupid

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
    updateChannelById,
  } = useChannelInfo()
  if (currentPage === "settings") {
    return (
      <div className="flex flex-col">
        {SIDEBAR_SETTINGS_MENU.map((item) =>
          item.integration ? (
            <Link
              className={cn(
                "flex items-center gap-x-2 font-semibold rounded-xl p-2 transition-colors",
                item.path === currentSection
                  ? "bg-[#2a2a2a] text-white"
                  : "text-themeTextGray hover:bg-[#2a2a2a]/70 hover:text-white",
              )}
              key={item.id}
              href={`/${locale}/group/${groupSlug}/settings/${item.path}`}
            >
              {item.icon}
              <span className={cn("hidden md:inline", !showLabels && "md:hidden")}> 
                {tr(settingsPathToKey(item.path))}
              </span>
            </Link>
          ) : (
            <Link
              key={item.id}
              href={`/${locale}/group/${groupSlug}/settings/${item.path}`}
              className={cn(
                "flex items-center gap-x-2 p-2 rounded-lg transition-colors",
                item.path === currentSection
                  ? "bg-[#2a2a2a] text-white"
                  : "text-themeTextGray hover:bg-[#2a2a2a]/70 hover:text-white",
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
                    id: generateId(),
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
      <div className="flex flex-col gap-y-1">
        {channels && channels.length > 0 ? (
          <>
            {channels.map(
              (channel) =>
                channel.id !== deleteVariables?.id && (
                  <div
                    key={channel.id}
                    className={cn(
                      "flex w-full p-2 group rounded-lg items-center transition-colors hover:bg-[#2a2a2a]/70",
                      showLabels ? "justify-between" : "justify-center",
                      (currentSection === channel.id || (channel.id === current && edit)) && "bg-[#2a2a2a]",
                    )}
                  >
                    {editingChannelId === channel.id ? (
                      <div className="flex items-center gap-x-2 flex-1 min-w-0">
                        <IconRenderer
                          icon={channel.icon}
                          mode={currentSection === channel.id ? "LIGHT" : "DARK"}
                        />
                        <Input
                          ref={channelInputRef}
                          type="text"
                          value={editingChannelName}
                          onChange={(e) => setEditingChannelName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              if (editingChannelName.trim()) {
                                updateChannelById({ channelId: channel.id, name: editingChannelName })
                              }
                              cancelEditingChannel()
                            } else if (e.key === "Escape") {
                              cancelEditingChannel()
                            }
                          }}
                          onBlur={() => {
                            if (editingChannelName.trim() && editingChannelName !== channel.name) {
                              updateChannelById({ channelId: channel.id, name: editingChannelName })
                            }
                            cancelEditingChannel()
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-[#1e2329] border-themeGray text-white text-base h-7 flex-1"
                        />
                      </div>
                    ) : (
                      <>
                        <Link
                          id="channel-link"
                          title={channel.name}
                          className={cn("flex-1 min-w-0", !showLabels && "flex items-center justify-center w-full")}
                          href={`/${locale}/group/${groupSlug}/feed/${channel.slug}`}
                        >
                          <div className={cn("flex items-center min-w-0", !showLabels ? "justify-center" : "gap-x-2")}> 
                            <IconRenderer
                              icon={channel.icon}
                              mode={currentSection === channel.id ? "LIGHT" : "DARK"}
                            />
                            {showLabels && (
                              <p
                                className={cn(
                                  "text-lg capitalize truncate",
                                  currentSection === channel.id
                                    ? "text-white"
                                    : "text-themeTextGray",
                                )}
                              >
                                {isPending && variables && currentSection === channel.id
                                  ? variables.name
                                  : channel.name}
                              </p>
                            )}
                          </div>
                        </Link>
                        {showLabels && canManage && channel.name !== "general" &&
                          channel.name !== "announcements" && (
                            <div className={cn(
                              "flex items-center gap-1",
                              mobile ? "" : "opacity-0 group-hover:opacity-100 transition-opacity",
                            )}>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  startEditingChannel(channel.id, channel.name)
                                }}
                                className="text-themeTextGray hover:text-white"
                                aria-label="Edit channel name"
                                title="Edit channel name"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setConfirmDeleteId(channel.id)
                                }}
                                className="text-themeTextGray hover:text-red-400"
                                aria-label="Delete channel"
                                title="Delete channel"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          )}
                      </>
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
      {/* Bottom section: Theme & Locale switchers */}
      <SidebarFooter showLabels={showLabels} collapsed={collapsed} />
    </div>
  )
}

// Sidebar footer with theme and locale switchers - pushed to bottom, each in own row
function SidebarFooter({ showLabels, collapsed }: { showLabels: boolean; collapsed: boolean }) {
  const { setTheme, theme } = useTheme()
  const locale = useLocale()
  const intlPathname = useIntlPathname()
  const intlRouter = useIntlRouter()

  const switchLocale = (nextLocale: string) => {
    if (!intlPathname || nextLocale === locale) return
    intlRouter.push({ pathname: intlPathname }, { locale: nextLocale })
    fetch(`${window.location.origin}/api/user/locale`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    }).catch(() => {})
  }

  const labelFor = (l: string) => (l === "hi" ? "हिन्दी" : "English")
  const themeLabel = theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System"
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor

  return (
    <div className={cn(
      "mt-auto pt-4 pb-4 border-t border-themeGray/30",
      collapsed ? "px-1" : "px-0",
    )}>
      <div className="flex flex-col gap-1">
        {/* Theme Switcher Row */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 rounded-lg py-2.5 cursor-pointer transition-colors",
                "text-themeTextGray hover:text-white hover:bg-[#1e2329]",
                collapsed ? "px-2 justify-center" : "px-3",
              )}
            >
              <ThemeIcon className="h-4 w-4 shrink-0" />
              {showLabels && <span className="text-sm">{themeLabel}</span>}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="bg-[#1a1a1d] border-themeGray shadow-xl">
            <DropdownMenuItem 
              onClick={() => setTheme("light")}
              className="text-themeTextGray hover:text-white hover:bg-themeGray cursor-pointer"
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme("dark")}
              className="text-themeTextGray hover:text-white hover:bg-themeGray cursor-pointer"
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme("system")}
              className="text-themeTextGray hover:text-white hover:bg-themeGray cursor-pointer"
            >
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Locale Switcher Row */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 rounded-lg py-2.5 cursor-pointer transition-colors",
                "text-themeTextGray hover:text-white hover:bg-[#1e2329]",
                collapsed ? "px-2 justify-center" : "px-3",
              )}
            >
              <Globe className="h-4 w-4 shrink-0" />
              {showLabels && <span className="text-sm">{labelFor(locale)}</span>}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-36 border-themeGray bg-[#1a1a1d] text-white shadow-xl">
            <DropdownMenuItem
              className="cursor-pointer hover:bg-themeGray hover:text-white"
              onClick={() => switchLocale("en")}
            >
              <span className="flex-1">English</span>
              {locale === "en" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer hover:bg-themeGray hover:text-white"
              onClick={() => switchLocale("hi")}
            >
              <span className="flex-1">हिन्दी</span>
              {locale === "hi" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
