import { onGetExploreGroup } from "@/actions/groups"
import { getQueryClient } from "@/lib/get-query-client"
import {
    dehydrate,
    HydrationBoundary,
} from "@tanstack/react-query"
import { ExplorePageContent } from "../_components/explore-content"

const ExploreCategoryPage = async ({
  params,
}: {
  params: Promise<{ category: string }>
}) => {
  const query = getQueryClient()
  const { category } = await params

  await query.prefetchQuery({
    queryKey: ["groups"],
    queryFn: () => onGetExploreGroup(category, 0),
  })

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <ExplorePageContent layout="LIST" category={category} />
    </HydrationBoundary>
  )
}

export default ExploreCategoryPage
