import { onAuthenticatedUser } from "@/actions/auth"
import { PostCommentForm } from "@/components/form/post-comments"
import { GroupSideWidget } from "@/components/global/group-side-widget"
import { getPostComments, getPostInfo } from "@/data/groups"
import { getQueryClient } from "@/lib/get-query-client"
import {
    HydrationBoundary,
    dehydrate,
} from "@tanstack/react-query"
import { PostComments } from "./_components/comments"
import { PostHeader } from "./_components/post-header"
import PostInfo from "./_components/post-info"

const PostPage = async ({
  params,
}: {
  params: Promise<{ postid: string; groupid: string; channelid: string; locale: string }>
}) => {
  const { postid, groupid, channelid, locale } = await params
  const client = getQueryClient()

  const user = await onAuthenticatedUser()

  await Promise.allSettled([
    client.prefetchQuery({
      queryKey: ["unique-post", postid, locale],
      queryFn: () => getPostInfo(postid, locale),
      staleTime: 60000,
      gcTime: 300000,
    }),
    client.prefetchQuery({
      queryKey: ["post-comments", postid],
      queryFn: () => getPostComments(postid, user.id),
      staleTime: 60000,
      gcTime: 300000,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <div className="flex justify-center w-full min-h-[calc(100dvh-var(--group-navbar-h,5rem))]">
        {/* Main content area - fixed width to match feed */}
        <div className="flex-1 max-w-[600px] border-x border-themeGray/30">
          <PostHeader channelId={channelid} groupId={groupid} />
          <div className="py-4 px-3">
            <PostInfo id={postid} userid={user.id!} locale={locale} />
            <div className="mt-4">
              <PostCommentForm
                username={user.username!}
                postid={postid}
                image={user.image!}
              />
            </div>
            <PostComments postid={postid} userid={user.id!} />
          </div>
        </div>
        {/* Sidebar - consistent width */}
        <div className="hidden lg:block w-[350px] flex-shrink-0 pt-4 pl-4 pr-2">
          <div className="sticky top-4">
            <GroupSideWidget groupid={groupid} light />
          </div>
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default PostPage
