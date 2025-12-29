"use client"

import { GROUPLE_CONSTANTS } from "@/constants"
import { useNavigation } from "@/hooks/navigation"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { useLocale, useTranslations } from "next-intl"
import { useParams, usePathname } from "next/navigation"
import { NavBar as TubeNavBar } from "../tubelight-navbar"

type MenuProps = {
  orientation: "mobile" | "desktop"
}

export const Menu = ({ orientation }: MenuProps) => {
  const locale = useLocale()
  const { section, onSetSection } = useNavigation()
  const { groupid, channelid } = useParams() as {
    groupid: string
    channelid: string
  }
  const pathname = usePathname()
  const basePath = `/group/${groupid}`
  const tr = useTranslations("menu.group")

  switch (orientation) {
    case "desktop":
      // Map constants to tubelight items
      const items = GROUPLE_CONSTANTS.groupPageMenu.map((menuItem) => ({
        name: tr(menuItem.path),
        url: `${basePath}/${menuItem.path}`,
        icon: menuItem.icon,
      }))

      // Determine active using current pathname (e.g., /group/:id/feed/:cid)
      // Use regex to match the path segment after /group/:id/ to handle slug URLs
      const pathAfterGroup = pathname?.split(`/group/${groupid}/`)[1]?.split('/')[0] || ''
      const activeFromPath = GROUPLE_CONSTANTS.groupPageMenu.find((m) =>
        m.path === pathAfterGroup
      )
      const activeUrl = activeFromPath ? `${basePath}/${activeFromPath.path}` : undefined

      return (
        <TubeNavBar
          items={items}
          activeUrl={activeUrl}
          onItemClick={(item) => {
            onSetSection(item.url)
          }}
          position="inline"
          className="hidden md:flex"
        />
      )
    case "mobile":
      return (
        <div className="flex flex-col mt-10">
          {GROUPLE_CONSTANTS.groupPageMenu.map((menuItem) => (
            <Link
              href={`${locale}/${basePath}/${menuItem.path}`}
              onClick={() => onSetSection(`${basePath}/${menuItem.path}`)}
              className={cn(
                "rounded-xl flex gap-2 py-2 px-4 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/20 dark:focus-visible:ring-white/20",
                pathname?.includes(`${basePath}/${menuItem.path}`)
                  ? "bg-slate-100 dark:bg-themeGray border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-themeTextWhite"
                  : "text-slate-600 dark:text-themeTextGray hover:bg-slate-100 dark:hover:bg-themeGray/50",
              )}
              aria-current={
                pathname?.includes(`${basePath}/${menuItem.path}`)
                  ? "page"
                  : undefined
              }
              key={menuItem.id}
            >
              {menuItem.icon}
              {tr(menuItem.path)}
            </Link>
          ))}
        </div>
      )
    default:
      return <></>
  }
  }

// Mobile-only bottom fixed group navbar
export const MobileBottomGroupNav = () => {
  const { section, onSetSection } = useNavigation()
  const { groupid, channelid } = useParams() as {
    groupid: string
    channelid: string
  }
  const basePath = `/group/${groupid}`
  const tr = useTranslations("menu.group")

  const items = GROUPLE_CONSTANTS.groupPageMenu.map((menuItem) => ({
    name: tr(menuItem.path),
    url: `${basePath}/${menuItem.path}`,
    icon: menuItem.icon,
  }))

  const activeUrl = section

  return (
    <TubeNavBar
      items={items}
      activeUrl={activeUrl}
      onItemClick={(item) => {
        onSetSection(item.url)
      }}
      position="fixed"
      stackedMobile
      fullWidth
      className="md:hidden w-full px-2 pb-[env(safe-area-inset-bottom)]"
    />
  )
}
