"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

type PostHeaderProps = {
  channelId: string
  groupId: string
}

export const PostHeader = ({ channelId, groupId }: PostHeaderProps) => {
  const router = useRouter()

  const handleBack = () => {
    router.push(`/group/${groupId}/feed/${channelId}`)
  }

  return (
    <div className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-white/80 dark:bg-themeBlack/80 backdrop-blur-md border-b border-slate-200 dark:border-themeGray/30">
      <button
        onClick={handleBack}
        className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Go back to feed"
      >
        <ArrowLeft size={20} className="text-slate-900 dark:text-themeTextWhite" />
      </button>
      <h1 className="text-lg font-semibold text-slate-900 dark:text-themeTextWhite">Post</h1>
    </div>
  )
}
