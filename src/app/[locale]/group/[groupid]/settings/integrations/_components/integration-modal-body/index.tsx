import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2Icon } from "lucide-react"
import { StripeConnect } from "../stripe-connect"

type IntegrationModalBodyProps = {
  type: string
  connections: {
    [key in "stripe"]: boolean
  }
  groupid: string
}

export const IntegrationModalBody = ({
  type,
  connections,
  groupid,
}: IntegrationModalBodyProps) => {
  switch (type) {
    case "stripe":
      return (
        <div className="flex flex-col gap-2">
          <h2 className="font-bold">Stripe would like to access</h2>
          {[
            "Payment and bank information",
            "Products and services you sell",
            "Business and tax information",
            "Create and update Products",
          ].map((item, key) => (
            <div key={key} className="flex gap-2 items-center pl-3">
              <CheckCircle2Icon />
              <p>{item}</p>
            </div>
          ))}
          <Separator orientation="horizontal" className=" bg-themeGray my-5" />
          <div className="flex justify-between">
            <Button
              variant="outline"
              className=" bg-themeBlack border border-themeGray"
            >
              Learn more
            </Button>
            <StripeConnect connected={connections[type]} groupid={groupid} />
          </div>
        </div>
      )
    default:
      return <></>
  }
}
