"use client"

import { useTranslations } from "next-intl"

export function AuthHero() {
  const t = useTranslations("auth")
  return (
    <div className="flex flex-col items-center text-center mt-5 gap-2">
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
        {t("hero.titleLine1")}
        <span className="block mt-4 ">{t("hero.titleLine2")}</span>
      </h1>
      <p className="mt-4 text-sm md:text-base text-themeTextGray max-w-xl">
        {t("hero.subtitle")}
      </p>
    </div>
  )
}
