"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { Logout, Settings } from "@/icons"
import { signOut } from "@/lib/auth-client"
import { supabaseClient } from "@/lib/utils"
import { onOffline } from "@/redux/slices/online-member-slice"
import { AppDispatch } from "@/redux/store"
import { ArrowLeft, Check, ChevronRight, User } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
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
  const pathname = usePathname()
  const router = useRouter()
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  const untrackPresence = async () => {
    const trackingChannel = supabaseClient
      .getChannels()
      .find((channel) => channel.topic?.endsWith(":tracking"))

    if (!trackingChannel) return

    try {
      await trackingChannel.unsubscribe()
    } finally {
      supabaseClient.removeChannel(trackingChannel)
    }
  }

  const dispath: AppDispatch = useDispatch()

  const onLogout = async () => {
    try {
      await untrackPresence()
    } catch {
      // ignore presence cleanup failures
    }

    if (userid) {
      dispath(onOffline({ members: [{ id: userid }] }))
    }

    try {
      const result = await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/"
          },
        },
      })

      if (result && typeof result === "object" && "error" in result && result.error) {
        window.location.href = "/"
      }
    } catch {
      window.location.href = "/"
    }
  }

  const switchLocale = (nextLocale: string) => {
    if (!pathname || nextLocale === locale) return
    router.push({ pathname }, { locale: nextLocale })
    fetch(`${window.location.origin}/api/user/locale`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    }).catch(() => {})
    setShowLanguageMenu(false)
  }

  const labelFor = (l: string) => (l === "hi" ? "हिन्दी" : "English")

  return (
    <DropDown
      title={showLanguageMenu ? "Display language" : t("title")}
      trigger={
        <Avatar className="cursor-pointer">
          <AvatarImage src={image} alt="user" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      }
      headerLeft={showLanguageMenu ? (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowLanguageMenu(false)
          }}
          className="p-1 hover:bg-themeGray/20 rounded-md transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      ) : undefined}
    >
      {showLanguageMenu ? (
        <>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              switchLocale("en")
            }}
            className="flex w-full items-center justify-between px-2 py-2 hover:bg-themeGray/20 rounded-md text-sm"
          >
            <span>English</span>
            {locale === "en" && <Check className="h-4 w-4" />}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              switchLocale("hi")
            }}
            className="flex w-full items-center justify-between px-2 py-2 hover:bg-themeGray/20 rounded-md text-sm"
          >
            <span>हिन्दी</span>
            {locale === "hi" && <Check className="h-4 w-4" />}
          </button>
        </>
      ) : (
        <>
          <Link
            href="/profile"
            className="flex gap-x-2 px-2 py-2 items-center hover:bg-themeGray/30 rounded-md transition-colors"
          >
            <User className="h-4 w-4" />
            {t("profile") || "Profile"}
          </Link>

          <Link
            href="/account"
            className="flex gap-x-2 px-2 py-2 items-center hover:bg-themeGray/30 rounded-md transition-colors"
          >
            <Settings />
            {t("settings")}
          </Link>

          {/* Display Language */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowLanguageMenu(true)
            }}
            className="flex w-full gap-x-2 px-2 py-2 items-center justify-between hover:bg-themeGray/30 rounded-md transition-colors text-sm"
          >
            <div className="flex items-center gap-x-2">
              <span className="rounded bg-[#1F1F22] px-1.5 py-0.5 text-[10px] text-[#cbd5e1]">A/अ</span>
              <span className="whitespace-nowrap">Display language: {labelFor(locale)}</span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>

          <div className="border-t border-themeGray/30 my-1" />

          <Button
            onClick={onLogout}
            variant="ghost"
            className="flex gap-x-3 px-2 justify-start w-full"
          >
            <Logout />
            {t("logout")}
          </Button>
        </>
      )}
    </DropDown>
  )
}
