"use client"

import { GROUPLE_CONSTANTS } from "@/constants"
import { useNavigation } from "@/hooks/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useParams } from "next/navigation"
import { NavBar as TubeNavBar } from "../tubelight-navbar"

type MenuProps = {
  orientation: "mobile" | "desktop"
}

export const Menu = ({ orientation }: MenuProps) => {
  const { section, onSetSection } = useNavigation()
  const { groupid, channelid } = useParams() as {
    groupid: string
    channelid: string
  }
  const basePath = `/group/${groupid}`

  switch (orientation) {
    case "desktop":
      // Map constants to tubelight items
      const items = GROUPLE_CONSTANTS.groupPageMenu.map((menuItem) => ({
        name: menuItem.label,
        url:
          menuItem.path === "/"
            ? `${basePath}/channel/${channelid}`
            : `${basePath}/${menuItem.path}`,
        icon: menuItem.icon,
      }))

      // Normalize the active url: for root section we highlight the channel href
      const activeUrl =
        section === basePath ? `${basePath}/channel/${channelid}` : section

      return (
        <TubeNavBar
          items={items}
          activeUrl={activeUrl}
          onItemClick={(item) => {
            if (item.url.includes("/channel/")) onSetSection(basePath)
            else onSetSection(item.url)
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
              href={
                menuItem.path === "/"
                  ? `${basePath}/channel/${channelid}`
                  : `${basePath}/${menuItem.path}`
              }
              onClick={() =>
                onSetSection(
                  menuItem.path === "/"
                    ? basePath
                    : `${basePath}/${menuItem.path}`,
                )
              }
              className={cn(
                "rounded-xl flex gap-2 py-2 px-4 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
                section ===
                  (menuItem.path === "/"
                    ? basePath
                    : `${basePath}/${menuItem.path}`)
                  ? "bg-themeGray border-[#27272A]"
                  : "",
              )}
              aria-current={
                section ===
                (menuItem.path === "/"
                  ? basePath
                  : `${basePath}/${menuItem.path}`)
                  ? "page"
                  : undefined
              }
              key={menuItem.id}
            >
              {menuItem.icon}
              {menuItem.label}
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

  const items = GROUPLE_CONSTANTS.groupPageMenu.map((menuItem) => ({
    name: menuItem.label,
    url:
      menuItem.path === "/"
        ? `${basePath}/channel/${channelid}`
        : `${basePath}/${menuItem.path}`,
    icon: menuItem.icon,
  }))

  const activeUrl =
    section === basePath ? `${basePath}/channel/${channelid}` : section

  return (
    <TubeNavBar
      items={items}
      activeUrl={activeUrl}
      onItemClick={(item) => {
        if (item.url.includes("/channel/")) onSetSection(basePath)
        else onSetSection(item.url)
      }}
      position="fixed"
      className="md:hidden"
    />
  )
}
