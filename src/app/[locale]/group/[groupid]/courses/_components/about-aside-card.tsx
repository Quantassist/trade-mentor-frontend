"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function AboutAsideCard({ thumbnail }: { thumbnail?: string | null }) {
  const thumb = thumbnail ? `https://ucarecdn.com/${thumbnail}/-/scale_crop/640x360/center/-/format/auto/` : null
  return (
    <Card className="relative overflow-hidden rounded-xl border-themeGray bg-[#121315] p-0 md:sticky md:top-24">
      <div className="relative h-44 w-full">
        {thumb ? (
          <Image src={thumb} alt="Course banner" fill className="object-cover" sizes="480px" />
        ) : (
          <div className="h-full w-full bg-themeGray" />
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-themeTextGray mb-2">Kickstart your journey</p>
        <Button className="w-full">Buy Now</Button>
      </div>
    </Card>
  )
}
