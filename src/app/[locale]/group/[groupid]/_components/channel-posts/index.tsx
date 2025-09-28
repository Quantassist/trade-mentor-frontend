"use client"

import { Skeleton } from "@/components/global/skeleton"
import { useChannelPosts } from "@/hooks/groups"
import { useUser } from "@clerk/nextjs"
import { FeedCard } from "../feed-card"

const ChannelPosts = ({ slug }: { slug: string }) => {
  const { posts, status } = useChannelPosts(slug)

  // const { isPending, variables, channel } = useNewPostForm()
  const { isPending, variables, channel } = {
    //TODO: Dummy values to avoid build errors. Remove later
    isPending: false,
    variables: {
      htmlContent: "",
      channelId: "",
    },
    channel: {
      id: "",
      name: "",
    },
  }

  const { user } = useUser()

  return (
    <div className="flex flex-col gap-5">
      {status == "loading" &&
        [...Array(5)].map((_, index) => (
          <Skeleton key={index} element="POST" />
        ))}

      {isPending && <Skeleton element="POST" />}

      {variables && (
        <FeedCard
          post={{
            htmlContent: variables?.htmlContent || "",
            author: {
              id: user?.id || "",
              firstname: user?.firstName || "",
              lastname: user?.lastName || "",
              avatar: user?.imageUrl || "",
            },
            createdAt: new Date().toISOString(),
            channel: channel || { id: "", name: "" },
          }}
        />
      )}

      {posts?.map((post) => (
        <FeedCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export default ChannelPosts
