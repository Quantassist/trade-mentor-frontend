"use client"

import { GlassModal } from "@/components/global/glass-modal"
import { JoinGroupPaymentForm } from "@/components/global/join-group"
import { StripeElements } from "@/components/global/stripe/elements"
import { Button } from "@/components/ui/button"
import { useActiveGroupSubscription, useJoinFree } from "@/hooks/payment"
import { Link } from "@/i18n/navigation"
import { ArrowRight, Loader2, Settings } from "lucide-react"
import { useState } from "react"

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

  // Owner view - show Owner badge + Go to Feed + Settings buttons
  if (owner) {
    return (
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-themeTextGray font-medium px-3 py-1.5 bg-themeGray/50 rounded-full">
            Owner
          </span>
          <Link href={`/group/${groupid}/feed`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-[#d4f0e7] to-[#e8f5f0] text-[#1a1a1a] hover:from-[#c4e6db] hover:to-[#d8ebe5] rounded-xl flex gap-2 font-medium">
              Go to Feed
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Link href={`/group/${groupid}/settings/general`}>
          <Button 
            variant="outline" 
            className="w-full bg-themeBlack border-themeGray hover:bg-themeGray/80 rounded-xl flex gap-2"
          >
            <Settings className="h-4 w-4" />
            Group Settings
          </Button>
        </Link>
      </div>
    )
  }

  // Member view - show Member badge + Go to Feed button
  if (isMember) {
    return (
      <div className="p-4 flex items-center justify-between gap-2">
        <span className="text-sm text-themeTextGray font-medium px-3 py-1.5 bg-themeGray/50 rounded-full">
          Member
        </span>
        <Link href={`/group/${groupid}/feed`} className="flex-1">
          <Button className="w-full bg-gradient-to-r from-[#d4f0e7] to-[#e8f5f0] text-[#1a1a1a] hover:from-[#c4e6db] hover:to-[#d8ebe5] rounded-xl flex gap-2 font-medium">
            Go to Feed
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  // Paid subscription - show payment modal
  if (data?.status === 200) {
    return (
      <div className="p-4">
        <GlassModal
          trigger={
            <Button className="w-full bg-gradient-to-r from-[#d4f0e7] to-[#e8f5f0] text-[#1a1a1a] hover:from-[#c4e6db] hover:to-[#d8ebe5] rounded-xl py-6 font-medium">
              Join ${data.subscription?.price}/Month
            </Button>
          }
          title="Join this group"
          description="Pay now to join this community"
        >
          <StripeElements>
            <JoinGroupPaymentForm groupid={groupid} />
          </StripeElements>
        </GlassModal>
      </div>
    )
  }

  // Free group - show join button
  return (
    <div className="p-4">
      <Button 
        onClick={handleJoin} 
        disabled={loading} 
        className="w-full bg-gradient-to-r from-[#d4f0e7] to-[#e8f5f0] text-[#1a1a1a] hover:from-[#c4e6db] hover:to-[#d8ebe5] rounded-xl py-6 font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Joining…</span>
          </>
        ) : (
          "Join now"
        )}
      </Button>
    </div>
  )
}
