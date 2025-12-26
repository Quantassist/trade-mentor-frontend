import { useAppSelector } from "@/redux/store"
import { PostCardWithClaps } from "../post-feed/post-card-with-claps"

type PaginatedPostsProps = {
  userid: string
  groupid: string
}

export const PaginatedPosts = ({ userid, groupid }: PaginatedPostsProps) => {
  const { data } = useAppSelector((state) => state.infiniteScrollReducer)
  return data.map((post: any) => (
    <PostCardWithClaps
      key={post.id}
      post={post}
      userid={userid}
      groupid={groupid}
    />
  ))
}
