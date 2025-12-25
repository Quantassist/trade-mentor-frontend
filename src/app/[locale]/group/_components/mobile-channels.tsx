"use client"

import { IconRenderer } from "@/components/global/icon-renderer"
import { Slider } from "@/components/global/slider"
import { useSideBar } from "@/hooks/navigation"
import { api } from "@/lib/api"
import { generateId } from "@/lib/id-utils"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import "swiper/css/bundle"
import { SwiperSlide } from "swiper/react"

export function MobileChannelBar({ groupid, userid }: { groupid: string; userid: string }) {
  const locale = useLocale()
  const pathname = usePathname()

  // fetch channels + mutation helpers
  const { channels, mutate, isPending } = useSideBar(groupid)

  // fetch role to know if user can manage
  const { data: groupInfo } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => api.groups.getInfo(groupid, locale),
  })
  const canManage = Boolean(
    (groupInfo as any)?.isSuperAdmin || (groupInfo as any)?.groupOwner || (groupInfo as any)?.role === "ADMIN",
  )

  const isChannelRoute = pathname.includes("/feed/")
  if (!isChannelRoute || !channels?.channels?.length) return null

  return (
    <div className="md:hidden sticky top-0 z-30 px-3 py-2 border-b border-themeGray/60 bg-[#0b0b0c]/80 backdrop-blur">
      <div className="px-1 pb-2">
        <p className="text-sm font-semibold tracking-wider text-themeTextGray uppercase">Channels</p>
      </div>
      <div className="flex items-center gap-3">
        {canManage && (
          <button
            aria-label="Create channel"
            title="Create channel"
            disabled={isPending}
            onClick={() =>
              mutate({
                id: generateId(),
                icon: "general",
                name: "unnamed",
                createdAt: new Date(),
                groupId: groupid,
              })
            }
            className={cn(
              "h-10 w-10 shrink-0 grid place-items-center rounded-full border border-themeGray text-themeTextGray",
              isPending && "opacity-60",
            )}
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <Slider
            slidesPerView="auto"
            freeMode
            spaceBetween={8}
            className="w-full"
          >
            {channels.channels.map((ch) => {
              const active = pathname.endsWith(ch.slug || ch.id)
              return (
                <SwiperSlide key={ch.id} className="!w-auto">
                  <a
                    href={`/${locale}/group/${groupid}/feed/${ch.slug || ch.id}`}
                    title={ch.name}
                    className={cn(
                      "px-4 py-2 rounded-full border border-themeGray flex items-center gap-2 whitespace-nowrap",
                      active ? "bg-muted text-primary" : "bg-black/40",
                    )}
                  >
                    <IconRenderer icon={ch.icon} mode={active ? "LIGHT" : "DARK"} />
                    <span className="text-sm capitalize">{ch.name}</span>
                  </a>
                </SwiperSlide>
              )
            })}
          </Slider>
        </div>
      </div>
    </div>
  )
}
