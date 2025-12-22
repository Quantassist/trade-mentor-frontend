"use client"

import { Card } from "@/components/ui/card"
import { useGroupLeaderboard, useUserRank } from "@/hooks/leaderboard"
import { cn } from "@/lib/utils"
import { Crown, Medal, Star, TrendingUp, Trophy, Zap } from "lucide-react"

type LeaderboardContentProps = {
  groupid: string
  userid: string
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

export const LeaderboardContent = ({ groupid, userid }: LeaderboardContentProps) => {
  const { leaderboard, total, isLoading } = useGroupLeaderboard(groupid, 50)
  const { rank: userRank, points: userPoints } = useUserRank(userid, groupid)

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
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20">
            <Trophy className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="font-bold text-3xl md:text-4xl text-white">Leaderboard</h1>
            <p className="text-themeTextGray">Compete with fellow members and climb the ranks!</p>
          </div>
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
                <p className="text-sm text-themeTextGray">Your Rank</p>
                <p className="text-3xl font-bold text-white">#{userRank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-themeTextGray">Total Points</p>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <p className="text-3xl font-bold text-amber-400">{(userPoints ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Point System Info */}
      <Card className="bg-[#161a20] border-themeGray/60 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          How to Earn Points
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { activity: "Create a Post", points: 10 },
            { activity: "Helpful Post", points: 5 },
            { activity: "Mark Helpful", points: 2 },
            { activity: "Comment", points: 3 },
            { activity: "Complete Course", points: 50 },
            { activity: "Pass Quiz", points: 15 },
            { activity: "Attend Event", points: 20 },
            { activity: "Daily Login", points: 1 },
          ].map((item) => (
            <div key={item.activity} className="flex items-center justify-between p-3 rounded-lg bg-themeBlack/50">
              <span className="text-sm text-themeTextGray">{item.activity}</span>
              <span className="text-sm font-semibold text-emerald-400">+{item.points}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Leaderboard Table */}
      <Card className="bg-[#161a20] border-themeGray/60 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-themeGray/40">
          <h3 className="text-lg font-semibold text-white">Top Members</h3>
          <p className="text-sm text-themeTextGray">{total} members ranked</p>
        </div>

        {(leaderboard?.length ?? 0) === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="h-12 w-12 text-themeTextGray mx-auto mb-4" />
            <p className="text-themeTextGray">No rankings yet. Start engaging to earn points!</p>
          </div>
        ) : (
          <div className="divide-y divide-themeGray/30">
            {(leaderboard ?? []).map((entry) => {
              const isCurrentUser = entry.userId === userid
              const RankIcon = RANK_ICONS[entry.rank as keyof typeof RANK_ICONS]
              const rankColor = RANK_COLORS[entry.rank as keyof typeof RANK_COLORS]

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-4 p-4 transition-colors hover:bg-themeGray/20",
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
                      <span className="text-xl font-bold text-themeTextGray">#{entry.rank}</span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center overflow-hidden">
                      {entry.user.image ? (
                        <img
                          src={entry.user.image}
                          alt={`${entry.user.firstname}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {entry.user.firstname?.[0]}{entry.user.lastname?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className={cn("font-medium", isCurrentUser ? "text-emerald-400" : "text-white")}>
                        {entry.user.firstname} {entry.user.lastname}
                        {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
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
    </div>
  )
}
