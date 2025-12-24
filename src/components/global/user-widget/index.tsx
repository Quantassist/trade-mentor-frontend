import { Link } from "@/i18n/navigation"
import { Message } from "@/icons"
import { Notification } from "./notification"
import { UserAvatar } from "./user"

type UserWidgetProps = {
  image: string
  groupid?: string
  userid?: string
}

export const UserWidget = ({ image, groupid, userid }: UserWidgetProps) => {
  return (
    <div className="items-center flex gap-4 sm:gap-5">
      <Notification />
      <Link href={`/group/${groupid}/messages`}>
        <Message />
      </Link>
      <UserAvatar image={image} groupid={groupid} userid={userid} />
    </div>
  )
}
