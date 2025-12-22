"use client"

import { useTranslations } from "next-intl"

export function AuthHero() {
  const t = useTranslations("auth")
  return (
    <div className="flex flex-col items-center text-center gap-2 max-w-sm">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white">
        {t("hero.titleLine1")}
        <span className="block mt-1 md:mt-2">{t("hero.titleLine2")}</span>
      </h1>
      <p className="mt-3 text-sm text-white/70">
        {t("hero.subtitle")}
      </p>
    </div>
  )
}
