"use client"

import { UserComment } from "@/app/[locale]/group/[groupid]/feed/[channelid]/[postid]/_components/comments/user-comment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePostComment } from "@/hooks/channels"
import { Send } from "lucide-react"

type PostCommentFormProps = {
  username: string
  postid: string
  image: string
}

export const PostCommentForm = ({
  username,
  postid,
  image,
}: PostCommentFormProps) => {
  const { isPending, onCreateComment, register, variables } =
    usePostComment(postid)

  return (
    <div className="flex flex-col gap-y-5 bg-white dark:bg-[#161a20] rounded-xl p-4">
      <form
        onSubmit={onCreateComment}
        className="flex items-center border-2 bg-slate-50 dark:bg-[#1e2329] py-2 px-3 border-slate-200 dark:border-themeGray/60 rounded-xl overflow-hidden"
      >
        <Input
          className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-themeTextWhite placeholder:text-slate-400 dark:placeholder:text-themeTextGray"
          placeholder="Add a comment..."
          {...register("comment")}
        />
        <Button variant="ghost" className="p-0 hover:bg-transparent">
          <Send className="text-slate-500 dark:text-themeTextWhite" />
        </Button>
      </form>
      {isPending && variables && (
        <UserComment
          postid={postid}
          id={variables.commentid}
          optimistic
          username={username}
          image={image}
          content={variables.content}
        />
      )}
    </div>
  )
}
