"use client"

import { Loader2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Google } from "@/icons"
import { signIn, signUp } from "@/lib/auth-client"

type AuthFormProps = {
  defaultTab?: "sign-in" | "sign-up"
}

export function AuthForm({ defaultTab = "sign-in" }: AuthFormProps) {
  const t = useTranslations("auth")
  const locale = useLocale()
  const router = useRouter()
  const [loading, startTransition] = useTransition()

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")

  // Sign Up state
  const [signUpFirstName, setSignUpFirstName] = useState("")
  const [signUpLastName, setSignUpLastName] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")

  const handleSignIn = async () => {
    startTransition(async () => {
      await signIn.email(
        {
          email: signInEmail,
          password: signInPassword,
        },
        {
          onSuccess: () => {
            toast.success(t("messages.signInSuccess") || "Successfully signed in")
            router.push(`/callback/sign-in?locale=${locale}`)
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || t("messages.signInError") || "Sign in failed")
          },
        }
      )
    })
  }

  const handleSignUp = async () => {
    startTransition(async () => {
      await signUp.email(
        {
          email: signUpEmail,
          password: signUpPassword,
          name: `${signUpFirstName} ${signUpLastName}`.trim(),
        },
        {
          onSuccess: () => {
            toast.success(t("messages.signUpSuccess") || "Account created successfully")
            router.push(`/callback/sign-in?locale=${locale}`)
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || t("messages.signUpError") || "Sign up failed")
          },
        }
      )
    })
  }

  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: `/callback/sign-in?locale=${locale}`,
    })
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-themeGray/60 rounded-none h-auto p-0">
        <TabsTrigger
          value="sign-in"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white text-themeTextGray py-3"
        >
          {t("tabs.signIn")}
        </TabsTrigger>
        <TabsTrigger
          value="sign-up"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white text-themeTextGray py-3"
        >
          {t("tabs.signUp")}
        </TabsTrigger>
      </TabsList>

      {/* Sign In Tab */}
      <TabsContent value="sign-in" className="mt-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{t("signin.title")}</h2>
          <p className="text-sm text-themeTextGray">{t("signin.description")}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email" className="text-themeTextWhite">
              {t("form.email.label")}
            </Label>
            <Input
              id="signin-email"
              type="email"
              placeholder={t("form.email.placeholder")}
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              className="bg-themeBlack border-themeGray text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signin-password" className="text-themeTextWhite">
              {t("form.password.label")}
            </Label>
            <Input
              id="signin-password"
              type="password"
              placeholder={t("form.password.placeholder")}
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              className="bg-themeBlack border-themeGray text-white"
            />
          </div>

          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full rounded-2xl"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("buttons.signInWithEmail")
            )}
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="bg-themeGray" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#1A1A1D] px-3 text-themeTextGray">
              {t("separator.orContinueWith")}
            </span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full rounded-2xl flex gap-3 bg-themeBlack border-themeGray text-white hover:bg-themeGray/20"
        >
          <Google />
          {t("google.signInButton")}
        </Button>
      </TabsContent>

      {/* Sign Up Tab */}
      <TabsContent value="sign-up" className="mt-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{t("card.title")}</h2>
          <p className="text-sm text-themeTextGray">{t("card.description")}</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signup-firstname" className="text-themeTextWhite">
                {t("form.firstname.label")}
              </Label>
              <Input
                id="signup-firstname"
                type="text"
                placeholder={t("form.firstname.placeholder")}
                value={signUpFirstName}
                onChange={(e) => setSignUpFirstName(e.target.value)}
                className="bg-themeBlack border-themeGray text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-lastname" className="text-themeTextWhite">
                {t("form.lastname.label")}
              </Label>
              <Input
                id="signup-lastname"
                type="text"
                placeholder={t("form.lastname.placeholder")}
                value={signUpLastName}
                onChange={(e) => setSignUpLastName(e.target.value)}
                className="bg-themeBlack border-themeGray text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-themeTextWhite">
              {t("form.email.label")}
            </Label>
            <Input
              id="signup-email"
              type="email"
              placeholder={t("form.email.placeholder")}
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              className="bg-themeBlack border-themeGray text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-themeTextWhite">
              {t("form.password.label")}
            </Label>
            <Input
              id="signup-password"
              type="password"
              placeholder={t("form.password.placeholder")}
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              className="bg-themeBlack border-themeGray text-white"
            />
          </div>

          <Button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full rounded-2xl"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("buttons.signUpWithEmail")
            )}
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="bg-themeGray" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#1A1A1D] px-3 text-themeTextGray">
              {t("separator.orContinueWith")}
            </span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full rounded-2xl flex gap-3 bg-themeBlack border-themeGray text-white hover:bg-themeGray/20"
        >
          <Google />
          {t("google.signUpButton")}
        </Button>
      </TabsContent>
    </Tabs>
  )
}
