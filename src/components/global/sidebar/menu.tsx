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
import { Bookmark, Check, ChevronDown, Globe, Monitor, Moon, Pencil, Plus, Sun, Trash } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
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
  
  // Extract channel slug from URL - handles both /feed/[channelid] and /feed/[channelid]/[postid]
  const getCurrentChannel = () => {
    if (!pathname) return undefined
    // Match pattern: /group/{groupid}/feed/{channelSlug} or /group/{groupid}/feed/{channelSlug}/{postid}
    const feedMatch = pathname.match(/\/feed\/([^/]+)/)
    if (feedMatch) return feedMatch[1]
    // Fallback for settings pages
    if (pathname.includes("settings")) return pathname.split("/").pop()
    return pathname.split("/").pop()
  }
  const currentSection = getCurrentChannel()
  const tr = useTranslations("menu.settings")
  const t = useTranslations()
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
                  ? "bg-slate-100 dark:bg-[#2a2a2a] text-slate-900 dark:text-themeTextWhite"
                  : "text-slate-600 dark:text-themeTextWhite hover:bg-slate-200 dark:hover:bg-[#2a2a2a]/70 hover:text-slate-900 dark:hover:text-white",
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
                  ? "bg-slate-100 dark:bg-[#2a2a2a] text-slate-900 dark:text-themeTextWhite"
                  : "text-slate-600 dark:text-themeTextWhite hover:bg-slate-300 dark:hover:bg-[#2a2a2a]/70 hover:text-slate-900 dark:hover:text-white",
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
        {showLabels && <p className="text-xs text-slate-500 dark:text-themeTextWhite">{t("sidebar.channels")}</p>}
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
                      "flex w-full p-2 group rounded-lg items-center transition-colors",
                      "hover:bg-slate-200 dark:hover:bg-[#2a2a2a]/70",
                      showLabels ? "justify-between" : "justify-center",
                      (currentSection === channel.slug || (channel.slug === current && edit)) && "bg-slate-300 dark:bg-[#2a2a2a]",
                    )}
                  >
                    {editingChannelId === channel.id ? (
                      <div className="flex items-center gap-x-2 flex-1 min-w-0">
                        <IconRenderer
                          icon={channel.icon}
                          mode={currentSection === channel.slug ? "LIGHT" : "DARK"}
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
                          className="bg-slate-100 dark:bg-[#1e2329] border-slate-300 dark:border-themeGray text-slate-900 dark:text-themeTextWhite text-base h-7 flex-1"
                        />
                      </div>
                    ) : (
                      <>
                        <Link
                          id="channel-link"
                          title={channel.name}
                          className={cn("flex-1 min-w-0", !showLabels && "flex items-center justify-center w-full")}
                          href={`/group/${groupSlug}/feed/${channel.slug}`}
                        >
                          <div className={cn("flex items-center min-w-0", !showLabels ? "justify-center" : "gap-x-2")}> 
                            <IconRenderer
                              icon={channel.icon}
                              mode={currentSection === channel.slug ? "LIGHT" : "DARK"}
                            />
                            {showLabels && (
                              <p
                                className={cn(
                                  "text-lg capitalize truncate",
                                  currentSection === channel.slug
                                    ? "text-slate-900 dark:text-themeTextWhite"
                                    : "text-slate-600 dark:text-themeTextWhite",
                                )}
                              >
                                {isPending && variables && currentSection === channel.slug
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
                                className="text-slate-500 dark:text-themeTextWhite hover:text-slate-900 dark:hover:text-white"
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
                                className="text-slate-500 dark:text-themeTextWhite/60 hover:text-red-500 dark:hover:text-red-400"
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
            <Alert variant="destructive" className="bg-[#2a1215] border-[#dc2626]/50">
              <AlertTitle className="text-[#f87171]">Delete channel?</AlertTitle>
              <AlertDescription className="text-[#fca5a5]/80">
                This action cannot be undone. The channel will be permanently removed.
              </AlertDescription>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setConfirmDeleteId(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white"
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

      {/* Library Link */}
      <div className="mt-4">
        {showLabels && <p className="text-xs text-slate-500 dark:text-[#F7ECE9] mb-2">{t("sidebar.yourLibrary")}</p>}
        <Link
          href={`/${locale}/group/${groupSlug}/saved`}
          className={cn(
            "flex items-center gap-x-2 p-2 rounded-lg transition-colors",
            pathname.includes("/saved")
              ? "bg-slate-100 dark:bg-[#2a2a2a] text-slate-900 dark:text-themeTextWhite"
              : "text-slate-600 dark:text-themeTextWhite hover:bg-slate-200 dark:hover:bg-[#2a2a2a]/70 hover:text-slate-900 dark:hover:text-white",
            !showLabels && "justify-center",
          )}
          title="Saved Posts"
        >
          <Bookmark size={20} />
          {showLabels && <span className="text-lg">Saved</span>}
        </Link>
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
  const intlPathname = usePathname()
  const intlRouter = useRouter()
  const t = useTranslations()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

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
  const themeLabel = theme === "dark" ? t("sidebar.theme.dark") : theme === "light" ? t("sidebar.theme.light") : t("sidebar.theme.system")
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor

  return (
    <div className={cn(
      "mt-auto pt-6 pb-6 border-t border-slate-200 dark:border-themeGray/30",
      collapsed ? "px-1" : "px-0",
    )}>
      {showLabels && <p className="text-xs text-slate-500 dark:text-[#F7ECE9] mb-2">{t("sidebar.preferences")}</p>}
      <div className="flex flex-col gap-y-1">
        {/* Theme Switcher Row */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-x-2 p-2 rounded-lg cursor-pointer transition-colors",
                "text-slate-600 dark:text-themeTextWhite hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#2a2a2a]/70",
                !showLabels && "justify-center",
              )}
            >
              {mounted ? <ThemeIcon size={20} /> : <Monitor size={20} />}
              {showLabels && <span className="text-lg">{mounted ? themeLabel : "Theme"}</span>}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="bg-white dark:bg-[#1a1a1d] border-slate-200 dark:border-themeGray shadow-xl">
            <DropdownMenuItem 
              onClick={() => setTheme("light")}
              className="text-slate-600 dark:text-themeTextWhite hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-themeGray cursor-pointer"
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme("dark")}
              className="text-slate-600 dark:text-themeTextWhite hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-themeGray cursor-pointer"
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme("system")}
              className="text-slate-600 dark:text-themeTextWhite hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-themeGray cursor-pointer"
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
                "w-full flex items-center gap-x-2 p-2 rounded-lg cursor-pointer transition-colors",
                "text-slate-600 dark:text-themeTextWhite hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#2a2a2a]/70",
                !showLabels && "justify-center",
              )}
            >
              <Globe size={20} />
              {showLabels && <span className="text-lg">{labelFor(locale)}</span>}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-36 border-slate-200 dark:border-themeGray bg-white dark:bg-[#1a1a1d] text-slate-900 dark:text-themeTextWhite shadow-xl">
            <DropdownMenuItem
              className="cursor-pointer text-slate-600 dark:text-themeTextWhite hover:bg-slate-200 dark:hover:bg-themeGray hover:text-slate-900 dark:hover:text-white"
              onClick={() => switchLocale("en")}
            >
              <span className="flex-1">English</span>
              {locale === "en" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-slate-600 dark:text-themeTextWhite hover:bg-slate-200 dark:hover:bg-themeGray hover:text-slate-900 dark:hover:text-white"
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
