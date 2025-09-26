import { GroupSubscriptionForm } from "@/components/form/subscription"
import { Subscriptions } from "./_components/subscriptions"

type SubscriptionPageProps = {
  params: Promise<{ groupid: string }>
}

const SubscriptionPage = async ({ params }: SubscriptionPageProps) => {
  const { groupid } = await params
  return (
    <div className="p-8">
      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-bold">Group Subscriptions</h3>
        <p className="text-sm text-themeTextGray">
          Adjust your group Subscriptions here.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <GroupSubscriptionForm groupid={groupid} />
          <Subscriptions groupid={groupid} />
        </div>
      </div>
      {/* <SelectSubscription /> */}
    </div>
  )
}

export default SubscriptionPage
