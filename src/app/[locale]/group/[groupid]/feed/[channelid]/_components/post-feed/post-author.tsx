"use client"
import { useLocale, useTranslations } from "next-intl"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatRelativeTime, formatFullDateTime } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type PostAuthorProps = {
  image?: string
  username?: string
  channel: string
  createdAt?: Date | string
}

export const PostAuthor = ({ image, username, channel, createdAt }: PostAuthorProps) => {
  const tr = useTranslations("channel")
  const currentLocale = useLocale()
  
  // Get initials for avatar fallback
  const initials = username
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <div className="flex items-center gap-x-3">
      <Avatar className="h-10 w-10 ring-2 ring-slate-200 dark:ring-white/10 cursor-pointer transition-transform hover:scale-105">
        <AvatarImage src={image} alt={username || "user"} className="object-cover" />
        <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-100 dark:from-[#2a3441] dark:to-[#1e2329] text-slate-600 dark:text-themeTextWhite text-sm font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center gap-x-1.5 flex-wrap">
          <span className="text-slate-900 dark:text-themeTextWhite font-medium text-sm hover:underline cursor-pointer">
            {username}
          </span>
          {createdAt && (
            <>
              <span className="text-slate-400 dark:text-themeTextGray/40">·</span>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-slate-400 dark:text-themeTextGray/60 text-sm cursor-default hover:text-slate-600 dark:hover:text-themeTextGray transition-colors">
                      {formatRelativeTime(createdAt)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    className="bg-white dark:bg-[#1a1a1d] border-slate-200 dark:border-themeGray/60 text-slate-900 dark:text-themeTextWhite text-xs px-2.5 py-1.5 shadow-xl"
                  >
                    {formatFullDateTime(createdAt)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-themeTextGray/70">
          {currentLocale === "hi" ? (
            <>
              <span className="font-medium text-slate-600 dark:text-themeTextGray hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                #{channel}
              </span>{" "}
              {tr("postingIn")}
            </>
          ) : (
            <>
              {tr("postingIn")}{" "}
              <span className="font-medium text-slate-600 dark:text-themeTextGray hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                #{channel}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
