"use client"

import { useComments, useReply } from "@/hooks/channels"
import { UserComment } from "./user-comment"

type PostCommentsProps = {
  postid: string
  userid: string
}

export const PostComments = ({ postid, userid }: PostCommentsProps) => {
  const { data } = useComments(postid, userid)
  const { onReply, onSetReply, onSetActiveComment, activeComment } = useReply()

  // Calculate total claps and user's claps for each comment
  const getCommentClaps = (comment: any) => {
    // Sum all clap counts from all users
    const totalClaps = comment.claps?.reduce((sum: number, clap: any) => sum + (clap.count || 0), 0) || 0
    // Find current user's claps
    const myClaps = comment.claps?.find((clap: any) => clap.userId === userid)?.count || 0
    return { totalClaps, myClaps }
  }

  return (
    <div className="mt-5">
      {data?.comments && data?.status === 200 ? (
        data.comments.map((comment) => {
          const { totalClaps, myClaps } = getCommentClaps(comment)
          return (
            <UserComment
              key={comment.id}
              id={comment.id}
              onReply={() => onSetReply(comment.id)}
              reply={onReply}
              username={`${comment.user.firstname} ${comment.user.lastname}`}
              image={comment.user.image || ""}
              content={comment.content}
              postid={postid}
              userid={userid}
              replyCount={comment._count.reply}
              commentid={comment.commentId}
              replied={comment.replied}
              activeComment={activeComment}
              onActiveComment={() => onSetActiveComment(comment.id)}
              initialClaps={totalClaps}
              initialMyClaps={myClaps}
            />
          )
        })
      ) : (
        <p className="text-themeTextGray text-sm">No comments yet</p>
      )}
    </div>
  )
}
