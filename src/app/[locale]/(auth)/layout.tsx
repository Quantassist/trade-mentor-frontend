import { ThemeSwitcher } from "@/components/global/theme-switcher"
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-[#0a0a0b] dark:via-[#0f1012] dark:to-[#0a0a0b]">
      {/* Top bar with theme and language selector */}
      <div className="container flex items-center justify-end gap-3 pt-4 pb-0">
        <ThemeSwitcher />
        <AuthLanguageSelector />
      </div>

      {/* Main content - centered card with two sides */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-0">
          {/* Left side - Hero/Branding with centered text and image below */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1a1a1d] via-[#141416] to-[#0f0f11] items-center justify-center p-8 lg:p-12 rounded-l-[2.5rem]">
            <div className="flex flex-col items-center gap-6 text-center">
              <AuthHero />
              <Image
                src="/stripe.png"
                alt="TradeMentor"
                width={160}
                height={160}
                className="object-contain mt-4"
              />
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full md:w-1/2 bg-white dark:bg-[#1a1d21] rounded-[2.5rem] md:rounded-l-none p-8 md:p-10 lg:p-12 shadow-2xl">
            {children}
          </div>
        </div>
      </div>

    </div>
  )
}

export default AuthLayout
