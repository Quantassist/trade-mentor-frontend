import { createClient } from "@supabase/supabase-js"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const truncateString = (string: string, maxLength: number = 200) => {
  if (string.length <= maxLength) return string
  return string.slice(0, maxLength) + "..."
}

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL! as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! as string,
)

/**
 * Format a date as relative time (e.g., "1y", "2mo", "3d", "4h", "5m")
 * Similar to Twitter's time display
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffYears >= 1) return `${diffYears}y`
  if (diffMonths >= 1) return `${diffMonths}mo`
  if (diffDays >= 1) return `${diffDays}d`
  if (diffHours >= 1) return `${diffHours}h`
  if (diffMins >= 1) return `${diffMins}m`
  return "now"
}

/**
 * Format a date as a full readable string for tooltip
 */
export const formatFullDateTime = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const validateURLString = (url: string) => {
  const youtubeRegex = new RegExp("www.youtube.com")
  const loomRegex = new RegExp("www.loom.com")

  if (youtubeRegex.test(url)) {
    return {
      url,
      type: "YOUTUBE",
    }
  }

  if (loomRegex.test(url)) {
    return {
      url,
      type: "LOOM",
    }
  } else {
    return {
      url: undefined,
      type: "IMAGE",
    }
  }
}
