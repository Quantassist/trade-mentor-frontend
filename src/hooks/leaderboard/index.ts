"use client"

import {
    onCheckPostUseful,
    onGetGroupLeaderboard,
    onGetPostUsefulCount,
    onGetUserPointActivities,
    onGetUserRank,
    onMarkPostUseful,
    onUnmarkPostUseful,
} from "@/actions/leaderboard"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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

export const usePostUseful = (postId: string, userId: string, groupId: string) => {
  const queryClient = useQueryClient()

  const { data: usefulData } = useQuery({
    queryKey: ["post-useful", postId, userId],
    queryFn: () => onCheckPostUseful(postId, userId),
    enabled: !!userId,
  })

  const { data: countData } = useQuery({
    queryKey: ["post-useful-count", postId],
    queryFn: () => onGetPostUsefulCount(postId),
  })

  const { mutate: markUseful, isPending: isMarking } = useMutation({
    mutationKey: ["mark-useful"],
    mutationFn: async () => {
      const result = await onMarkPostUseful(postId, userId, groupId)
      if (result.status !== 200) {
        throw new Error(result.message)
      }
      return result
    },
    onSuccess: () => {
      toast.success("Marked as useful!")
      queryClient.invalidateQueries({ queryKey: ["post-useful", postId, userId] })
      queryClient.invalidateQueries({ queryKey: ["post-useful-count", postId] })
      queryClient.invalidateQueries({ queryKey: ["group-leaderboard", groupId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const { mutate: unmarkUseful, isPending: isUnmarking } = useMutation({
    mutationKey: ["unmark-useful"],
    mutationFn: async () => {
      const result = await onUnmarkPostUseful(postId, userId)
      if (result.status !== 200) {
        throw new Error(result.message)
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-useful", postId, userId] })
      queryClient.invalidateQueries({ queryKey: ["post-useful-count", postId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const toggleUseful = () => {
    if (usefulData?.isUseful) {
      unmarkUseful()
    } else {
      markUseful()
    }
  }

  return {
    isUseful: usefulData?.isUseful ?? false,
    usefulCount: countData?.count ?? 0,
    toggleUseful,
    isLoading: isMarking || isUnmarking,
  }
}
