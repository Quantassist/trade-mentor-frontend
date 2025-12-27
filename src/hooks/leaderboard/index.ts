"use client"

import {
    onGetGroupLeaderboard,
    onGetUserPointActivities,
    onGetUserRank,
    onTrackDailyLogin,
} from "@/actions/leaderboard"
import { POINT_VALUES } from "@/constants/points"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

type PointsNotificationCallback = (points: number, activity: string, message?: string) => void

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

export const useDailyLoginTracker = (
  userId: string | undefined, 
  groupId: string | undefined,
  onPointsEarned?: PointsNotificationCallback
) => {
  const trackedRef = useRef(false)
  const callbackRef = useRef(onPointsEarned)
  
  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onPointsEarned
  }, [onPointsEarned])

  useEffect(() => {
    if (!userId || !groupId || trackedRef.current) return
    
    trackedRef.current = true
    onTrackDailyLogin(userId, groupId)
      .then((result) => {
        if (result.status === 200 && !result.alreadyAwarded && callbackRef.current) {
          // Small delay to ensure UI is ready to show notification
          setTimeout(() => {
            callbackRef.current?.(POINT_VALUES.DAILY_LOGIN, "DAILY_LOGIN", "Daily login bonus!")
          }, 500)
        }
      })
      .catch(() => {})
  }, [userId, groupId])
}
