import { getSession } from "@/lib/get-session"
import { setRequestLocale } from "next-intl/server"
import Image from "next/image"
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
    <div className="min-h-screen flex flex-col bg-themeBlack">
      {/* Top bar with language selector */}
      <div className="container flex items-center justify-end pt-3 pb-0">
        <AuthLanguageSelector />
      </div>

      {/* Main content - centered card with two sides */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl bg-themeGray/50 border border-themeGray rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Left side - Form */}
          <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10">
            {children}
          </div>

          {/* Right side - Image/Branding (hidden on mobile) */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-emerald-900 to-emerald-950 items-center justify-center p-8 lg:p-12 rounded-r-2xl">
            <div className="flex flex-col items-center gap-6">
              <Image
                src="/stripe.png"
                alt="TradeMentor"
                width={120}
                height={120}
                className="object-contain"
              />
              <AuthHero />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile hero - shown below card on small screens */}
      <div className="md:hidden container pb-8">
        <AuthHero />
      </div>
    </div>
  )
}

export default AuthLayout
