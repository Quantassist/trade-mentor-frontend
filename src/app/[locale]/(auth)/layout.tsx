import { onAuthenticatedUser } from "@/actions/auth"
import { BackdropGradient } from "@/components/global/backdrop-gradient"
import { Card, CardContent } from "@/components/ui/card"
import { setRequestLocale } from "next-intl/server"
import { redirect } from "next/navigation"
import { AuthCardHeader } from "./_components/auth-card-header"
import { AuthFooterNote } from "./_components/auth-footer-note"
import { AuthHero } from "./_components/auth-hero"
import { AuthLanguageSelector } from "./_components/auth-language-selector"

type AuthLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const AuthLayout = async ({ children, params }: AuthLayoutProps) => {
  // Ensure server helpers use the correct locale for this segment
  setRequestLocale((await params).locale)
  const user = await onAuthenticatedUser()

  if (user.status === 200) redirect("/callback/sign-in")

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
        <Card className="w-full max-w-md mt-5  border-border/50 shadow-lg bg-[#1A1A1D]/85 mb-5">
          <AuthCardHeader />
          <CardContent className="space-y-4">
            {children}
          </CardContent>
        </Card>
        <AuthFooterNote />
        </BackdropGradient>
      </div>
    </div>
  )
}

export default AuthLayout
