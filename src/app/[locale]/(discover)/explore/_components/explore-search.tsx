"use client"

import { Search } from "@/components/global/search"
import { useTranslations } from "next-intl"

type ExploreSearchProps = {
  containerClassName?: string
  inputStyle?: string
}

export function ExploreSearch({ containerClassName = "rounded-3xl border-slate-200 dark:border-themeGray py-2 px-5 mt-10 mb-3 bg-white dark:bg-transparent", inputStyle = "lg:w-[500px] text-lg h-auto z-[9999]" }: ExploreSearchProps) {
  const t = useTranslations("explore")
  return (
    <Search
      placeholder={t("search.placeholder")}
      searchType="GROUPS"
      glass
      inputStyle={inputStyle}
      className={containerClassName}
    />
  )
}
