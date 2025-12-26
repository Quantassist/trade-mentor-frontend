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
import { AboutGroup } from "../_components/about"

type AboutPageProps = {
  params: Promise<{ groupid: string; locale: string }>
}

const AboutPage = async ({ params }: AboutPageProps) => {
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
      <div className="pt-28 pb-10 container px-5 md:px-10 mx-auto max-w-7xl">
        <AboutGroup userid={userid.id!} groupid={groupid} locale={locale} />
      </div>
    </HydrationBoundary>
  )
}

export default AboutPage
