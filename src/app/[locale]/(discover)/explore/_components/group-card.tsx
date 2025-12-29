import { Card } from "@/components/ui/card"
import { truncateString } from "@/lib/utils"
import { Lock, Globe, MessageCircle, GraduationCap } from "lucide-react"
import { Link } from "@/i18n/navigation"

type GroupStateProps = {
  id: string
  slug?: string
  name: string
  category: string
  createdAt: Date
  userId: string
  thumbnail: string | null
  description: string | null
  privacy: "PUBLIC" | "PRIVATE"
  preview?: string
  _count?: {
    channel: number
    courses: number
  }
}

export const GroupCard = ({
  id,
  slug,
  userId,
  thumbnail,
  name,
  category,
  description,
  privacy,
  preview,
  _count,
}: GroupStateProps) => {
  const isPrivate = privacy === "PRIVATE"
  const channelCount = _count?.channel ?? 0
  const courseCount = _count?.courses ?? 0

  return (
    <Link href={`/about/${slug || id}`}>
      <Card className="bg-white dark:bg-[#161a20] border-slate-200 dark:border-themeGray/60 rounded-xl overflow-hidden group transition-all duration-300 hover:bg-slate-50 dark:hover:bg-[#1e2329] hover:border-slate-300 dark:hover:border-themeGray/80 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/20 h-full">
        <div className="relative overflow-hidden">
          <img
            src={preview || `https://ucarecdn.com/${thumbnail}/`}
            alt="thumbnail"
            className="w-full aspect-video object-cover transition-all duration-300 group-hover:scale-105"
          />
          {/* Privacy Badge */}
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            isPrivate 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {isPrivate ? (
              <>
                <Lock className="h-3 w-3" />
                <span>Private</span>
              </>
            ) : (
              <>
                <Globe className="h-3 w-3" />
                <span>Public</span>
              </>
            )}
          </div>
          {/* Category Badge */}
          {category && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[#b9a9ff]/20 text-[#b9a9ff] text-xs font-medium border border-[#b9a9ff]/30 backdrop-blur-sm capitalize">
              {category}
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg text-slate-900 dark:text-themeTextWhite font-semibold group-hover:text-emerald-600 dark:group-hover:text-[#d4f0e7] transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-themeTextGray mt-2 line-clamp-2">
            {description && truncateString(description, 100)}
          </p>
          {/* Stats Row */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-themeGray/30">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-themeTextGray">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{channelCount} {channelCount === 1 ? 'channel' : 'channels'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-themeTextGray">
              <GraduationCap className="h-4 w-4" />
              <span className="text-sm">{courseCount} {courseCount === 1 ? 'course' : 'courses'}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
