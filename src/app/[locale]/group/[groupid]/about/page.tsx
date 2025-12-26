import { onAuthenticatedUser } from "@/actions/auth"
import { onGetGroupChannels } from "@/actions/channel"
import { onGetGroupCourses } from "@/actions/courses"
import { onGetGroupInfo } from "@/actions/groups"
import { onGetActiveSubscription } from "@/actions/payments"
import { getQueryClient } from "@/lib/get-query-client"
import {
    HydrationBoundary,
    dehydrate,
} from "@tanstack/react-query"
import { ChannelsSection } from "@/app/[locale]/(discover)/about/_components/channels-section"
import { CoursesSection } from "@/app/[locale]/(discover)/about/_components/courses-section"
import { MemberAboutGroup } from "./_components/member-about"

type AboutPageProps = {
  params: Promise<{ groupid: string; locale: string }>
}

const GroupAboutPage = async ({ params }: AboutPageProps) => {
  const query = getQueryClient()
  const { groupid, locale } = await params

  await Promise.all([
    query.prefetchQuery({
      queryKey: ["about-group-info", groupid, locale],
      queryFn: () => onGetGroupInfo(groupid, locale),
    }),
    query.prefetchQuery({
      queryKey: ["active-subscription"],
      queryFn: () => onGetActiveSubscription(groupid),
    }),
    query.prefetchQuery({
      queryKey: ["group-courses", groupid, "all", locale],
      queryFn: () => onGetGroupCourses(groupid, "all", locale),
      staleTime: 60_000,
    }),
    query.prefetchQuery({
      queryKey: ["group-channels", groupid],
      queryFn: () => onGetGroupChannels(groupid),
      staleTime: 60_000,
    }),
  ])

  const userid = await onAuthenticatedUser()

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="pb-10 container px-5 md:px-10">
        <MemberAboutGroup userid={userid.id!} groupid={groupid} locale={locale} />
        
        {/* Channels and Courses Sections - reused from discover about page */}
        <div className="mt-10 space-y-12">
          <ChannelsSection groupid={groupid} />
          <CoursesSection groupid={groupid} />
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default GroupAboutPage
