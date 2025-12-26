"use client"

import { Card } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { truncateString } from "@/lib/utils"
import { BookOpen, GraduationCap } from "lucide-react"

type CourseCardProps = {
  id: string
  slug?: string
  name: string
  description: string | null
  thumbnail: string | null
  groupid: string
  moduleCount?: number
  totalCount?: number
  level?: string | null
}

export const CourseCard = ({
  id,
  slug,
  name,
  description,
  thumbnail,
  groupid,
  moduleCount,
  totalCount,
  level,
}: CourseCardProps) => {
  const courseUrlId = slug || id
  const href = `/about/${groupid}/${courseUrlId}`
  const thumbUrl = thumbnail
    ? `https://ucarecdn.com/${thumbnail}/-/scale_crop/600x340/center/-/format/auto/`
    : null

  return (
    <Link href={href}>
      <Card className="bg-[#161a20] border-themeGray/60 rounded-xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30 hover:border-themeGray/80 h-full flex flex-col">
        <div className="overflow-hidden relative">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={name}
              className="w-full aspect-video object-cover opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
            />
          ) : (
            <div className="w-full aspect-video bg-themeGray/40 flex items-center justify-center">
              <GraduationCap className="h-12 w-12 text-themeTextGray/50" />
            </div>
          )}
          {level && (
            <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full bg-black/60 text-[#b9a9ff] backdrop-blur-sm border border-white/10">
              {level}
            </span>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg text-white font-semibold group-hover:text-[#d4f0e7] transition-colors line-clamp-2">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-themeTextGray mt-2 line-clamp-2">
              {truncateString(description, 100)}
            </p>
          )}
          <div className="mt-auto pt-4 flex items-center gap-4 text-xs text-themeTextGray">
            {moduleCount != null && moduleCount > 0 && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {moduleCount} {moduleCount === 1 ? "module" : "modules"}
              </span>
            )}
            {totalCount != null && totalCount > 0 && (
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                {totalCount} {totalCount === 1 ? "lesson" : "lessons"}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
