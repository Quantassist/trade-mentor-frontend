import { onGetStripeIntegration } from "@/actions/payments"
import IntegrationsList from "./_components/integrations-list"

const IntegrationsPage = async ({
  params,
}: {
  params: Promise<{ groupid: string }>
}) => {
  const { groupid } = await params
  const payment = await onGetStripeIntegration()
  const connections = {
    stripe: payment ? true : false,
  }

  return (
    <div className="p-8">
      <div className="flex flex-col mb-5">
        <h3 className="text-3xl font-bold">Integrations</h3>
        <p className="text-sm text-themeTextGray">
          Connect third-party applications into Grouple
        </p>
      </div>
      <IntegrationsList connections={connections} groupid={groupid} />
    </div>
  )
}

export default IntegrationsPage
