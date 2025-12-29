"use client"

import { onGetGroupChannels } from "@/actions/channel"
import { Card } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { useQuery } from "@tanstack/react-query"
import { Hash, MessageCircle, Users } from "lucide-react"

type ChannelsSectionProps = {
  groupid: string
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  general: <Hash className="h-5 w-5" />,
  announcements: <MessageCircle className="h-5 w-5" />,
  discussion: <Users className="h-5 w-5" />,
}

export const ChannelsSection = ({ groupid }: ChannelsSectionProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["group-channels", groupid],
    queryFn: () => onGetGroupChannels(groupid),
  })

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-[#b9a9ff]" />
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-themeTextWhite">Discussion Channels</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#161a20]  rounded-xl p-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-themeGray/40" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-themeGray/40 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 dark:bg-themeGray/40 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  const channels = data?.status === 200 ? (data.channels ?? []) : []

  if (channels.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-[#b9a9ff]" />
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-themeTextWhite">Discussion Channels</h2>
      </div>
      <p className="text-slate-500 dark:text-themeTextGray -mt-2">
        Join conversations, ask questions, and connect with fellow learners
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel: any) => {
          const channelUrlId = channel.slug || channel.id
          const iconKey = channel.icon?.toLowerCase() || "general"
          const icon = CHANNEL_ICONS[iconKey] || <Hash className="h-5 w-5" />

          return (
            <Link
              key={channel.id}
              href={`/group/${groupid}/feed/${channelUrlId}`}
            >
              <Card className="bg-white dark:bg-[#161a20]  rounded-xl p-4 group transition-all duration-200 hover:bg-slate-50 dark:hover:bg-[#1e2329]  hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 cursor-pointer h-full">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-[#b9a9ff]/20 to-[#b9a9ff]/5 flex items-center justify-center text-[#b9a9ff] ring-1 ring-white/10 group-hover:ring-[#b9a9ff]/30 transition-all">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-900 dark:text-themeTextWhite font-medium truncate group-hover:text-emerald-600 dark:group-hover:text-[#d4f0e7] transition-colors capitalize">
                      #{channel.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-themeTextGray mt-0.5">
                      Join the discussion
                    </p>
                  </div>
                  <div className="text-slate-400 dark:text-themeTextGray/50 group-hover:text-[#b9a9ff] transition-colors">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
