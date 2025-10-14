import { onSignInUser } from "@/actions/auth"
import { redirect } from "@/i18n/navigation"
import { currentUser } from "@clerk/nextjs/server"

const CompleteSigIn = async () => {
  const user = await currentUser()
  if (!user) return redirect({ href: "/sign-in", locale: "en" })

  const authenticated = await onSignInUser(user.id)

  const locale = (authenticated as any).locale ?? "en"

  if (authenticated.status === 200)
    return redirect({ href: "/group/create", locale })

  if (authenticated.status === 207)
    return redirect({ href: `/group/${authenticated.groupId}/feed/${authenticated.channelId}`, locale })

  if (authenticated.status !== 200) {
    redirect({ href: "/sign-in", locale })
  }
}

export default CompleteSigIn
