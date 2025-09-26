"use client"
import { HtmlParser } from "@/components/global/html-parser"
import { NoResult } from "@/components/global/search/no-result"
import { useGetPost } from "@/hooks/channels"
import { Interactions } from "../../../_components/post-feed/interactions"
import { PostAuthor } from "../../../_components/post-feed/post-author"

type PostInfoProps = {
  id: string
}

const PostInfo = ({ id }: PostInfoProps) => {
  const { data } = useGetPost(id)

  if (data?.status !== 200 || !data) {
    return (
      <div>
        <NoResult />
      </div>
    )
  }
  return (
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
        likedByMe={Boolean(data.post && data.post?.likes.length > 0)}
        likes={data.post?._count.likes!}
        comments={data.post?._count.comments!}
      />
    </div>
  )
}

export default PostInfo
