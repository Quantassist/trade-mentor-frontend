import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"
interface SubscriptionCardProps {
  price: string
  members: string
  optimistic?: boolean
  onClick?(): void
  active?: boolean
}

export const SubscriptionCard = ({
  price,
  members,
  optimistic,
  onClick,
  active,
}: SubscriptionCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer bg-white dark:bg-themeBlack text-slate-600 dark:text-themeTextGray flex flex-col gap-y-3 items-center justify-canter aspect-video pt-5 border-slate-200 dark:border-themeGray",
        active ? "border-purple-800 border-2" : "border-none",
        optimistic ? "opacity-60" : "",
      )}
    >
      <h3 className="text-2xl">{price}/month</h3>
      <div className="flex items-center gap-x-2 text-sm">
        <User size={20} />
        <p>{members} members</p>
      </div>
    </Card>
  )
}
