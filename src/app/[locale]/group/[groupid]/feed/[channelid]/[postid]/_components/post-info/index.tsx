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
  const { totalClaps, myClaps, handleClap, showConfetti, showMyClaps } = usePostClaps(
    data?.post as any,
    userid
  )

  if (data?.status !== 200 || !data) {
    return (
      <div>
        <NoResult />
      </div>
    )
  }
  return (
    <div className="rounded-lg border border-themeGray/50 bg-brand-card-elevated p-4">
      <div className="flex flex-col gap-y-5">
        <PostAuthor
          image={data.post?.author.image as string}
          username={`${data.post?.author.firstname} ${data.post?.author.lastname}`}
          channel={data.post?.channel.name as string}
        />
        <div className="flex flex-col gap-y-3">
          <h2 className="text-2xl font-bold">{data.post?.title}</h2>
          <HtmlParser html={data.post?.htmlContent as string} />
        </div>
        <Interactions
          id={id}
          page
          totalClaps={totalClaps}
          myClaps={myClaps}
          comments={data.post?._count.comments!}
          onClap={handleClap}
          showConfetti={showConfetti}
          showMyClaps={showMyClaps}
        />
      </div>
    </div>
  )
}

export default PostInfo
