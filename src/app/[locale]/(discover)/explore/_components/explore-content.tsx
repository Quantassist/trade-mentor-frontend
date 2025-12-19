"use client"

import { useAppSelector } from "@/redux/store"
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
