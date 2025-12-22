import { onAuthenticatedUser } from "@/actions/auth"
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from "@tanstack/react-query"
import { LeaderboardContent } from "./_components/leaderboard-content"

type LeaderboardPageProps = {
  params: Promise<{ groupid: string; locale: string }>
}

const LeaderboardPage = async ({ params }: LeaderboardPageProps) => {
  const query = new QueryClient()
  const { groupid } = await params
  const user = await onAuthenticatedUser()

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="pb-10 container px-5 md:px-10">
        <LeaderboardContent groupid={groupid} userid={user.id!} />
      </div>
    </HydrationBoundary>
  )
}

export default LeaderboardPage