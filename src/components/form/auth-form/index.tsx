"use client"

import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthSignIn, useAuthSignUp, useForgotPassword, useGoogleAuth } from "@/hooks/authentication"
import { Google } from "@/icons"

type AuthFormProps = {
  defaultTab?: "sign-in" | "sign-up"
}

// Fixed minimum height to accommodate the taller sign-up form
const FORM_MIN_HEIGHT = "min-h-[520px]"

export function AuthForm({ defaultTab = "sign-in" }: AuthFormProps) {
  const t = useTranslations("auth")
  const locale = useLocale()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get("returnUrl") || undefined
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showSignInPassword, setShowSignInPassword] = useState(false)
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)

  // Sign In hook
  const {
    register: registerSignIn,
    errors: signInErrors,
    onSignIn,
    isPending: isSignInPending,
  } = useAuthSignIn({ locale, returnUrl })

  // Sign Up hook
  const {
    register: registerSignUp,
    errors: signUpErrors,
    onSignUp,
    isPending: isSignUpPending,
  } = useAuthSignUp({ locale, returnUrl })

  // Google Auth hook
  const { signInWithGoogle, isGooglePending } = useGoogleAuth({ locale, returnUrl })

  // Forgot Password hook
  const {
    register: registerForgot,
    errors: forgotErrors,
    onForgotPassword,
    isPending: isForgotPending,
  } = useForgotPassword({ onSuccess: () => setShowForgotPassword(false) })

  if (showForgotPassword) {
    return (
      <div className={`w-full space-y-6 ${FORM_MIN_HEIGHT}`}>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{t("forgotPassword.title") || "Forgot Password"}</h2>
          <p className="text-sm text-themeTextGray">
            {t("forgotPassword.description") || "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <form onSubmit={onForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email" className="text-themeTextWhite">
              {t("form.email.label")}
            </Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder={t("form.email.placeholder")}
              {...registerForgot("email")}
              className="bg-themeBlack border-themeGray text-white placeholder:text-themeTextGray"
            />
            {forgotErrors.email && (
              <p className="text-sm text-red-500">{forgotErrors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isForgotPending}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isForgotPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("forgotPassword.submit") || "Send Reset Link"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowForgotPassword(false)}
            className="w-full text-themeTextGray hover:text-white"
          >
            {t("forgotPassword.backToSignIn") || "Back to Sign In"}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <Tabs defaultValue={defaultTab} className={`w-full ${FORM_MIN_HEIGHT}`}>
      <TabsList className="grid w-full grid-cols-2 bg-themeBlack rounded-lg h-auto p-1">
        <TabsTrigger
          value="sign-in"
          className="rounded-md data-[state=active]:bg-themeGray data-[state=active]:text-white text-themeTextGray py-2.5 transition-all"
        >
          {t("tabs.signIn")}
        </TabsTrigger>
        <TabsTrigger
          value="sign-up"
          className="rounded-md data-[state=active]:bg-themeGray data-[state=active]:text-white text-themeTextGray py-2.5 transition-all"
        >
          {t("tabs.signUp")}
        </TabsTrigger>
      </TabsList>

      {/* Sign In Tab */}
      <TabsContent value="sign-in" className="mt-6 space-y-4 data-[state=inactive]:hidden" forceMount>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white">{t("signin.title")}</h2>
          <p className="text-sm text-themeTextGray">{t("signin.description")}</p>
        </div>

        <form onSubmit={onSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email" className="text-themeTextWhite">
              {t("form.email.label")}
            </Label>
            <Input
              id="signin-email"
              type="email"
              placeholder={t("form.email.placeholder")}
              {...registerSignIn("email")}
              className="bg-themeBlack border-themeGray text-white placeholder:text-themeTextGray focus:border-emerald-500 focus:ring-emerald-500"
            />
            {signInErrors.email && (
              <p className="text-sm text-red-500">{signInErrors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="signin-password" className="text-themeTextWhite">
                {t("form.password.label")}
              </Label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                {t("forgotPassword.link") || "Forgot password?"}
              </button>
            </div>
            <div className="relative">
              <Input
                id="signin-password"
                type={showSignInPassword ? "text" : "password"}
                placeholder={t("form.password.signInPlaceholder") || "Enter your password"}
                {...registerSignIn("password")}
                className="bg-themeBlack border-themeGray text-white placeholder:text-themeTextGray focus:border-emerald-500 focus:ring-emerald-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSignInPassword(!showSignInPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-themeTextGray hover:text-white transition-colors"
              >
                {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {signInErrors.password && (
              <p className="text-sm text-red-500">{signInErrors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSignInPending}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSignInPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("buttons.signInWithEmail")
            )}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <Separator className="bg-themeGray" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-themeGray/50 px-3 text-themeTextGray">
              {t("separator.orContinueWith")}
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => signInWithGoogle()}
          disabled={isGooglePending}
          className="w-full rounded-xl flex gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium border border-gray-300 shadow-sm transition-all hover:shadow-md"
        >
          {isGooglePending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="bg-white p-1 rounded-full">
              <Google />
            </div>
          )}
          {t("google.signInButton")}
        </Button>
      </TabsContent>

      {/* Sign Up Tab */}
      <TabsContent value="sign-up" className="mt-6 space-y-4 data-[state=inactive]:hidden" forceMount>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white">{t("card.title")}</h2>
          <p className="text-sm text-themeTextGray">{t("card.description")}</p>
        </div>

        <form onSubmit={onSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signup-firstname" className="text-themeTextWhite">
                {t("form.firstname.label")}
              </Label>
              <Input
                id="signup-firstname"
                type="text"
                placeholder={t("form.firstname.placeholder")}
                {...registerSignUp("firstname")}
                className="bg-themeBlack border-themeGray text-white placeholder:text-themeTextGray focus:border-emerald-500 focus:ring-emerald-500"
              />
              {signUpErrors.firstname && (
                <p className="text-sm text-red-500">{signUpErrors.firstname.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-lastname" className="text-themeTextWhite">
                {t("form.lastname.label")}
              </Label>
              <Input
                id="signup-lastname"
                type="text"
                placeholder={t("form.lastname.placeholder")}
                {...registerSignUp("lastname")}
                className="bg-themeBlack border-themeGray text-white placeholder:text-themeTextGray focus:border-emerald-500 focus:ring-emerald-500"
              />
              {signUpErrors.lastname && (
                <p className="text-sm text-red-500">{signUpErrors.lastname.message}</p>
              )}
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
              {...registerSignUp("email")}
              className="bg-themeBlack border-themeGray text-white placeholder:text-themeTextGray focus:border-emerald-500 focus:ring-emerald-500"
            />
            {signUpErrors.email && (
              <p className="text-sm text-red-500">{signUpErrors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-themeTextWhite">
              {t("form.password.label")}
            </Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showSignUpPassword ? "text" : "password"}
                placeholder={t("form.password.placeholder")}
                {...registerSignUp("password")}
                className="bg-themeBlack border-themeGray text-white placeholder:text-themeTextGray focus:border-emerald-500 focus:ring-emerald-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-themeTextGray hover:text-white transition-colors"
              >
                {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {signUpErrors.password && (
              <p className="text-sm text-red-500">{signUpErrors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSignUpPending}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSignUpPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("buttons.signUpWithEmail")
            )}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <Separator className="bg-themeGray" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-themeGray/50 px-3 text-themeTextGray">
              {t("separator.orContinueWith")}
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => signInWithGoogle()}
          disabled={isGooglePending}
          className="w-full rounded-xl flex gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium border border-gray-300 shadow-sm transition-all hover:shadow-md"
        >
          {isGooglePending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="bg-white p-1 rounded-full">
              <Google />
            </div>
          )}
          {t("google.signUpButton")}
        </Button>
      </TabsContent>
    </Tabs>
  )
}
