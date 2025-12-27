"use client"

import { useDailyLoginTracker } from "@/hooks/leaderboard"
import { usePointsNotification } from "@/components/global/points-notification"
import { ActivityType } from "@prisma/client"

type DailyLoginTrackerProps = {
  userId: string
  groupId: string
}

export const DailyLoginTracker = ({ userId, groupId }: DailyLoginTrackerProps) => {
  const { showPointsEarned } = usePointsNotification()
  
  useDailyLoginTracker(userId, groupId, (points, activity, message) => {
    showPointsEarned(points, activity as ActivityType, message)
  })
  
  return null
}
