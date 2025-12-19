import { SettingsForm } from "@/components/form/user-settings"
import { auth } from "@/lib/auth"
import { setRequestLocale } from "next-intl/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

type SettingsPageProps = {
  params: Promise<{ locale: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect(`/${locale}/sign-in`)

  // Get active sessions
  const activeSessions = await auth.api.listSessions({
    headers: await headers(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-themeTextGray mt-1">Manage your account settings and preferences</p>
      </div>
      <SettingsForm session={session} activeSessions={activeSessions || []} />
    </div>
  )
}
