"use client"

import { Button } from "@/components/ui/button"
import { useGoogleAuth } from "@/hooks/authentication"
import { Google } from "@/icons"
import { useTranslations } from "next-intl"
import { Loader } from "../loader"

type GoogleAuthButtonProps = {
  method: "signup" | "signin"
  selectedLocale?: "en" | "hi"
}

export const GoogleAuthButton = ({ method, selectedLocale }: GoogleAuthButtonProps) => {
  const { signUpWith, signInWith } = useGoogleAuth({ locale: selectedLocale })
  const t = useTranslations("auth")
  return (
    <Button
      {...(method === "signin"
        ? {
            onClick: () => signInWith("oauth_google"),
          }
        : {
            onClick: () => signUpWith("oauth_google"),
          })}
      className="w-full rounded-2xl flex gap-3 bg-themeBlack border-themeGray"
      variant="outline"
    >
      <Loader loading={false}>
        <Google />
        {method === "signin" ? t("google.signInButton") : t("google.signUpButton")}
      </Loader>
    </Button>
  )
}
