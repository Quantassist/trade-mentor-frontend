"use client"

import { usePostClaps } from "@/hooks/groups"
import { PostWithClaps } from "./index"
import { PostCard } from "./post-card"

type PostCardWithClapsProps = {
  post: PostWithClaps
  userid: string
}

export const PostCardWithClaps = ({ post, userid }: PostCardWithClapsProps) => {
  const { totalClaps, myClaps, handleClap, showConfetti, showMyClaps } = usePostClaps(
    post as any,
    userid
  )

  return (
    <PostCard
      postid={post.id}
      channelname={post.channel.name!}
      title={post.title!}
      html={post.htmlContent!}
      username={post.author.firstname + " " + post.author.lastname}
      userimage={post.author.image!}
      totalClaps={totalClaps}
      myClaps={myClaps}
      comments={post._count.comments}
      isAuthor={post.authorId === userid}
      initialHtml={post.htmlContent}
      initialJson={post.jsonContent}
      initialContent={post.content}
      onClap={handleClap}
      showConfetti={showConfetti}
      showMyClaps={showMyClaps}
    />
  )
}
