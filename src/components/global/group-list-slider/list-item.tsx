"use client"

import { cn } from "@/lib/utils"
import { JSX } from "react"
import { useTranslations } from "next-intl"

type GroupListItemProps = {
  icon: JSX.Element
  label: string
  selected?: string
  path?: string
}

export const GroupListItem = ({
  icon,
  label,
  selected,
  path,
}: GroupListItemProps) => {
  const t = useTranslations("explore")
  const key = (() => {
    switch (path) {
      case "":
        return "all"
      case "fitness":
        return "fitness"
      case "music":
        return "music"
      case "buisness":
        return "business"
      case "lifestyle":
        return "lifestyle"
      case "personal-development":
        return "personalDevelopment"
      case "social-media":
        return "socialMedia"
      case "tech":
        return "tech"
      default:
        return undefined
    }
  })()
  const display = key ? t(`categories.${key}`) : label
  return (
    <div
      className={cn(
        "flex gap-3 items-center py-2 px-4 rounded-2xl bg-themeGray border-2 cursor-pointer",
        selected === label ? "border-themeTextGray" : "border-themeGray",
      )}
    >
      {icon}
      {display}
    </div>
  )
}
