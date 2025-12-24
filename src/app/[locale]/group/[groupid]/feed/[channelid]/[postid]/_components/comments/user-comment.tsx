"use client"

import { Loader } from "@/components/global/loader"
import { PostReply } from "@/components/global/post-reply"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useCommentClaps, useGetReplies } from "@/hooks/channels"
import { Chat } from "@/icons"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"
import { CommentClapButton } from "./comment-clap-button"

type UserCommentProps = {
  image: string
  username: string
  content: string
  optimistic?: boolean
  onReply?: () => void
  reply?: { comment?: string; reply: boolean }
  id: string
  postid: string
  userid?: string
  replyCount?: number
  commentid?: string | null
  replied?: boolean | null
  activeComment?: string
  onActiveComment?(): void
  noReply?: boolean
  initialClaps?: number
  initialMyClaps?: number
}

export const UserComment = ({
  image,
  username,
  content,
  optimistic,
  onReply,
  reply,
  id,
  postid,
  userid,
  replyCount,
  commentid,
  replied,
  activeComment,
  onActiveComment,
  noReply,
  initialClaps = 0,
  initialMyClaps = 0,
}: UserCommentProps) => {
  const { data, isFetching } = useGetReplies(activeComment!)
  const { totalClaps, myClaps, handleClap, showConfetti, showMyClaps } = useCommentClaps(
    id,
    initialClaps,
    initialMyClaps
  )

  return (
    <div className={cn("flex gap-x-2", optimistic ? "opacity-50" : "")}>
      <div className="flex flex-col gap-y-1">
        <Avatar>
          <AvatarImage src={image} alt="user" />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
        <Separator
          orientation="vertical"
          className="flex-1 h-4 self-center bg-gray-500"
        />
      </div>
      <div className="flex flex-col items-start mt-2 w-full pb-5 gap-y-2">
        <h3 className="font-semibold text-sm">{username}</h3>
        <p className="font-light text-sm">{content}</p>
        <div className="flex items-center gap-x-5">
          <CommentClapButton
            totalClaps={totalClaps}
            myClaps={myClaps}
            onClap={handleClap}
            showConfetti={showConfetti}
            showMyClaps={showMyClaps}
            disabled={optimistic}
          />
          {!noReply && (
            <span
              {...(!optimistic && {
                onClick: onReply,
              })}
              className="flex items-center gap-x-1 text-themeTextGray text-xs cursor-pointer"
            >
              <Chat />
              Reply
            </span>
          )}
        </div>
        {replyCount && replyCount > 0 ? (
          <>
            <Loader loading={isFetching && activeComment === id}>
              {data?.replies &&
                data.replies?.length > 0 &&
                data.replies.map(
                  (rep: any) => {
                    // Calculate claps for this reply
                    const replyTotalClaps = rep.claps?.reduce((sum: number, clap: any) => sum + (clap.count || 0), 0) || 0
                    const replyMyClaps = rep.claps?.find((clap: any) => clap.userId === userid)?.count || 0
                    return rep.commentId === id && (
                      <UserComment
                        key={rep.id}
                        content={rep.content}
                        id={rep.id}
                        postid={postid}
                        userid={userid}
                        username={`${rep.user.firstname} ${rep.user.lastname}`}
                        image={rep.user.image!}
                        reply={reply}
                        onReply={onReply}
                        noReply
                        initialClaps={replyTotalClaps}
                        initialMyClaps={replyMyClaps}
                      />
                    )
                  },
                )}
            </Loader>
            <span
              onClick={onActiveComment}
              className="hover:bg-themeGray text-sm cursor-pointer p-2 rounded-lg"
            >
              Load more replies
            </span>
          </>
        ) : (
          <></>
        )}
        {reply?.comment === id && reply.reply && (
          <PostReply
            postid={postid}
            commentid={id}
            username={username}
            image={image}
            userid={userid}
          />
        )}
      </div>
    </div>
  )
}
