import { useAppSelector } from "@/redux/store"
import { PostCard } from "../post-feed/post-card"

type PaginatedPostsProps = {
  userid: string
}

export const PaginatedPosts = ({ userid }: PaginatedPostsProps) => {
  const { data } = useAppSelector((state) => state.infiniteScrollReducer)
  return data.map((post: any) => {
    const likedByMe = post.likes && post.likes.length > 0
    return (
      <PostCard
        key={post.id}
        postid={post.id}
        html={post.htmlContent}
        title={post.title}
        channelname={post.channel.name!}
        username={post.author.firstname + post.author.lastname}
        userimage={post.author.image!}
        likes={post._count.likes}
        comments={post._count.comments}
        likedByMe={likedByMe}
        isAuthor={post.authorId === userid}
        initialHtml={post.htmlContent}
        initialJson={post.jsonContent}
        initialContent={post.content}
      />
    )
  })
}
