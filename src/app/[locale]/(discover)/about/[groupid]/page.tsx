import { onAuthenticatedUser } from "@/actions/auth"
import { onGetGroupInfo } from "@/actions/groups"
import { onGetActiveSubscription } from "@/actions/payments"
import { GroupSideWidget } from "@/components/global/group-side-widget"
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query"
import { AboutGroup } from "../_components/about"

type AboutPageProps = {
  params: Promise<{ groupid: string; locale: string }>
}

const AboutPage = async ({ params }: AboutPageProps) => {
  const query = new QueryClient()
  const { groupid, locale } = await params

  await query.prefetchQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => onGetGroupInfo(groupid, locale),
  })

  await query.prefetchQuery({
    queryKey: ["active-subscription"],
    queryFn: () => onGetActiveSubscription(groupid),
  })

  const userid = await onAuthenticatedUser()

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="pt-36 pb-10 container grid grid-cols-1 lg:grid-cols-3 gap-x-10">
        <div className="col-span-1 lg:col-span-2">
          <AboutGroup userid={userid.id!} groupid={groupid} locale={locale} />
        </div>
        <div className="col-span-1 relative">
          <GroupSideWidget userid={userid.id!} groupid={groupid} />
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default AboutPage
