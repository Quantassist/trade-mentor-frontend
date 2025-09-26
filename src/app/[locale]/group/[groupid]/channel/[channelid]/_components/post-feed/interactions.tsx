import { useLikeChannelPost } from "@/hooks/channels"
import { LikeIcon, UnlikeIcon } from "@/icons"
import { cn } from "@/lib/utils"
import { MessageCircle } from "lucide-react"

type InteractionsProps = {
  id: string
  optimistic?: boolean
  likedByMe?: boolean
  likes: number
  comments: number
  page?: boolean
}

export const Interactions = ({
  id,
  optimistic,
  likedByMe = false,
  likes,
  comments,
  page,
}: InteractionsProps) => {
  const { mutate, isPending } = useLikeChannelPost(id)

  const displayLikes = Math.max(
    0,
    isPending ? (likedByMe ? likes - 1 : likes + 1) : likes,
  )

  const renderIcon = () => {
    if (optimistic) return <UnlikeIcon />
    if (isPending) return likedByMe ? <UnlikeIcon /> : <LikeIcon />
    return likedByMe ? <LikeIcon /> : <UnlikeIcon />
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2",
        page ? "" : "px-6",
      )}
    >
      <div className="flex gap-5 text-[#757272] text-sm">
        <span className="flex gap-1 justify-center items-center">
          <span onClick={() => mutate()} className={cn("cursor-pointer")}>
            {renderIcon()}
          </span>
          {displayLikes}
        </span>

        <span className="flex gap-1 justify-center items-center">
          <MessageCircle size={16} />
          {comments}
        </span>
      </div>
    </div>
  )
}
