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
  const { signInWithGoogle, isGooglePending } = useGoogleAuth({ locale: selectedLocale })
  const t = useTranslations("auth")
  return (
    <Button
      onClick={() => signInWithGoogle()}
      disabled={isGooglePending}
      className="w-full rounded-2xl flex gap-3 bg-themeBlack border-themeGray"
      variant="outline"
    >
      <Loader loading={isGooglePending}>
        <Google />
        {method === "signin" ? t("google.signInButton") : t("google.signUpButton")}
      </Loader>
    </Button>
  )
}
