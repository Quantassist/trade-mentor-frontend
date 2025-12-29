import { GlassModal } from "@/components/global/glass-modal"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CloudIcon } from "lucide-react"
import { IntegrationModalBody } from "../integration-modal-body"

type Props = {
  name: "stripe"
  logo: string
  title: string
  descrioption: string
  connections: {
    [key in "stripe"]: boolean
  }
  groupid: string
}

const IntegrationTrigger = ({
  name,
  logo,
  title,
  descrioption,
  connections,
  groupid,
}: Props) => {
  return (
    <GlassModal
      title={title}
      description={descrioption}
      trigger={
        <Card className="px-3 py-2 cursor-pointer flex gap-2 bg-white dark:bg-themeBlack border border-slate-200 dark:border-themeGray">
          <CloudIcon />
          {connections[name] ? "connected" : "connect"}
        </Card>
      }
      type="Integration"
      logo={logo}
    >
      <Separator orientation="horizontal" className="bg-slate-200 dark:bg-themeGray" />
      <IntegrationModalBody
        connections={connections}
        type={name}
        groupid={groupid}
      />
    </GlassModal>
  )
}

export default IntegrationTrigger
