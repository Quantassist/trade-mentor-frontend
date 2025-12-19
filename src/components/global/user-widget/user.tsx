"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Logout, Settings } from "@/icons"
import { signOut } from "@/lib/auth-client"
import { supabaseClient } from "@/lib/utils"
import { onOffline } from "@/redux/slices/online-member-slice"
import { AppDispatch } from "@/redux/store"
import { User } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useDispatch } from "react-redux"
import { DropDown } from "../drop-down"

type UserWidgetProps = {
  image: string
  groupid?: string
  userid?: string
}

export const UserAvatar = ({ image, groupid, userid }: UserWidgetProps) => {
  const locale = useLocale()
  const t = useTranslations("userMenu")

  const untrackPresence = async () => {
    await supabaseClient.channel("tracking").untrack()
  }

  const dispath: AppDispatch = useDispatch()

  const onLogout = async () => {
    untrackPresence()
    dispath(onOffline({ members: [{ id: userid! }] }))
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/"
        },
      },
    })
  }

  return (
    <DropDown
      title={t("title")}
      trigger={
        <Avatar className="cursor-pointer">
          <AvatarImage src={image} alt="user" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      }
    >
      <Link
        href={`/${locale}/profile`}
        className="flex gap-x-2 px-2 py-1.5 items-center hover:bg-themeGray/20 rounded-md transition-colors"
      >
        <User className="h-4 w-4" />
        {t("profile") || "Profile"}
      </Link>

      <Link
        href={`/${locale}/settings`}
        className="flex gap-x-2 px-2 py-1.5 items-center hover:bg-themeGray/20 rounded-md transition-colors"
      >
        <Settings />
        {t("settings")}
      </Link>

      <Button
        onClick={onLogout}
        variant="ghost"
        className="flex gap-x-3 px-2 justify-start w-full"
      >
        <Logout />
        {t("logout")}
      </Button>
    </DropDown>
  )
}
