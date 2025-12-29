"use client"

import { cn } from "@/lib/utils"
import { Bookmark, MessageCircle, Share2 } from "lucide-react"
import { toast } from "sonner"
import { ClapButton } from "./clap-button"

type InteractionsProps = {
  id: string
  optimistic?: boolean
  totalClaps: number
  myClaps: number
  comments: number
  page?: boolean
  onClap: () => void
  showConfetti: boolean
  showMyClaps?: boolean
  onCommentClick?: () => void
  isSaved?: boolean
  onSaveClick?: () => void
  isSaving?: boolean
  postUrl?: string
}

export const Interactions = ({
  id,
  optimistic,
  totalClaps,
  myClaps,
  comments,
  page,
  onClap,
  showConfetti,
  showMyClaps = false,
  onCommentClick,
  isSaved = false,
  onSaveClick,
  isSaving = false,
  postUrl,
}: InteractionsProps) => {
  const handleShare = async () => {
    const url = postUrl || (typeof window !== "undefined" ? window.location.href : "")
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Copied to clipboard!")
    } catch {
      toast.error("Failed to copy link")
    }
  }
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3",
        page ? "" : "px-6",
      )}
    >
      <div className="flex gap-6 items-center">
        {/* Clap button - primary action, larger for engagement */}
        <ClapButton
          totalClaps={totalClaps}
          myClaps={myClaps}
          onClap={onClap}
          showConfetti={showConfetti}
          showMyClaps={showMyClaps}
          disabled={optimistic}
          size="md"
        />

        {/* Comments - secondary action */}
        <button 
          type="button"
          onClick={onCommentClick}
          className="flex items-center gap-2 text-slate-500 dark:text-themeTextGray hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group"
        >
          <div className="p-2 rounded-full group-hover:bg-blue-500/15 transition-colors">
            <MessageCircle size={22} className="group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-base font-medium tabular-nums">{comments}</span>
        </button>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        {/* Share button */}
        <button
          onClick={handleShare}
          className="p-2 rounded-full text-slate-500 dark:text-themeTextGray hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200 group"
          title="Share post"
        >
          <Share2
            size={20}
            className="transition-all duration-200 group-hover:scale-110"
          />
        </button>

        {/* Save button */}
        {onSaveClick && (
          <button
            onClick={onSaveClick}
            disabled={isSaving}
            className={cn(
              "p-2 rounded-full transition-all duration-200 group",
              isSaved
                ? "text-slate-900 dark:text-themeTextWhite"
                : "text-slate-500 dark:text-themeTextGray hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
            )}
            title={isSaved ? "Remove from saved" : "Save for later"}
          >
            <Bookmark
              size={22}
              className={cn(
                "transition-all duration-200",
                isSaved ? "fill-current" : "group-hover:scale-110"
              )}
            />
          </button>
        )}
      </div>
    </div>
  )
}
