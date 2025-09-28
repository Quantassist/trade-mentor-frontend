import { UserComment } from "@/app/[locale]/group/[groupid]/channel/[channelid]/[postid]/_components/comments/user-comment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePostReply } from "@/hooks/channels"
import { Send } from "lucide-react"

type PostReplyProps = {
  postid: string
  commentid: string
  username: string
  image: string
}

export const PostReply = ({
  postid,
  commentid,
  username,
  image,
}: PostReplyProps) => {
  const { register, onCreateReply, variables, isPending } = usePostReply(
    postid,
    commentid,
  )
  return (
    <div className="flex flex-col gap-y-5 w-full">
      {isPending && variables && (
        <UserComment
          postid={postid}
          id={variables.replyid}
          username={username}
          image={image}
          content={variables.comment}
          optimistic
        />
      )}
      <form
        onSubmit={onCreateReply}
        className="flex items-center border-2 bg-transparent py-2 px-3 mt-5 border-themeGray rounded-xl overflow-hidden"
      >
        <Input
          {...register("comment")}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent border-none outline-none"
        />
        <Button variant="ghost" className="p-0 hover:bg-transparent">
          <Send className="text-themeGray" />
        </Button>
      </form>
    </div>
  )
}
