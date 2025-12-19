import { onSignInUser, onSignUpUser } from "@/actions/auth"
import { redirect } from "@/i18n/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

type Props = {
  searchParams: Promise<{ locale?: string }>
}

const CompleteSignIn = async ({ searchParams }: Props) => {
  const { locale: queryLocale } = await searchParams
  const defaultLocale = queryLocale || "en"
  
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  
  if (!session?.user) return redirect({ href: "/sign-in", locale: defaultLocale })

  // First try to sign in existing user
  const authenticated = await onSignInUser(session.user.id)

  // If user doesn't exist in our app DB, create them (for OAuth users)
  if (authenticated.status === 400) {
    const nameParts = (session.user.name || "User").split(" ")
    const firstname = nameParts[0] || "User"
    const lastname = nameParts.slice(1).join(" ") || ""
    
    await onSignUpUser({
      firstname,
      lastname,
      betterAuthId: session.user.id,
      image: session.user.image || null,
      locale: defaultLocale,
    })
    
    // Try sign in again after creating user
    const retryAuth = await onSignInUser(session.user.id)
    const locale = (retryAuth as any).locale ?? "en"
    
    if (retryAuth.status === 200)
      return redirect({ href: "/explore", locale })
    if (retryAuth.status === 207)
      return redirect({ href: `/group/${retryAuth.groupId}/feed/${retryAuth.channelId}`, locale })
  }

  const locale = (authenticated as any).locale ?? "en"

  if (authenticated.status === 200)
    return redirect({ href: "/explore", locale })

  if (authenticated.status === 207)
    return redirect({ href: `/group/${authenticated.groupId}/feed/${authenticated.channelId}`, locale })

  if (authenticated.status !== 200) {
    redirect({ href: "/sign-in", locale })
  }
}

export default CompleteSignIn
