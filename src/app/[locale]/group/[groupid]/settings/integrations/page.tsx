import { onGetStripeIntegration } from "@/actions/payments"
import IntegrationsList from "./_components/integrations-list"
import { getTranslations } from "next-intl/server"

const IntegrationsPage = async ({
  params,
}: {
  params: Promise<{ groupid: string; locale: string }>
}) => {
  const { groupid, locale } = await params
  const t = await getTranslations({ locale, namespace: "settings.integrations" })
  const payment = await onGetStripeIntegration()
  const connections = {
    stripe: payment ? true : false,
  }

  return (
    <div className="p-8">
      <div className="flex flex-col mb-5">
        <h3 className="text-3xl font-bold">{t("title")}</h3>
        <p className="text-sm text-slate-500 dark:text-themeTextGray">{t("description")}</p>
      </div>
      <IntegrationsList connections={connections} groupid={groupid} />
    </div>
  )
}

export default IntegrationsPage
