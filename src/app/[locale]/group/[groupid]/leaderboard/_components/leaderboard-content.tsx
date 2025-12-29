"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGroupLeaderboard, useUserRank } from "@/hooks/leaderboard"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { Crown, Loader2, Medal, RefreshCw, Star, TrendingUp, Trophy, Zap } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

type LeaderboardContentProps = {
  groupid: string
  userid: string
  canRefresh?: boolean
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

export const LeaderboardContent = ({ groupid, userid, canRefresh = false }: LeaderboardContentProps) => {
  const t = useTranslations("leaderboard")
  const queryClient = useQueryClient()
  const { leaderboard, total, isLoading } = useGroupLeaderboard(groupid, 50)
  const { rank: userRank, points: userPoints } = useUserRank(userid, groupid)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/cron/aggregate-monthly-points", {
        method: "POST",
      })
      if (response.ok) {
        // Invalidate leaderboard queries to refetch fresh data
        await queryClient.invalidateQueries({ queryKey: ["group-leaderboard"] })
        await queryClient.invalidateQueries({ queryKey: ["user-rank"] })
      }
    } catch (error) {
      console.error("Failed to refresh leaderboard:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-8">
      {/* Header */}
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20">
              <Trophy className="h-8 w-8 text-amber-400" />
            </div>
            <div>
              <h1 className="font-bold text-3xl md:text-4xl text-slate-900 dark:text-themeTextWhite">{t("pageTitle")}</h1>
              <p className="text-slate-500 dark:text-themeTextGray">{t("pageSubtitle")}</p>
            </div>
          </div>
          {canRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRefreshing ? t("refreshing") : t("refreshLeaderboard")}
            </Button>
          )}
        </div>
      </div>

      {/* User Stats Card */}
      {userRank && (
        <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                <Star className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-themeTextGray">{t("yourRank")}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-themeTextWhite">#{userRank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-themeTextGray">{t("totalPoints")}</p>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <p className="text-3xl font-bold text-amber-400">{(userPoints ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard Table - Top Members */}
      <Card className="bg-white dark:bg-[#161a20] border-slate-200 dark:border-themeGray/60 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-themeGray/40">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-themeTextWhite">{t("topMembers")}</h3>
          <p className="text-sm text-slate-500 dark:text-themeTextGray">{total} {t("membersRanked")}</p>
        </div>

        {(leaderboard?.length ?? 0) === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="h-12 w-12 text-slate-400 dark:text-themeTextGray mx-auto mb-4" />
            <p className="text-slate-500 dark:text-themeTextGray">{t("noRankings")}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-themeGray/30">
            {(leaderboard ?? []).map((entry) => {
              const isCurrentUser = entry.userId === userid
              const RankIcon = RANK_ICONS[entry.rank as keyof typeof RANK_ICONS]
              const rankColor = RANK_COLORS[entry.rank as keyof typeof RANK_COLORS]

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-themeGray/20",
                    isCurrentUser && "bg-emerald-500/10",
                  )}
                >
                  {/* Rank */}
                  <div className="w-12 flex justify-center">
                    {entry.rank <= 3 ? (
                      <div className={cn("p-2 rounded-full bg-gradient-to-r", rankColor)}>
                        {RankIcon && <RankIcon className="h-5 w-5 text-white" />}
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-slate-500 dark:text-themeTextGray">#{entry.rank}</span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center overflow-hidden">
                      {entry.user?.image ? (
                        <img
                          src={entry.user.image}
                          alt={`${entry.user.firstname}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {entry.user?.firstname?.[0]}{entry.user?.lastname?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className={cn("font-medium", isCurrentUser ? "text-emerald-500 dark:text-emerald-400" : "text-slate-900 dark:text-themeTextWhite")}>
                        {entry.user?.firstname} {entry.user?.lastname}
                        {isCurrentUser && <span className="ml-2 text-xs">({t("you")})</span>}
                      </p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span className="font-bold text-amber-400">{entry.points.toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Point System Info */}
      <Card className="bg-white dark:bg-[#161a20] border-slate-200 dark:border-themeGray/60 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-themeTextWhite mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          {t("howToEarn")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { activity: "Create a Post", points: 10 },
            { activity: "Comment", points: 3 },
            { activity: "Complete Course", points: 50 },
            { activity: "Pass Quiz", points: 15 },
            { activity: "Receive Clap", points: 1 },
            { activity: "Daily Login", points: 1 },
          ].map((item) => (
            <div key={item.activity} className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-themeBlack/50">
              <span className="text-sm text-slate-600 dark:text-themeTextGray">{item.activity}</span>
              <span className="text-sm font-semibold text-emerald-400">+{item.points}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
