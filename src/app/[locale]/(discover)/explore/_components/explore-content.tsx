"use client"

import { useAppSelector } from "@/redux/store"
import { Layers } from "lucide-react"
import { useTranslations } from "next-intl"
import dynamic from "next/dynamic"
import { ExploreSlider } from "./explore-slider"
import { GroupList } from "./group-list"

const SearchGroups = dynamic(
  () =>
    import("./searched-groups").then((components) => components.SearchGroups),
  {
    ssr: false,
  },
)

type ExplorePageContentProps = {
  layout: "SLIDER" | "LIST"
  category?: string
}

export const ExplorePageContent = ({
  layout,
  category,
}: ExplorePageContentProps) => {
  const { isSearching, data, status, debounce } = useAppSelector(
    (state) => state.searchReducer,
  )
  const t = useTranslations("explore")

  return (
    <div className="flex flex-col px-5 md:px-10">
      {isSearching || debounce ? (
        <SearchGroups
          searching={isSearching as boolean}
          data={data!}
          query={debounce}
        />
      ) : (
        status !== 200 &&
        (layout === "SLIDER" ? (
          <>
            {/* Categories Section Header */}
            <div className="flex items-center gap-3 mt-8 px-[40px] lg:px-[150px]">
              <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                <Layers className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Categories</h3>
                <p className="text-xs text-themeTextGray">Browse groups by topic</p>
              </div>
            </div>

            <ExploreSlider
              label={t("slider.technical-analysis.label")}
              text={t("slider.technical-analysis.text")}
              query="technical-analysis"
            />
            <ExploreSlider
              label={t("slider.fundamental-analysis.label")}
              text={t("slider.fundamental-analysis.text")}
              query="fundamental-analysis"
            />
            <ExploreSlider
              label={t("slider.personal-finance.label")}
              text={t("slider.personal-finance.text")}
              query="personal-finance"
            />
            <ExploreSlider
              label={t("slider.investing.label")}
              text={t("slider.investing.text")}
              query="investing"
            />
          </>
        ) : (
          <GroupList category={category as string} />
        ))
      )}
    </div>
  )
}
