import { onAuthenticatedUser } from "@/actions/auth"
import { onGetChannelInfo } from "@/actions/channel"
import { onGetOngoingCourses } from "@/actions/courses"
import { inGetChannelPosts } from "@/actions/groups"
import { LeaderBoardCard } from "@/app/[locale]/group/_components/leaderboard"
import { GroupSideWidget } from "@/components/global/group-side-widget"
import { OngoingCoursesWidget } from "@/components/global/ongoing-courses-widget"
import { auth } from "@/lib/auth"
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query"
import { headers } from "next/headers"
import CreateNewPost from "./_components/create-post"
import { PostFeed } from "./_components/post-feed"

type GroupChannelPageProps = {
  params: Promise<{ groupid: string; channelid: string; locale: string}>
}

const GroupChannelPage = async ({ params }: GroupChannelPageProps) => {
  const client = new QueryClient()
  const { groupid, channelid, locale } = await params

  const sessionPromise = auth.api.getSession({
    headers: await headers(),
  })
  const authUserPromise = onAuthenticatedUser()

  await Promise.allSettled([
    client.prefetchQuery({
      queryKey: ["channel-info", channelid, locale],
      queryFn: () => onGetChannelInfo(channelid, locale),
      staleTime: 60000,
      gcTime: 300000,
    }),
    client.prefetchQuery({
      queryKey: ["channel-posts", channelid, locale],
      queryFn: () => inGetChannelPosts(channelid, locale),
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
  ])

  const [session, authUser] = await Promise.all([sessionPromise, authUserPromise])

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <div className="grid lg:grid-cols-4 grid-cols-1 gap-x-5 w-full px-5 min-h-[calc(100dvh-var(--group-navbar-h,5rem))]">
        <div className="col-span-1 lg:inline relative hidden py-5">
          <LeaderBoardCard light />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-y-5 py-5">
          {/* <Menu orientation="desktop" /> */}
          <CreateNewPost
            userImage={session?.user?.image || ""}
            channelid={channelid}
            username={session?.user?.name?.split(" ")[0] || "User"}
            locale={locale}
            groupid={groupid}
          />
          <PostFeed channelid={channelid} userid={authUser?.id!} locale={locale} />
        </div>
        <div className="col-span-1 hidden lg:inline relative py-5">
          <GroupSideWidget groupid={groupid} />
          <OngoingCoursesWidget groupid={groupid} className="mt-6" />
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default GroupChannelPage
