import { onAuthenticatedUser } from "@/actions/auth"
import { onGetOngoingCourses } from "@/actions/courses"
import { onGetGroupLeaderboard } from "@/actions/leaderboard"
import { LeaderBoardCard } from "@/app/[locale]/group/_components/leaderboard"
import { GroupSideWidget } from "@/components/global/group-side-widget"
import { OngoingCoursesWidget } from "@/components/global/ongoing-courses-widget"
import { getChannelPosts } from "@/data"
import { getChannelInfo } from "@/data/channels"
import { getAppUserId } from "@/lib/get-app-user"
import { getQueryClient } from "@/lib/get-query-client"
import { getSession } from "@/lib/get-session"
import {
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query"
import CreateNewPost from "./_components/create-post"
import { FeedLayout } from "./_components/feed-layout"
import { PostFeed } from "./_components/post-feed"

type GroupChannelPageProps = {
  params: Promise<{ groupid: string; channelid: string; locale: string}>
}

const GroupChannelPage = async ({ params }: GroupChannelPageProps) => {
  const client = getQueryClient()
  const { groupid, channelid, locale } = await params

  // Both getSession() and onAuthenticatedUser() now share the same cached session
  const sessionPromise = getSession()
  const authUserPromise = onAuthenticatedUser()

  const userId = await getAppUserId()

  await Promise.allSettled([
    client.prefetchQuery({
      queryKey: ["channel-info", channelid, locale],
      queryFn: () => getChannelInfo(channelid, locale, userId, groupid),
      staleTime: 60000,
      gcTime: 300000,
    }),
    client.prefetchQuery({
      queryKey: ["channel-posts", channelid, locale],
      queryFn: () => getChannelPosts(channelid, locale, groupid),
      staleTime: 60000,
      gcTime: 300000,
    }),
    // Prefetch ongoing courses for the sidebar widget (small payload)
    client.prefetchQuery({
      queryKey: ["ongoing-courses", locale, 3],
      queryFn: () => onGetOngoingCourses(3),
      staleTime: 60000,
      gcTime: 300000,
    }),
    // Prefetch leaderboard for the sidebar widget
    client.prefetchQuery({
      queryKey: ["group-leaderboard", groupid, 10],
      queryFn: () => onGetGroupLeaderboard(groupid, 10),
      staleTime: 60000,
      gcTime: 300000,
    }),
  ])

  const [session, authUser] = await Promise.all([sessionPromise, authUserPromise])

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <FeedLayout
        sidebar={
          <>
            <GroupSideWidget groupid={groupid} hideGoToFeed />
            <OngoingCoursesWidget groupid={groupid} />
            <LeaderBoardCard light groupid={groupid} />
          </>
        }
      >
        <CreateNewPost
          userImage={session?.user?.image || ""}
          channelid={channelid}
          username={session?.user?.name?.split(" ")[0] || "User"}
          locale={locale}
          groupid={groupid}
        />
        <PostFeed channelid={channelid} userid={authUser?.id!} locale={locale} groupid={groupid} />
      </FeedLayout>
    </HydrationBoundary>
  )
}

export default GroupChannelPage
