"use client"

import { useAppSelector } from "@/redux/store"
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
              label="Fitness"
              text="Join top performing groups on TradeFlix"
              query="fitness"
            />
            <ExploreSlider
              label="Music"
              text="Join top performing groups on TradeFlix"
              query="music"
            />
            <ExploreSlider
              label="Lifestyle"
              text="Join top performing groups on TradeFlix"
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
