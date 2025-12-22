import { onAuthenticatedUser } from "@/actions/auth"
import { onGetGroupInfo } from "@/actions/groups"
import { onGetActiveSubscription } from "@/actions/payments"
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from "@tanstack/react-query"
import { MemberAboutGroup } from "./_components/member-about"

type AboutPageProps = {
  params: Promise<{ groupid: string; locale: string }>
}

const GroupAboutPage = async ({ params }: AboutPageProps) => {
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
      <div className="pb-10 container px-5 md:px-10">
        <MemberAboutGroup userid={userid.id!} groupid={groupid} locale={locale} />
      </div>
    </HydrationBoundary>
  )
}

export default GroupAboutPage
