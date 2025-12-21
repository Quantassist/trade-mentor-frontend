import { getSession } from "@/lib/get-session"
import { setRequestLocale } from "next-intl/server"
import { redirect } from "next/navigation"
import { UserSettingsSidebar } from "./_components/sidebar"

type UserSettingsLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const UserSettingsLayout = async ({ children, params }: UserSettingsLayoutProps) => {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()

  if (!session) redirect(`/${locale}/sign-in`)

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar - sticky */}
      <UserSettingsSidebar locale={locale} />
      {/* Main content */}
      <div className="flex-1 py-8 px-6 lg:px-10 max-w-4xl">
        {children}
      </div>
    </div>
  )
}

export default UserSettingsLayout
