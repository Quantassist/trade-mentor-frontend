import { onAuthenticatedUser } from "@/actions/auth"
import { onGetPostComments, onGetPostInfo } from "@/actions/groups"
import { PostCommentForm } from "@/components/form/post-comments"
import { GroupSideWidget } from "@/components/global/group-side-widget"
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query"
import { PostComments } from "./_components/comments"
import PostInfo from "./_components/post-info"

const PostPage = async ({
  params,
}: {
  params: Promise<{ postid: string; groupid: string; locale: string }>
}) => {
  const { postid, groupid, locale } = await params
  const client = new QueryClient()

  const userPromise = onAuthenticatedUser()

  await Promise.allSettled([
    client.prefetchQuery({
      queryKey: ["unique-post", postid, locale],
      queryFn: () => onGetPostInfo(postid, locale),
      staleTime: 60000,
      gcTime: 300000,
    }),
    client.prefetchQuery({
      queryKey: ["post-comments", postid],
      queryFn: () => onGetPostComments(postid),
      staleTime: 60000,
      gcTime: 300000,
    }),
  ])

  const user = await userPromise

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <div className="grid grid-cols-4 px-5 py-5 gap-x-10">
        <div className="col-span-4 lg:col-span-3">
          <PostInfo id={postid} locale={locale} />
          <PostCommentForm
            username={user.username!}
            postid={postid}
            image={user.image!}
          />
          <PostComments postid={postid} />
        </div>
        <div className="col-span-1 hidden lg:inline relative">
          <GroupSideWidget groupid={groupid} light />
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default PostPage
