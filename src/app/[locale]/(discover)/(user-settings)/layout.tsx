import { auth } from "@/lib/auth"
import { setRequestLocale } from "next-intl/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { UserSettingsSidebar } from "./_components/sidebar"

type UserSettingsLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const UserSettingsLayout = async ({ children, params }: UserSettingsLayoutProps) => {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect(`/${locale}/sign-in`)

  return (
    <div className="flex max-w-6xl mx-auto min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <UserSettingsSidebar locale={locale} />
      {/* Main content */}
      <div className="flex-1 py-8 px-6 lg:px-10">
        {children}
      </div>
    </div>
  )
}

export default UserSettingsLayout
