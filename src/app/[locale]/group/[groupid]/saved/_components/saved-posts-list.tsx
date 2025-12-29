"use client"

import { onGetSavedPosts } from "@/actions/groups"
import { Card, CardContent } from "@/components/ui/card"
import { useSavePost } from "@/hooks/channels"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Bookmark, MessageCircle } from "lucide-react"
import { Link, usePathname } from "@/i18n/navigation"
import { HtmlParser } from "@/components/global/html-parser"

type SavedPostsListProps = {
  groupid: string
  userid: string
}

type SavedPost = {
  id: string
  publicId?: string
  title: string
  htmlContent: string | null
  authorId: string
  channel: {
    id: string
    name: string
    slug?: string
  }
  author: {
    id: string
    firstname: string
    lastname: string
    image: string | null
  }
  claps: { count: number }[]
  _count: {
    comments: number
  }
  savedAt: Date
}

const SavedPostCard = ({
  post,
  groupid,
  userid,
}: {
  post: SavedPost
  groupid: string
  userid: string
}) => {
  const pathname = usePathname()
  const { isSaved, toggleSave, isPending } = useSavePost(post.id, groupid)
  const postUrlId = post.publicId || post.id
  const channelSlug = post.channel.slug || post.channel.id
  const totalClaps = post.claps?.reduce((sum, c) => sum + (c.count || 0), 0) || 0

  return (
    <Card className="bg-white dark:bg-[#161a20] border-slate-200 dark:border-themeGray/60 rounded-xl overflow-hidden group transition-all duration-200 hover:border-slate-300 dark:hover:border-themeGray/80">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Author info */}
            <div className="flex items-center gap-2 mb-2">
              {post.author.image ? (
                <img
                  src={post.author.image}
                  alt={post.author.firstname}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-themeGray/40 flex items-center justify-center text-xs text-slate-500 dark:text-themeTextGray">
                  {post.author.firstname?.[0]}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm text-slate-900 dark:text-themeTextWhite font-medium">
                  {post.author.firstname} {post.author.lastname}
                </span>
                <span className="text-xs text-slate-500 dark:text-themeTextGray">
                  in #{post.channel.name}
                </span>
              </div>
            </div>

            {/* Post title and content */}
            <Link href={`/group/${groupid}/feed/${channelSlug}/${postUrlId}`}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-themeTextWhite group-hover:text-emerald-600 dark:group-hover:text-[#d4f0e7] transition-colors line-clamp-2 mb-2">
                {post.title}
              </h3>
              {post.htmlContent && (
                <div className="text-sm text-slate-500 dark:text-themeTextGray line-clamp-2">
                  <HtmlParser html={post.htmlContent} />
                </div>
              )}
            </Link>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-themeTextGray">
              <span className="flex items-center gap-1">
                👏 {totalClaps}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} />
                {post._count.comments}
              </span>
            </div>
          </div>

          {/* Unsave button */}
          <button
            onClick={toggleSave}
            disabled={isPending}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              isSaved || !isPending
                ? "text-slate-900 dark:text-themeTextWhite hover:bg-slate-100 dark:hover:bg-white/10"
                : "text-slate-500 dark:text-themeTextGray"
            )}
            title="Remove from saved"
          >
            <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export const SavedPostsList = ({ groupid, userid }: SavedPostsListProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["saved-posts", groupid],
    queryFn: () => onGetSavedPosts(groupid),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#161a20] border border-slate-200 dark:border-themeGray/60 rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-themeGray/40" />
              <div className="space-y-1">
                <div className="h-3 w-24 bg-slate-200 dark:bg-themeGray/40 rounded" />
                <div className="h-2 w-16 bg-slate-200 dark:bg-themeGray/40 rounded" />
              </div>
            </div>
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-themeGray/40 rounded mb-2" />
            <div className="h-4 w-full bg-slate-200 dark:bg-themeGray/40 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const posts = (data?.posts as SavedPost[]) || []

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-themeGray/20 flex items-center justify-center mb-4">
          <Bookmark size={32} className="text-slate-400 dark:text-themeTextGray" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-themeTextWhite mb-2">No saved posts yet</h3>
        <p className="text-slate-500 dark:text-themeTextGray max-w-sm">
          When you save posts for later reading, they'll appear here. Click the bookmark icon on any post to save it.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <SavedPostCard
          key={post.id}
          post={post}
          groupid={groupid}
          userid={userid}
        />
      ))}
    </div>
  )
}
