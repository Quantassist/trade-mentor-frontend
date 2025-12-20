"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"
import type { Swiper as SwiperType } from "swiper"
import { Autoplay, FreeMode, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperProps } from "swiper/react"
import { Label } from "../../ui/label"

type SliderProps = {
  children: React.ReactNode
  overlay?: boolean
  label?: string
  showNavigation?: boolean
} & SwiperProps

export const Slider = ({ children, overlay, label, showNavigation, ...rest }: SliderProps) => {
  const swiperRef = useRef<SwiperType | null>(null)

  return (
    <div className="w-full max-w-full mt-5 relative">
      {overlay && (
        <>
          <div className="absolute w-[40px] slider-overlay left-0 h-full z-50 pointer-events-none" />
          <div className="absolute w-[40px] slider-overlay-rev right-0 h-full z-50 pointer-events-none" />
        </>
      )}
      {label && <Label className="pl-7 mb-3 text-themeTextGray">{label}</Label>}
      {/* Navigation arrows positioned outside the slider */}
      <div className="flex items-center gap-3">
        {showNavigation && (
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="shrink-0 bg-themeBlack/80 hover:bg-themeGray border border-themeGray/60 rounded-full p-2 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
        )}
        <div className="flex-1 overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, FreeMode]}
            onSwiper={(swiper) => { swiperRef.current = swiper }}
            {...rest}
          >
            {children}
          </Swiper>
        </div>
        {showNavigation && (
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="shrink-0 bg-themeBlack/80 hover:bg-themeGray border border-themeGray/60 rounded-full p-2 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        )}
      </div>
    </div>
  )
}
