import { GroupSubscriptionForm } from "@/components/form/subscription"
import { Subscriptions } from "./_components/subscriptions"
import { getTranslations } from "next-intl/server"

type SubscriptionPageProps = {
  params: Promise<{ groupid: string; locale: string }>
}

const SubscriptionPage = async ({ params }: SubscriptionPageProps) => {
  const { groupid, locale } = await params
  const t = await getTranslations({ locale, namespace: "settings.subscriptions" })
  return (
    <div className="p-8">
      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-bold">{t("title")}</h3>
        <p className="text-sm text-themeTextGray">{t("description")}</p>
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
