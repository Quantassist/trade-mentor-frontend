"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Logout, Settings } from "@/icons"
import { supabaseClient } from "@/lib/utils"
import { onOffline } from "@/redux/slices/online-member-slice"
import { AppDispatch } from "@/redux/store"
import { useClerk } from "@clerk/nextjs"
import Link from "next/link"
import { useDispatch } from "react-redux"
import { DropDown } from "../drop-down"
import { useLocale, useTranslations } from "next-intl"

type UserWidgetProps = {
  image: string
  groupid?: string
  userid?: string
}

export const UserAvatar = ({ image, groupid, userid }: UserWidgetProps) => {
  const { signOut } = useClerk()
  const locale = useLocale()
  const t = useTranslations("userMenu")

  const untrackPresence = async () => {
    await supabaseClient.channel("tracking").untrack()
  }

  const dispath: AppDispatch = useDispatch()

  const onLogout = () => {
    untrackPresence()
    dispath(onOffline({ members: [{ id: userid! }] }))
    signOut({ redirectUrl: "/" })
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
        href={`/${locale}/group/${groupid}/settings/general`}
        className="flex gap-x-2 px-2"
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
