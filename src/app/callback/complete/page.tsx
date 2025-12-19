import { onSignUpUser } from "@/actions/auth"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const CompleteOAuthAfterCallback = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  
  if (!session?.user) return redirect("/sign-in")
  
  const localeParam = (await searchParams)?.locale as string | undefined
  const nameParts = (session.user.name || "User").split(" ")
  const firstname = nameParts[0] || "User"
  const lastname = nameParts.slice(1).join(" ") || ""
  const image = session.user.image || null
  
  const complete = await onSignUpUser({
    firstname,
    lastname,
    betterAuthId: session.user.id,
    image,
    locale: localeParam,
  })

  if (complete.status == 200) {
    if (!localeParam) {
      // Ask for language if not captured pre-redirect
      return redirect(`/callback/language?next=/explore`)
    }
    return redirect(`/${localeParam}/explore`)
  }

  if (complete.status !== 200) {
    redirect("/sign-in")
  }
}

export default CompleteOAuthAfterCallback
