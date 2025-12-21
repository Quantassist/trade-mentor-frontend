import { BackdropGradient } from "@/components/global/backdrop-gradient"
import { Card, CardContent } from "@/components/ui/card"
import { getSession } from "@/lib/get-session"
import { setRequestLocale } from "next-intl/server"
import { redirect } from "next/navigation"
import { AuthHero } from "./_components/auth-hero"
import { AuthLanguageSelector } from "./_components/auth-language-selector"

type AuthLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const AuthLayout = async ({ children, params }: AuthLayoutProps) => {
  // Ensure server helpers use the correct locale for this segment
  const { locale } = await params
  setRequestLocale(locale)
  
  // Check if user is already authenticated using Better Auth
  const session = await getSession()

  if (session) redirect(`/callback/sign-in?locale=${locale}`)

  return (
    <div className="container min-h-screen flex flex-col">
      {/* Top bar with language selector */}
      <div className="flex items-center justify-end pt-2 pb-0">
        <AuthLanguageSelector />
      </div>

      {/* Hero copy */}
      <AuthHero />

      {/* Auth card */}
      <div className="flex-1 flex items-start md:items-center justify-center pb-3">
        <BackdropGradient className="w-full md:w-9/12 lg:w-7/12 xl:w-6/12 opacity-40" container="flex flex-col items-center">
        <Card className="w-full max-w-md mt-5 border-border/50 shadow-lg bg-[#1A1A1D]/85 mb-5">
          <CardContent className="pt-6">
            {children}
          </CardContent>
        </Card>
        </BackdropGradient>
      </div>
    </div>
  )
}

export default AuthLayout
