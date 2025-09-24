"use client"

import { Card, CardContent } from "@/components/ui/card"
import { GROUPLE_CONSTANTS } from "@/constants"
import { useNavigation } from "@/hooks/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useParams } from "next/navigation"

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
      return (
        <Card className="bg-themeGray border-themeGray bg-clip-padding backdrop--blur__safari backdrop-filter backdrop-blur-2xl bg-opacity-60 p-1 lg:flex hidden rounded-xl">
          <CardContent className="p-0 flex gap-2">
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
                  "rounded-xl flex gap-2 py-2 px-4 items-center",
                  section ===
                    (menuItem.path === "/"
                      ? basePath
                      : `${basePath}/${menuItem.path}`)
                    ? "bg-[#09090B] border-[#27272A]"
                    : "",
                )}
                key={menuItem.id}
              >
                {section ===
                  (menuItem.path === "/"
                    ? basePath
                    : `${basePath}/${menuItem.path}`) && (
                  <span key={`icon-${menuItem.id}`}>{menuItem.icon}</span>
                )}
                {menuItem.label}
              </Link>
            ))}
          </CardContent>
        </Card>
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
                "rounded-xl flex gap-2 py-2 px-4 items-center",
                section ===
                  (menuItem.path === "/"
                    ? basePath
                    : `${basePath}/${menuItem.path}`)
                  ? "bg-themeGray border-[#27272A]"
                  : "",
              )}
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
