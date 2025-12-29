"use client"

import { GradientText } from "@/components/global/gradient-text"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"

type ExploreHeaderProps = {
  createHref: string
}

export function ExploreHeader({ createHref }: ExploreHeaderProps) {
  const t = useTranslations("explore")
  const locale = useLocale()
  return (
    <>
      <GradientText className="text-[90px] font-semibold leading-none" element="H2">
        {t("layout.title")}
      </GradientText>
      <p className="text-slate-600 dark:text-themeTextGray text-base leading-relaxed pt-4">
        {t("layout.or")} {" "}
        <Link href={createHref} className="underline text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors" locale={locale}>
          {t("layout.createYourOwn")}
        </Link>
      </p>
    </>
  )
}
