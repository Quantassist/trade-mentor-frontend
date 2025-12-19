import { auth } from "@/lib/auth"
import { setRequestLocale } from "next-intl/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

type UserLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const UserLayout = async ({ children, params }: UserLayoutProps) => {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect(`/${locale}/sign-in`)

  return (
    <div className="min-h-screen bg-themeBlack">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {children}
      </div>
    </div>
  )
}

export default UserLayout
