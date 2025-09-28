"use client"

import { useAllSubscriptions } from "@/hooks/payment"
import { SubscriptionCard } from "../card"

type SubscriptionProps = {
  groupid: string
}

export const Subscriptions = ({ groupid }: SubscriptionProps) => {
  const { data, mutate } = useAllSubscriptions(groupid)

  return data?.status === 200 && data.subscriptions ? (
    data.subscriptions.map((subscription) => (
      <SubscriptionCard
        key={subscription.id}
        price={`${subscription.price}`}
        members={`${subscription.memberCount}`}
        active={subscription.active}
        onClick={() => mutate({ id: subscription.id })}
      />
    ))
  ) : (
    <div>
      <h3>Subscriptions</h3>
    </div>
  )
}
