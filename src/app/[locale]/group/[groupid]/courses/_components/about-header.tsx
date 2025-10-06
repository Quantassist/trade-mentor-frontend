"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
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
  const thumb = thumbnail ? `https://ucarecdn.com/${thumbnail}/-/scale_crop/640x360/center/-/format/auto/` : null
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-themeGray/70 text-themeTextWhite">Course</Badge>
            <Badge variant="outline" className="border-themeGray text-themeTextGray">Updated</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">{name}</h1>
          {description && (
            <p className="text-themeTextGray leading-relaxed max-w-3xl">{description}</p>
          )}
          <div className="flex items-center gap-3 pt-2">
            <Link href={`/group/${groupid}/courses/${courseId}`}>
              <Button className="px-5">Start learning</Button>
            </Link>
            <Link href={`/group/${groupid}/courses/${courseId}`}>
              <Button variant="secondary" className="bg-themeGray text-themeTextWhite">Resume</Button>
            </Link>
          </div>
        </div>
      </div>
      <div className={cn("lg:col-span-4", renderAside ? "" : "lg:hidden")}> 
        <Card className={cn("relative overflow-hidden rounded-xl border-themeGray bg-[#121315] p-0 md:sticky md:top-24")}> 
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
      </div>
    </div>
  )
}
