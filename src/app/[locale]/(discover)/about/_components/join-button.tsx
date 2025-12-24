"use client"

import { GlassModal } from "@/components/global/glass-modal"
import { JoinGroupPaymentForm } from "@/components/global/join-group"
import { StripeElements } from "@/components/global/stripe/elements"
import { Button } from "@/components/ui/button"
import { useActiveGroupSubscription, useJoinFree } from "@/hooks/payment"
import { Link, useRouter } from "@/i18n/navigation"
import { useSession } from "@/lib/auth-client"
import { ArrowRight, Loader2, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"

type Props = {
  groupid: string
  groupSlug?: string
  owner: boolean
  isMember: boolean
  hideGoToFeed?: boolean
}

export const JoinButton = ({ groupid, groupSlug, owner, isMember, hideGoToFeed }: Props) => {
  // Use slug for URL-friendly links, fallback to groupid
  const groupUrlId = groupSlug || groupid
  const { data } = useActiveGroupSubscription(groupid)
  const { onJoinFreeGroup } = useJoinFree(groupid)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const handleJoin = async () => {
    if (loading) return
    
    // If user is not logged in, redirect to sign-in with return URL
    if (!session?.user) {
      const returnUrl = encodeURIComponent(pathname)
      router.push(`/sign-in?returnUrl=${returnUrl}`)
      return
    }
    
    try {
      setLoading(true)
      await onJoinFreeGroup()
    } finally {
      setLoading(false)
    }
  }

  // Owner view - show Owner badge with settings icon inline
  if (owner) {
    return (
      <div className="p-4 flex flex-col gap-3">
        {/* Status row with badge and settings */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 rounded-md">
            Owner
          </span>
          <Link 
            href={`/group/${groupUrlId}/settings/general`}
            className="flex items-center gap-1.5 text-xs text-themeTextGray hover:text-white transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Settings</span>
          </Link>
        </div>
        {/* Primary action button */}
        {!hideGoToFeed && (
          <Link href={`/group/${groupUrlId}/feed`}>
            <Button 
              size="sm"
              className="w-full bg-gradient-to-r from-[#d4f0e7] to-[#e8f5f0] text-[#1a1a1a] hover:from-[#c4e6db] hover:to-[#d8ebe5] rounded-lg flex items-center justify-center gap-1.5 font-medium text-sm h-9"
            >
              Go to Feed
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    )
  }

  // Member view - show Member badge + Go to Feed button
  if (isMember) {
    return (
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center">
          <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">
            Member
          </span>
        </div>
        {!hideGoToFeed && (
          <Link href={`/group/${groupUrlId}/feed`}>
            <Button 
              size="sm"
              className="w-full bg-gradient-to-r from-[#d4f0e7] to-[#e8f5f0] text-[#1a1a1a] hover:from-[#c4e6db] hover:to-[#d8ebe5] rounded-lg flex items-center justify-center gap-1.5 font-medium text-sm h-9"
            >
              Go to Feed
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
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
