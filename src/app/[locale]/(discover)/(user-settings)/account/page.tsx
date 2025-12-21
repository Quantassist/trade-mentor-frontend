import { SettingsForm } from "@/components/form/user-settings"
import { auth } from "@/lib/auth"
import { getSession } from "@/lib/get-session"
import { setRequestLocale } from "next-intl/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

type AccountPageProps = {
  params: Promise<{ locale: string }>
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()

  if (!session) redirect(`/${locale}/sign-in`)

  // Get active sessions (different API call, not session fetch)
  const activeSessions = await auth.api.listSessions({
    headers: await headers(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account</h1>
        <p className="text-sm text-themeTextGray mt-1">Manage your account settings and preferences</p>
      </div>
      <SettingsForm session={session} activeSessions={activeSessions || []} />
    </div>
  )
}
