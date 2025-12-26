import { onGetExploreGroup } from "@/actions/groups"
import { getQueryClient } from "@/lib/get-query-client"
import {
    dehydrate,
    HydrationBoundary,
} from "@tanstack/react-query"
import { ExplorePageContent } from "./_components/explore-content"

const ExplorePage = async () => {
  const query = getQueryClient()

  await Promise.all([
    query.prefetchQuery({
      queryKey: ["technical-analysis"],
      queryFn: () => onGetExploreGroup("technical-analysis", 0),
    }),
    query.prefetchQuery({
      queryKey: ["fundamental-analysis"],
      queryFn: () => onGetExploreGroup("fundamental-analysis", 0),
    }),
    query.prefetchQuery({
      queryKey: ["personal-finance"],
      queryFn: () => onGetExploreGroup("personal-finance", 0),
    }),
    query.prefetchQuery({
      queryKey: ["investing"],
      queryFn: () => onGetExploreGroup("investing", 0),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <ExplorePageContent layout="SLIDER" />
    </HydrationBoundary>
  )
}

export default ExplorePage
