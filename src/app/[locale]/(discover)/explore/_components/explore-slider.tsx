"use client"

import { Slider } from "@/components/global/slider"
import { useExploreSlider, useGroupList } from "@/hooks/groups"
import { SwiperSlide } from "swiper/react"

import { Skeleton } from "@/components/global/skeleton"
import { useAppSelector } from "@/redux/store"
import { ChevronRight } from "lucide-react"
import "swiper/css/bundle"
import { GroupCard } from "./group-card"

type ExploreSliderProps = {
  query: string
  label: string
  text: string
}

export const ExploreSlider = ({ query, label, text }: ExploreSliderProps) => {
  const { groups, status } = useGroupList(query)
  const {
    refetch,
    isFetching,
    data: fetchedData,
    onLoadSlider,
  } = useExploreSlider(query, groups?.length)

  const { data } = useAppSelector((state) => state.infiniteScrollReducer)

  return (
    status === 200 &&
    groups.length > 0 &&
    onLoadSlider && (
      <div className="flex flex-col mt-16">
        <div className="flex flex-col px-[40px] lg:px-[150px] mb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-8 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
            <h2 className="text-2xl font-bold text-white">{label}</h2>
          </div>
          <p className="text-sm text-themeTextGray ml-4">{text}</p>
          <div className="flex items-center gap-1 mt-3 ml-4 text-themeTextGray text-xs">
            <span>Swipe to see more</span>
            <ChevronRight className="h-3 w-3 animate-pulse" />
          </div>
        </div>
        <Slider
          freeMode
          className="flex"
          spaceBetween={50}
          autoHeight
          onReachEnd={() => refetch()}
          breakpoints={{
            200: {
              slidesPerView: 1.1,
              slidesOffsetBefore: 40,
              slidesOffsetAfter: 40,
            },
            820: {
              slidesPerView: 2,
              slidesOffsetBefore: 40,
              slidesOffsetAfter: 40,
            },
            1024: {
              slidesPerView: 2.5,
              slidesOffsetBefore: 150,
              slidesOffsetAfter: 150,
            },
            1280: {
              slidesPerView: 3.2,
              slidesOffsetBefore: 150,
              slidesOffsetAfter: 150,
            },
            1540: {
              slidesPerView: 4,
              slidesOffsetBefore: 150,
              slidesOffsetAfter: 150,
            },
          }}
        >
          {groups.map((group) => (
            <SwiperSlide key={group.id}>
              <GroupCard {...group} />
            </SwiperSlide>
          ))}
          {fetchedData?.status === 200 &&
            data.map((group: any) => (
              <SwiperSlide key={group.id}>
                <GroupCard {...group} />
              </SwiperSlide>
            ))}
          {isFetching && (
            <SwiperSlide>
              <Skeleton element="CARD" />
            </SwiperSlide>
          )}
        </Slider>
      </div>
    )
  )
}
