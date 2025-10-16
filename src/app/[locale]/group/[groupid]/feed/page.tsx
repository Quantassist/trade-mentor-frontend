import { onAuthenticatedUser } from "@/actions/auth"
import { onGetGroupChannels } from "@/actions/channel"
import { onGetUserGroups } from "@/actions/groups"
import { redirect } from "@/i18n/navigation"
import { setRequestLocale } from "next-intl/server"

export default async function FeedRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; groupid: string }>
}) {
  const { locale, groupid } = await params
  setRequestLocale(locale)

  const user = await onAuthenticatedUser()
  if (!user?.id) {
    return redirect({ href: "/sign-in", locale })
  }

  const data = await onGetUserGroups(user.id as string)

  let channelId: string | undefined

  if (data?.status === 200) {
    // Owner groups list
    const ownerMatch = data.groups?.find((g: any) => g.id === groupid)
    channelId = ownerMatch?.channel?.[0]?.id

    // Membership list (if not owner)
    if (!channelId && Array.isArray(data.members)) {
      const memberMatch = data.members.find((m: any) => m?.Group?.id === groupid)
      channelId = memberMatch?.Group?.channel?.[0]?.id
    }
  }

  // Fallback: fetch channels and take first
  if (!channelId) {
    const channels = await onGetGroupChannels(groupid)
    channelId = channels?.channels?.[0]?.id
  }

  if (!channelId) {
    // No channel found: send back to group root (or a 404 page if you prefer)
    return redirect({ href: `/group/${groupid}`, locale })
  }

  return redirect({ href: `/group/${groupid}/feed/${channelId}`, locale })
}
