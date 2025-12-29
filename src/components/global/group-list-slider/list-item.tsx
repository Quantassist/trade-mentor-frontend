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
        "flex gap-3 items-center py-2 px-4 rounded-2xl border-2 cursor-pointer transition-colors",
        "bg-slate-100 dark:bg-themeGray text-slate-700 dark:text-themeTextWhite",
        "hover:bg-slate-200 dark:hover:bg-themeGray/80",
        selected === label 
          ? "border-slate-400 dark:border-themeTextGray" 
          : "border-slate-200 dark:border-themeGray",
      )}
    >
      {icon}
      {display}
    </div>
  )
}
