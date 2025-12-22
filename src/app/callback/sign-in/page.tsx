import { onSignInUser, onSignUpUser } from "@/actions/auth"
import { redirect } from "@/i18n/navigation"
import { getSession } from "@/lib/get-session"

type Props = {
  searchParams: Promise<{ locale?: string; returnUrl?: string }>
}

const CompleteSignIn = async ({ searchParams }: Props) => {
  const { locale: queryLocale, returnUrl } = await searchParams
  const defaultLocale = queryLocale || "en"
  const decodedReturnUrl = returnUrl ? decodeURIComponent(returnUrl) : null
  
  const session = await getSession()
  
  if (!session?.user) return redirect({ href: "/sign-in", locale: defaultLocale })

  // First try to sign in existing user
  const authenticated = await onSignInUser(session.user.id)

  // If user doesn't exist in our app DB, create them (for OAuth users)
  if (authenticated.status === 400) {
    const nameParts = (session.user.name || "User").split(" ")
    const firstname = nameParts[0] || "User"
    const lastname = nameParts.slice(1).join(" ") || ""
    
    const signUpResult = await onSignUpUser({
      firstname,
      lastname,
      betterAuthId: session.user.id,
      image: session.user.image || null,
      locale: defaultLocale,
    })
    
    // Try sign in again after creating user
    const retryAuth = await onSignInUser(session.user.id)
    const locale = (retryAuth as any).locale ?? defaultLocale
    
    // If returnUrl is provided, redirect there after successful auth
    if (decodedReturnUrl && (retryAuth.status === 200 || retryAuth.status === 207)) {
      return redirect({ href: decodedReturnUrl, locale })
    }
    
    if (retryAuth.status === 200)
      return redirect({ href: "/explore", locale })
    if (retryAuth.status === 207)
      return redirect({ href: `/group/${retryAuth.groupId}/feed/${retryAuth.channelId}`, locale })
    
    // If still failing after signup attempt, redirect to explore anyway
    // This prevents redirect loop when user has valid auth session but DB issues
    console.error("Sign-in callback: DB sync failed after signup attempt", { signUpResult, retryAuth })
    return redirect({ href: decodedReturnUrl || "/explore", locale })
  }

  const locale = (authenticated as any).locale ?? defaultLocale

  // If returnUrl is provided, redirect there after successful auth
  if (decodedReturnUrl && (authenticated.status === 200 || authenticated.status === 207)) {
    return redirect({ href: decodedReturnUrl, locale })
  }

  if (authenticated.status === 200)
    return redirect({ href: "/explore", locale })

  if (authenticated.status === 207)
    return redirect({ href: `/group/${authenticated.groupId}/feed/${authenticated.channelId}`, locale })

  // Fallback: redirect to explore instead of sign-in to prevent redirect loop
  // User has valid Better Auth session, so don't send them back to sign-in
  console.error("Sign-in callback: Unexpected auth status", authenticated)
  return redirect({ href: decodedReturnUrl || "/explore", locale: defaultLocale })
}

export default CompleteSignIn
