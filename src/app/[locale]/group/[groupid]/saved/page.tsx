import { onAuthenticatedUser } from "@/actions/auth"
import { onGetSavedPosts } from "@/actions/groups"
import { getQueryClient } from "@/lib/get-query-client"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { Bookmark } from "lucide-react"
import { SavedPostsList } from "./_components/saved-posts-list"

type SavedPostsPageProps = {
  params: Promise<{ groupid: string; locale: string }>
}

const SavedPostsPage = async ({ params }: SavedPostsPageProps) => {
  const { groupid, locale } = await params
  const query = getQueryClient()

  await query.prefetchQuery({
    queryKey: ["saved-posts", groupid],
    queryFn: () => onGetSavedPosts(groupid),
  })

  const user = await onAuthenticatedUser()

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="py-8 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-white dark:bg-[#161a20] border border-slate-200 dark:border-themeGray/60 flex items-center justify-center">
            <Bookmark size={24} className="text-[#b9a9ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-themeTextWhite">Saved Posts</h1>
            <p className="text-sm text-slate-500 dark:text-themeTextGray">Your bookmarked posts for later reading</p>
          </div>
        </div>
        <SavedPostsList groupid={groupid} userid={user.id!} />
      </div>
    </HydrationBoundary>
  )
}

export default SavedPostsPage