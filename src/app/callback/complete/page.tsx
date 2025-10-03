import { onSignUpUser } from "@/actions/auth"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

const CompleteOAuthAfterCallback = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const user = await currentUser()
  if (!user) return redirect("/sign-in")
  const localeParam = (await searchParams)?.locale as string | undefined
  const firstname = user.firstName ?? user.username ?? "User"
  const lastname = user.lastName ?? ""
  const image = user.hasImage ? user.imageUrl : null
  const complete = await onSignUpUser({
    firstname,
    lastname,
    clerkId: user.id,
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
