"use client"

import {
    onGetGroupLeaderboard,
    onGetUserPointActivities,
    onGetUserRank,
} from "@/actions/leaderboard"
import { useQuery } from "@tanstack/react-query"

export const useGroupLeaderboard = (groupId: string, limit: number = 20) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["group-leaderboard", groupId, limit],
    queryFn: () => onGetGroupLeaderboard(groupId, limit),
  })

  return {
    leaderboard: data?.status === 200 ? data.leaderboard : [],
    total: data?.status === 200 ? data.total : 0,
    isLoading,
    hasError: !!error || data?.status !== 200,
  }
}

export const useUserRank = (userId: string, groupId: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ["user-rank", userId, groupId],
    queryFn: () => onGetUserRank(userId, groupId),
    enabled: !!userId && !!groupId,
  })

  return {
    rank: data?.status === 200 ? data.rank : null,
    points: data?.status === 200 ? data.points : 0,
    isLoading,
  }
}

export const useUserPointActivities = (userId: string, groupId: string, limit: number = 20) => {
  const { data, isLoading } = useQuery({
    queryKey: ["user-activities", userId, groupId, limit],
    queryFn: () => onGetUserPointActivities(userId, groupId, limit),
    enabled: !!userId && !!groupId,
  })

  return {
    activities: data?.status === 200 ? data.activities : [],
    isLoading,
  }
}
