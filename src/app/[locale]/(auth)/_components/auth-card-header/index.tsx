"use client"

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { usePathname } from "@/i18n/navigation"

export function AuthCardHeader() {
  const t = useTranslations("auth")
  const pathname = usePathname()
  const isSignIn = pathname?.includes("/sign-in")
  const title = isSignIn ? t("signin.title") : t("card.title")
  const description = isSignIn
    ? t("signin.description")
    : t("card.description")
  return (
    <CardHeader className="space-y-3">
      <CardTitle className="text-2xl text-white">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  )
}
