import { ProfileForm } from "@/components/form/user-profile"
import { auth } from "@/lib/auth"
import { setRequestLocale } from "next-intl/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

type ProfilePageProps = {
  params: Promise<{ locale: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect(`/${locale}/sign-in`)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-themeTextGray mt-1">Manage your account information</p>
      </div>
      <ProfileForm session={session} />
    </div>
  )
}
