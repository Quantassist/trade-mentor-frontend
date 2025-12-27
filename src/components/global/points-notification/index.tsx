"use client"

import { ActivityType } from "@prisma/client"
import { AnimatePresence, motion } from "framer-motion"
import { Coins, Flame, MessageSquare, Sparkles, Star, Trophy, Zap } from "lucide-react"
import { createContext, useCallback, useContext, useState } from "react"

type PointNotification = {
  id: string
  points: number
  activity: ActivityType
  message: string
}

type PointsNotificationContextType = {
  showPointsEarned: (points: number, activity: ActivityType, message?: string) => void
}

const PointsNotificationContext = createContext<PointsNotificationContextType | null>(null)

export const usePointsNotification = () => {
  const context = useContext(PointsNotificationContext)
  if (!context) {
    throw new Error("usePointsNotification must be used within PointsNotificationProvider")
  }
  return context
}

const ACTIVITY_CONFIG: Record<ActivityType, { icon: typeof Star; label: string; color: string }> = {
  POST_CREATED: { icon: Zap, label: "Post Created", color: "from-blue-500 to-cyan-400" },
  COMMENT_CREATED: { icon: MessageSquare, label: "Comment Added", color: "from-green-500 to-emerald-400" },
  COURSE_COMPLETED: { icon: Trophy, label: "Course Completed!", color: "from-yellow-500 to-amber-400" },
  SECTION_COMPLETED: { icon: Star, label: "Section Done", color: "from-purple-500 to-violet-400" },
  QUIZ_PASSED: { icon: Sparkles, label: "Quiz Passed!", color: "from-pink-500 to-rose-400" },
  EVENT_ATTENDED: { icon: Flame, label: "Event Attended", color: "from-orange-500 to-red-400" },
  DAILY_LOGIN: { icon: Coins, label: "Daily Bonus!", color: "from-yellow-400 to-orange-500" },
  CLAP_RECEIVED: { icon: Star, label: "Clap Received", color: "from-indigo-500 to-purple-400" },
  COMMENT_CLAP_RECEIVED: { icon: Star, label: "Comment Clapped", color: "from-teal-500 to-cyan-400" },
}

const PointsToast = ({ notification, onClose }: { notification: PointNotification; onClose: () => void }) => {
  const config = ACTIVITY_CONFIG[notification.activity]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        mass: 1
      }}
      className="relative"
    >
      {/* Glow effect behind */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.color} blur-xl opacity-50 rounded-2xl`} />
      
      {/* Main notification card */}
      <div className={`relative bg-gradient-to-r ${config.color} rounded-2xl p-[2px] shadow-2xl`}>
        <div className="bg-[#0a0a0b]/95 backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center gap-4">
          {/* Animated icon container */}
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}
          >
            <Icon className="w-6 h-6 text-white" />
            {/* Sparkle particles */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 0] }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>
          </motion.div>

          {/* Content */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
              {config.label}
            </span>
            <div className="flex items-center gap-2">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500"
              >
                +{notification.points}
              </motion.span>
              <span className="text-lg font-semibold text-white">points</span>
            </div>
            {notification.message && (
              <span className="text-xs text-white/60 mt-0.5">{notification.message}</span>
            )}
          </div>

          {/* Animated coins/stars flying */}
          <div className="absolute -right-2 -top-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  x: [0, (i - 1) * 20],
                  y: [0, -30 - i * 10],
                }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                className="absolute"
              >
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const PointsNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<PointNotification[]>([])

  const showPointsEarned = useCallback((points: number, activity: ActivityType, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`
    const notification: PointNotification = {
      id,
      points,
      activity,
      message: message || "",
    }

    setNotifications((prev) => [...prev, notification])

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 3000)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <PointsNotificationContext.Provider value={{ showPointsEarned }}>
      {children}
      
      {/* Notification container - top center for maximum visibility */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <PointsToast
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </PointsNotificationContext.Provider>
  )
}
