"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AboutAsideCard } from "./about-aside-card"
import Image from "next/image"
import { Link } from "@/i18n/navigation"

type AboutHeaderProps = {
  groupid: string
  courseId: string
  name: string
  description?: string | null
  thumbnail?: string | null
  renderAside?: boolean
}

export function AboutHeader({ groupid, courseId, name, description, thumbnail, renderAside = true }: AboutHeaderProps) {
  const thumb = thumbnail ? `https://ucarecdn.com/${thumbnail}/-/scale_crop/960x540/center/-/format/auto/` : null
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8">
        <div className="space-y-3">
          {/* Banner image first on small screens only (hide on lg+ to avoid duplicate with aside) */}
          <div className="lg:hidden">
            <div className="relative w-full h-52 rounded-xl overflow-hidden ring-1 ring-white/10">
              {thumb ? (
                <Image src={thumb} alt="Course banner" fill className="object-cover" sizes="100vw" />
              ) : (
                <div className="h-full w-full bg-themeGray" />
              )}
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">{name}</h1>
          {description && (
            <p className="text-themeTextGray leading-relaxed max-w-3xl">{description}</p>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-themeGray/70 text-themeTextWhite">Course</Badge>
            <Badge variant="outline" className="border-themeGray text-themeTextGray">Updated</Badge>
          </div>
        </div>
      </div>
      <div className={cn("lg:col-span-4", renderAside ? "hidden lg:block" : "hidden")}>
        <AboutAsideCard thumbnail={thumbnail} groupid={groupid} courseId={courseId} />
      </div>
      {/* Sticky CTA on mobile and tablet, hidden on lg+; constrained to container width */}
      <div className="block lg:hidden fixed bottom-4 inset-x-0 z-30">
        <div className="mx-auto max-w-6xl px-5" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <Link href={`/group/${groupid}/courses/${courseId}`}>
            <Button className="w-full">Start learning</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
