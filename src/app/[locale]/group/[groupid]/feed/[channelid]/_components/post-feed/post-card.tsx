"use client"
import { PostCommentForm } from "@/components/form/post-comments"
import { HtmlParser } from "@/components/global/html-parser"
import { MultiPostEditContent } from "@/components/global/post-content/multi-edit"
import { SimpleModal } from "@/components/global/simple-modal"
import { Card, CardContent } from "@/components/ui/card"
import { DialogClose } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useComments, useDeletePost, useReply } from "@/hooks/channels"
import { useAuthenticatedUser } from "@/hooks/user"
import { cn } from "@/lib/utils"
import { MessageSquare, Pencil, Trash2, Upload } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { UserComment } from "../../[postid]/_components/comments/user-comment"
import { Interactions } from "./interactions"
import { PostAuthor } from "./post-author"

type PostCardProps = {
  postid: string
  title: string
  html: string
  totalClaps: number
  myClaps: number
  comments: number
  channelname: string
  userimage?: string
  username?: string
  optimistic?: boolean
  isAuthor?: boolean
  initialHtml?: string | null
  initialJson?: string | null
  initialContent?: string | null
  onClap: () => void
  showConfetti: boolean
  showMyClaps?: boolean
}

export const PostCard = ({
  userimage,
  username,
  html,
  channelname,
  title,
  totalClaps,
  myClaps,
  comments,
  postid,
  optimistic,
  isAuthor,
  initialHtml,
  initialJson,
  initialContent,
  onClap,
  showConfetti,
  showMyClaps = false,
}: PostCardProps) => {
  const pathname = usePathname()
  const formId = useMemo(() => `edit-post-form-${postid}`, [postid])
  const { mutate: deletePost } = useDeletePost(postid)
  const [showComments, setShowComments] = useState(false)
  const user = useAuthenticatedUser()
  // Only fetch comments when the section is expanded to avoid hydration mismatch
  const { data: commentsData, isLoading: isLoadingComments } = useComments(postid, user.id, showComments)
  const { onReply, onSetReply, onSetActiveComment, activeComment } = useReply()

  // Calculate claps for each comment
  const getCommentClaps = (comment: any) => {
    const total = comment.claps?.reduce((sum: number, clap: any) => sum + (clap.count || 0), 0) || 0
    const my = comment.claps?.find((clap: any) => clap.userId === user.id)?.count || 0
    return { totalClaps: total, myClaps: my }
  }

  const handleCommentClick = () => {
    setShowComments(!showComments)
  }

  const onDelete = () => {
    if (window.confirm("Delete this post? This action cannot be undone.")) {
      deletePost()
    }
  }
  return (
    <Card className="relative border-themeGray/50 bg-brand-card-elevated first-letter:rounded-2xl overflow-hidden">
      {isAuthor && (
        <div className={cn("absolute right-3 top-3 z-10 flex gap-2")}>
          <SimpleModal
            trigger={
              <button
                aria-label="Edit post"
                className="p-1 rounded-md hover:bg-[#2A2A2D]"
              >
                <Pencil size={16} />
              </button>
            }
          >
            <>
              <MultiPostEditContent postid={postid} formId={formId} />
              <div className="mt-2 border-t border-themeDarkGray pt-3 flex justify-end">
                <DialogClose asChild>
                  <button
                    type="submit"
                    form={formId}
                    className="rounded-2xl bg-primary text-primary-foreground flex gap-x-2 px-4 py-2"
                  >
                    <Upload size={16} />
                    Save
                  </button>
                </DialogClose>
              </div>
            </>
          </SimpleModal>
          <button
            aria-label="Delete post"
            onClick={onDelete}
            className="p-1 rounded-md hover:bg-[#2A2A2D]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      <CardContent className="p-3 flex flex-col gap-y-6 items-start">
        <PostAuthor
          image={userimage}
          username={username}
          channel={channelname}
        />
        <Link href={`${pathname}/${postid}`} className="w-full">
          <div className="flex flex-col gap-y-3">
            <h2 className="text-2xl">{title}</h2>
            <HtmlParser html={html} />
          </div>
        </Link>
      </CardContent>
      <Separator orientation="horizontal" className="bg-themeGray mt-3" />
      <Interactions
        id={postid}
        totalClaps={totalClaps}
        myClaps={myClaps}
        comments={comments}
        optimistic={optimistic}
        onClap={onClap}
        showConfetti={showConfetti}
        showMyClaps={showMyClaps}
        onCommentClick={handleCommentClick}
      />
      
      {/* Inline Comments Section - LinkedIn style */}
      {showComments && (
        <div className="border-t border-themeGray animate-in slide-in-from-top-2 duration-300">
          {/* Comment input */}
          <div className="px-4 py-3">
            <PostCommentForm
              username={user.username!}
              postid={postid}
              image={user.image!}
            />
          </div>
          
          {/* Comments list - show first 3 */}
          <div className="px-4 pb-3">
            {isLoadingComments ? (
              <p className="text-themeTextGray text-sm py-2">Loading comments...</p>
            ) : commentsData?.comments && commentsData.status === 200 && commentsData.comments.length > 0 ? (
              <>
                {commentsData.comments.slice(0, 3).map((comment) => {
                  const { totalClaps: cTotal, myClaps: cMy } = getCommentClaps(comment)
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
                      userid={user.id}
                      replyCount={comment._count.reply}
                      commentid={comment.commentId}
                      replied={comment.replied}
                      activeComment={activeComment}
                      onActiveComment={() => onSetActiveComment(comment.id)}
                      initialClaps={cTotal}
                      initialMyClaps={cMy}
                    />
                  )
                })}
                
                {/* Load more comments link */}
                {commentsData.comments.length > 3 && (
                  <Link 
                    href={`${pathname}/${postid}`}
                    className="flex items-center gap-2 text-sm text-themeTextGray hover:text-white transition-colors py-2"
                  >
                    <MessageSquare size={16} />
                    Load all {commentsData.comments.length} comments
                  </Link>
                )}
              </>
            ) : (
              <p className="text-themeTextGray text-sm py-2">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
