"use client"

import { useAppSelector } from "@/redux/store"
import dynamic from "next/dynamic"
import { ExploreSlider } from "./explore-slider"
import { GroupList } from "./group-list"
import { useTranslations } from "next-intl"

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
    <div className="flex flex-col">
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
              label={t("slider.fitness.label")}
              text={t("slider.fitness.text")}
              query="fitness"
            />
            <ExploreSlider
              label={t("slider.music.label")}
              text={t("slider.music.text")}
              query="music"
            />
            <ExploreSlider
              label={t("slider.lifestyle.label")}
              text={t("slider.lifestyle.text")}
              query="lifestyle"
            />
          </>
        ) : (
          <GroupList category={category as string} />
        ))
      )}
    </div>
  )
}
