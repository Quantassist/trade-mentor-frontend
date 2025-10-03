"use client"
import { SignUpForm } from "@/components/form/sign-up"
import { GoogleAuthButton } from "@/components/global/google-oauth-button"
import { Separator } from "@/components/ui/separator"
import { useLocale, useTranslations } from "next-intl"

const SignUpPage = () => {
  const t = useTranslations("auth")
  const selectedLocale = useLocale() as "en" | "hi"
  return (
    <>
      <SignUpForm selectedLocale={selectedLocale} />
      <div id="clerk-captcha"></div>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">{t("separator.orContinueWith")}</span>
        </div>
      </div>
      <GoogleAuthButton method="signup" selectedLocale={selectedLocale} />
    </>
  )
}

export default SignUpPage
