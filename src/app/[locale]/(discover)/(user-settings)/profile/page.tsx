import { ProfileForm } from "@/components/form/user-profile"
import { getSession } from "@/lib/get-session"
import { setRequestLocale } from "next-intl/server"
import { redirect } from "next/navigation"

type ProfilePageProps = {
  params: Promise<{ locale: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()

  if (!session) redirect(`/${locale}/sign-in`)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm text-themeTextGray mt-1">Manage your account information</p>
      </div>
      <ProfileForm session={session} />
    </div>
  )
}
