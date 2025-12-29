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
      <p className="text-slate-500 dark:text-themeTextGray leading-none pt-2">
        {t("layout.or")} {" "}
        <Link href={createHref} className="underline" locale={locale}>
          {t("layout.createYourOwn")}
        </Link>
      </p>
    </>
  )
}
