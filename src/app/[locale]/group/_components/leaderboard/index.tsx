"use client"

import { Card } from "@/components/ui/card"
import { useGroupLeaderboard } from "@/hooks/leaderboard"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { Crown, Medal, Trophy, Zap } from "lucide-react"
import { useTranslations } from "next-intl"

type LeaderBoardCardProps = {
  light?: boolean
  groupid: string
}

const RANK_COLORS = {
  1: "from-amber-500 to-yellow-400",
  2: "from-slate-400 to-gray-300",
  3: "from-amber-700 to-orange-500",
}

const RANK_ICONS = {
  1: Crown,
  2: Medal,
  3: Medal,
}

export const LeaderBoardCard = ({ light, groupid }: LeaderBoardCardProps) => {
  const t = useTranslations("leaderboard")
  const { leaderboard, isLoading } = useGroupLeaderboard(groupid, 10)
  
  return (
    <Card
      className={cn(
        "border-themeGray rounded-xl p-5 overflow-hidden",
        light ? "border-themeGray bg-[#1A1A1D]" : "bg-themeBlack",
      )}
    >
      <h2 className="text-themeTextWhite text-xl font-bold">
        {t("title")} ({t("period")})
      </h2>
      <p className="text-themeTextGray text-sm mb-4">
        {t("subtitle")}
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
        </div>
      ) : !leaderboard || leaderboard.length === 0 ? (
        <div className="py-6 text-center">
          <Trophy className="h-8 w-8 text-themeTextGray mx-auto mb-2" />
          <p className="text-themeTextGray text-sm">{t("noRankings")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {leaderboard.map((entry) => {
            const RankIcon = RANK_ICONS[entry.rank as keyof typeof RANK_ICONS]
            const rankColor = RANK_COLORS[entry.rank as keyof typeof RANK_COLORS]

            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-themeGray/20 transition-colors"
              >
                {/* Rank */}
                <div className="w-8 flex justify-center flex-shrink-0">
                  {entry.rank <= 3 ? (
                    <div className={cn("p-1.5 rounded-full bg-gradient-to-r", rankColor)}>
                      {RankIcon && <RankIcon className="h-3 w-3 text-white" />}
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-themeTextGray">#{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {entry.user?.image ? (
                    <img
                      src={entry.user.image}
                      alt={entry.user?.firstname || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xs font-semibold">
                      {entry.user?.firstname?.[0]}{entry.user?.lastname?.[0]}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {entry.user?.firstname} {entry.user?.lastname}
                  </p>
                </div>

                {/* Points */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">{entry.points}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* View Leaderboard Button */}
      <Link
        href={`/group/${groupid}/leaderboard`}
        className="block mt-4 text-center text-primary hover:text-primary/80 font-medium transition-colors"
      >
        {t("viewLeaderboard")}
      </Link>
    </Card>
  )
}
