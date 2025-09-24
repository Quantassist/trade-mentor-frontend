import { onGetExploreGroup } from "@/actions/groups"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import { ExplorePageContent } from "../_components/explore-content"

const ExploreCategoryPage = async ({
  params,
}: {
  params: Promise<{ category: string }>
}) => {
  const query = new QueryClient()
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
