import { onAuthenticatedUser, onGetUserGroupRole } from "@/actions/auth"
import { onGetGroupLeaderboard, onGetUserRank } from "@/actions/leaderboard"
import { getQueryClient } from "@/lib/get-query-client"
import {
    HydrationBoundary,
    dehydrate,
} from "@tanstack/react-query"
import { LeaderboardContent } from "./_components/leaderboard-content"

type LeaderboardPageProps = {
  params: Promise<{ groupid: string; locale: string }>
}

const LeaderboardPage = async ({ params }: LeaderboardPageProps) => {
  const query = getQueryClient()
  const { groupid } = await params
  const [user, roleData] = await Promise.all([
    onAuthenticatedUser(),
    onGetUserGroupRole(groupid),
  ])

  // Prefetch leaderboard data
  await Promise.allSettled([
    query.prefetchQuery({
      queryKey: ["group-leaderboard", groupid, 50],
      queryFn: () => onGetGroupLeaderboard(groupid, 50),
      staleTime: 60000,
      gcTime: 300000,
    }),
    query.prefetchQuery({
      queryKey: ["user-rank", user.id, groupid],
      queryFn: () => onGetUserRank(user.id!, groupid),
      staleTime: 60000,
      gcTime: 300000,
    }),
  ])

  // Allow refresh for superadmins and group owners
  const canRefresh = !!(roleData?.isSuperAdmin || roleData?.isOwner)

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="pb-10 container px-5 md:px-10">
        <LeaderboardContent groupid={groupid} userid={user.id!} canRefresh={canRefresh} />
      </div>
    </HydrationBoundary>
  )
}

export default LeaderboardPage