"use client"

import { GlassModal } from "@/components/global/glass-modal"
import { JoinGroupPaymentForm } from "@/components/global/join-group"
import { StripeElements } from "@/components/global/stripe/elements"
import { Button } from "@/components/ui/button"
import { useActiveGroupSubscription, useJoinFree } from "@/hooks/payment"
import { useState } from "react"
import { Loader2 } from "lucide-react"

type Props = {
  groupid: string
  owner: boolean
  isMember: boolean
}

export const JoinButton = ({ groupid, owner, isMember }: Props) => {
  const { data } = useActiveGroupSubscription(groupid)
  const { onJoinFreeGroup } = useJoinFree(groupid)
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    if (loading) return
    try {
      setLoading(true)
      await onJoinFreeGroup()
    } finally {
      setLoading(false)
    }
  }

  if (!owner) {
    if (isMember) {
      return (
        <Button className="w-full p-10" variant="ghost">
          <p> Member</p>
        </Button>
      )
    }
    if (data?.status === 200) {
      return (
        <GlassModal
          trigger={
            <Button className="w-full p-10" variant="ghost">
              <p> Join ${data.subscription?.price}/Month</p>
            </Button>
          }
          title="Join this group"
          description="Pay now to join this community"
        >
          <StripeElements>
            <JoinGroupPaymentForm groupid={groupid} />
          </StripeElements>
        </GlassModal>
      )
    }
    return (
      <Button onClick={handleJoin} disabled={loading} className="w-full p-10" variant="ghost">
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Joining…</span>
          </>
        ) : (
          <p> Join now</p>
        )}
      </Button>
    )
  }

  return (
    <Button disabled={owner} className="w-full p-10" variant="ghost">
      <p> Owner</p>
    </Button>
  )
}
