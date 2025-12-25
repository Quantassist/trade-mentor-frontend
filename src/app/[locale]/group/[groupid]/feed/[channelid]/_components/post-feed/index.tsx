"use client"
import { InfiniteScrollObserver } from "@/components/global/infinite-scroll"
import { useChannelPage } from "@/hooks/channels"
import { PaginatedPosts } from "../paginated-posts"
import { PostCardWithClaps } from "./post-card-with-claps"

type PostFeedProps = {
  channelid: string
  userid: string
  locale?: string
  groupid?: string
}

export type PostWithClaps = {
  id: string
  publicId?: string
  title: string
  htmlContent: string | null
  jsonContent: string | null
  content: string
  authorId: string
  channelId: string
  claps: {
    id: string
    userId: string
    count: number
  }[]
  channel: {
    name: string
    slug?: string
  }
  _count: {
    comments: number
    claps: number
  }
  author: {
    firstname: string
    lastname: string
    image: string | null
  }
}

export const PostFeed = ({ channelid, userid, locale, groupid }: PostFeedProps) => {
  const { data } = useChannelPage(channelid, locale, groupid)
  
  // Handle null/undefined data safely
  if (!data) {
    return <></>
  }
  
  const posts = (data as { posts?: PostWithClaps[] }).posts ?? []

  return posts.length > 0 ? (
    <>
      {posts.map((post) => (
        <PostCardWithClaps
          key={post.id}
          post={post}
          userid={userid}
        />
      ))}
      <InfiniteScrollObserver
        action="POSTS"
        loading="POST"
        identifier={channelid}
        paginate={posts.length}
        locale={locale}
      >
        <PaginatedPosts userid={userid} />
      </InfiniteScrollObserver>
    </>
  ) : (
    <></>
  )
}
