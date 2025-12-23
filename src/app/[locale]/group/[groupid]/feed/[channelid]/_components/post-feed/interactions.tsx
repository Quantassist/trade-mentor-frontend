"use client"

import { cn } from "@/lib/utils"
import { MessageCircle } from "lucide-react"
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
}: InteractionsProps) => {
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
        <div 
          onClick={onCommentClick}
          className="flex items-center gap-2 text-themeTextGray hover:text-white transition-colors cursor-pointer group"
        >
          <div className="p-2 rounded-full group-hover:bg-blue-500/15 transition-colors">
            <MessageCircle size={22} className="group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-base font-medium tabular-nums">{comments}</span>
        </div>
      </div>
    </div>
  )
}
