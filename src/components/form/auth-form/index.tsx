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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("forgotPassword.title") || "Forgot Password"}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("forgotPassword.description") || "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <form onSubmit={onForgotPassword} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="forgot-email" className="text-gray-700 dark:text-gray-300 font-medium">
              {t("form.email.label")}
            </Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder={t("form.email.placeholder")}
              {...registerForgot("email")}
              className="bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 rounded-full h-12 px-5"
            />
            {forgotErrors.email && (
              <p className="text-sm text-red-500">{forgotErrors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isForgotPending}
            className="w-full rounded-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all"
          >
            {isForgotPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("forgotPassword.submit") || "Send Reset Link"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowForgotPassword(false)}
            className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1a1d21] rounded-full h-12"
          >
            {t("forgotPassword.backToSignIn") || "Back to Sign In"}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <Tabs defaultValue={defaultTab} className={`w-full ${FORM_MIN_HEIGHT}`}>
      <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-[#1a1d21] rounded-full h-auto p-1.5">
        <TabsTrigger
          value="sign-in"
          className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#252a31] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400 py-2.5 font-medium transition-all"
        >
          {t("tabs.signIn")}
        </TabsTrigger>
        <TabsTrigger
          value="sign-up"
          className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#252a31] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400 py-2.5 font-medium transition-all"
        >
          {t("tabs.signUp")}
        </TabsTrigger>
      </TabsList>

      {/* Sign In Tab */}
      <TabsContent value="sign-in" className="mt-8 space-y-6 data-[state=inactive]:hidden" forceMount>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("signin.title")}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("signin.description")}</p>
        </div>

        <form onSubmit={onSignIn} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="signin-email" className="text-gray-700 dark:text-gray-300 font-medium">
              {t("form.email.label")}
            </Label>
            <Input
              id="signin-email"
              type="email"
              placeholder={t("form.email.placeholder")}
              {...registerSignIn("email")}
              className="bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 rounded-full h-12 px-5"
            />
            {signInErrors.email && (
              <p className="text-sm text-red-500">{signInErrors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="signin-password" className="text-gray-700 dark:text-gray-300 font-medium">
                {t("form.password.label")}
              </Label>
            </div>
            <div className="relative">
              <Input
                id="signin-password"
                type={showSignInPassword ? "text" : "password"}
                placeholder={t("form.password.signInPlaceholder") || "Enter your password"}
                {...registerSignIn("password")}
                className="bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 rounded-full h-12 px-5 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowSignInPassword(!showSignInPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showSignInPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {signInErrors.password && (
              <p className="text-sm text-red-500">{signInErrors.password.message}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors font-medium"
          >
            {t("forgotPassword.link") || "Forgot password?"}
          </button>

          <Button
            type="submit"
            disabled={isSignInPending}
            className="w-full rounded-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all"
          >
            {isSignInPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("buttons.signInWithEmail")
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#111214] px-4 text-gray-400 font-medium">
              {t("separator.orContinueWith")}
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => signInWithGoogle()}
          disabled={isGooglePending}
          className="w-full rounded-full h-12 flex gap-3 bg-white dark:bg-[#1a1d21] hover:bg-gray-50 dark:hover:bg-[#252a31] text-gray-700 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
        >
          {isGooglePending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Google />
          )}
          {t("google.signInButton")}
        </Button>
      </TabsContent>

      {/* Sign Up Tab */}
      <TabsContent value="sign-up" className="mt-8 space-y-5 data-[state=inactive]:hidden" forceMount>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("card.title")}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("card.description")}</p>
        </div>

        <form onSubmit={onSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="signup-firstname" className="text-gray-700 dark:text-gray-300 font-medium">
                {t("form.firstname.label")}
              </Label>
              <Input
                id="signup-firstname"
                type="text"
                placeholder={t("form.firstname.placeholder")}
                {...registerSignUp("firstname")}
                className="bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 rounded-full h-12 px-5"
              />
              {signUpErrors.firstname && (
                <p className="text-sm text-red-500">{signUpErrors.firstname.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-lastname" className="text-gray-700 dark:text-gray-300 font-medium">
                {t("form.lastname.label")}
              </Label>
              <Input
                id="signup-lastname"
                type="text"
                placeholder={t("form.lastname.placeholder")}
                {...registerSignUp("lastname")}
                className="bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 rounded-full h-12 px-5"
              />
              {signUpErrors.lastname && (
                <p className="text-sm text-red-500">{signUpErrors.lastname.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-gray-700 dark:text-gray-300 font-medium">
              {t("form.email.label")}
            </Label>
            <Input
              id="signup-email"
              type="email"
              placeholder={t("form.email.placeholder")}
              {...registerSignUp("email")}
              className="bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 rounded-full h-12 px-5"
            />
            {signUpErrors.email && (
              <p className="text-sm text-red-500">{signUpErrors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-gray-700 dark:text-gray-300 font-medium">
              {t("form.password.label")}
            </Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showSignUpPassword ? "text" : "password"}
                placeholder={t("form.password.placeholder")}
                {...registerSignUp("password")}
                className="bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 rounded-full h-12 px-5 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showSignUpPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {signUpErrors.password && (
              <p className="text-sm text-red-500">{signUpErrors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSignUpPending}
            className="w-full rounded-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all"
          >
            {isSignUpPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("buttons.signUpWithEmail")
            )}
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <Separator className="bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#111214] px-4 text-gray-400 font-medium">
              {t("separator.orContinueWith")}
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => signInWithGoogle()}
          disabled={isGooglePending}
          className="w-full rounded-full h-12 flex gap-3 bg-white dark:bg-[#1a1d21] hover:bg-gray-50 dark:hover:bg-[#252a31] text-gray-700 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
        >
          {isGooglePending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Google />
          )}
          {t("google.signUpButton")}
        </Button>
      </TabsContent>
    </Tabs>
  )
}
