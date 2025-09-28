import { GlassModal } from "@/components/global/glass-modal"
import { useAuthenticatedUser } from "@/hooks/user"
import PostCard, { Post } from "../post-card"

export const FeedCard = ({ post }: { post: Post }) => {
  const user = useAuthenticatedUser()

  return (
    <GlassModal
      trigger={<PostCard post={post} userId={user.id!} />}
      type="post"
      title=""
      description=""
    >
      <PostCard post={post} feed userId={user.id!} />
    </GlassModal>
  )
}
