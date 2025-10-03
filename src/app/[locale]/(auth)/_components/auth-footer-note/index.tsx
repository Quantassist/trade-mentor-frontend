"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export function AuthFooterNote() {
  const t = useTranslations("auth")
  return (
    <div className="pb-8 text-center text-sm text-themeTextGray">
      {t("footer.alreadyHaveAccount")} {" "}
      <Link href="/sign-in" className="text-white hover:underline ml-2">
        {t("footer.signIn")}
      </Link>
    </div>
  )
}
