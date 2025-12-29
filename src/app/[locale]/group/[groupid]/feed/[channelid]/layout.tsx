
import { LeaderBoardCard } from "@/app/[locale]/group/_components/leaderboard"
import { GroupSideWidget } from "@/components/global/group-side-widget"
import { OngoingCoursesWidget } from "@/components/global/ongoing-courses-widget"

import { FeedLayout } from "./_components/feed-layout"
import React from "react"

type GroupChannelPageProps = {
  params: Promise<{ groupid: string; channelid: string; locale: string}>
  children: React.ReactNode;
}

const GroupChannelPage = async ({ params, children }: GroupChannelPageProps) => {
  const { groupid, channelid, locale } = await params

  return (
      <FeedLayout
        sidebar={
          <>
            <GroupSideWidget groupid={groupid} hideGoToFeed />
            <OngoingCoursesWidget groupid={groupid} />
            <LeaderBoardCard light groupid={groupid} />
          </>
        }
      >
        {children}
      </FeedLayout>
  )
}

export default GroupChannelPage
