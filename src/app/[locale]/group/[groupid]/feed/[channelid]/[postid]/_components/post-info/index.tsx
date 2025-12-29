"use client"
import { HtmlParser } from "@/components/global/html-parser"
import { NoResult } from "@/components/global/search/no-result"
import { useGetPost } from "@/hooks/channels"
import { usePostClaps } from "@/hooks/groups"
import { Interactions } from "../../../_components/post-feed/interactions"
import { PostAuthor } from "../../../_components/post-feed/post-author"

type PostInfoProps = {
  id: string
  userid: string
  locale?: string
}

const PostInfo = ({ id, userid, locale }: PostInfoProps) => {
  const { data } = useGetPost(id, locale)
  
  // Ensure post exists before using claps hook
  const post = data?.status === 200 ? data.post : null
  const { totalClaps, myClaps, handleClap, showConfetti, showMyClaps } = usePostClaps(
    (post as any) ?? { claps: [], id: "" },
    userid
  )

  if (!post) {
    return (
      <div>
        <NoResult />
      </div>
    )
  }
  return (
    <div className="rounded-lg bg-white dark:bg-brand-card-elevated p-4">
      <div className="flex flex-col gap-y-5">
        <PostAuthor
          image={post.author?.image as string}
          username={`${post.author?.firstname} ${post.author?.lastname}`}
          channel={post.channel?.name as string}
        />
        <div className="flex flex-col gap-y-3">
          <h2 className="text-2xl font-bold">{post.title}</h2>
          <HtmlParser html={post.htmlContent as string} />
        </div>
        <Interactions
          id={id}
          page
          totalClaps={totalClaps}
          myClaps={myClaps}
          comments={post._count?.comments ?? 0}
          onClap={handleClap}
          showConfetti={showConfetti}
          showMyClaps={showMyClaps}
        />
      </div>
    </div>
  )
}

export default PostInfo
