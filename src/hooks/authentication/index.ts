import {
    ForgotPasswordFormSchema,
    ResetPasswordFormSchema,
    SignInFormSchema,
    SignUpFormSchema,
    type ForgotPasswordFormValues,
    type ResetPasswordFormValues,
    type SignInFormValues,
    type SignUpFormValues,
} from "@/components/form/auth-form/schema"
import { authClient, signIn, signUp } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export const useAuthSignIn = (opts?: { locale?: string; returnUrl?: string; onSuccess?: () => void }) => {
  const router = useRouter()
  const locale = opts?.locale ?? "en"
  const returnUrl = opts?.returnUrl

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(SignInFormSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ["auth-sign-in"],
    mutationFn: async (values: SignInFormValues) => {
      return new Promise<void>((resolve, reject) => {
        signIn.email(
          {
            email: values.email,
            password: values.password,
          },
          {
            onSuccess: () => resolve(),
            onError: (ctx) => reject(new Error(ctx.error.message || "Sign in failed")),
          }
        )
      })
    },
    onSuccess: () => {
      reset()
      toast.success("Welcome back!")
      opts?.onSuccess?.()
      const callbackUrl = returnUrl 
        ? `/callback/sign-in?locale=${locale}&returnUrl=${encodeURIComponent(returnUrl)}`
        : `/callback/sign-in?locale=${locale}`
      router.push(callbackUrl)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid email or password")
    },
  })

  const onSignIn = handleSubmit((values) => mutate(values))

  return {
    register,
    errors,
    onSignIn,
    isPending,
  }
}

export const useAuthSignUp = (opts?: { locale?: string; returnUrl?: string; onSuccess?: () => void }) => {
  const router = useRouter()
  const locale = opts?.locale ?? "en"
  const returnUrl = opts?.returnUrl

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
    mode: "onBlur",
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ["auth-sign-up"],
    mutationFn: async (values: SignUpFormValues) => {
      return new Promise<void>((resolve, reject) => {
        signUp.email(
          {
            email: values.email,
            password: values.password,
            name: `${values.firstname} ${values.lastname}`.trim(),
          },
          {
            onSuccess: () => resolve(),
            onError: (ctx) => reject(new Error(ctx.error.message || "Sign up failed")),
          }
        )
      })
    },
    onSuccess: () => {
      reset()
      toast.success("Account created successfully!")
      opts?.onSuccess?.()
      const callbackUrl = returnUrl 
        ? `/callback/sign-in?locale=${locale}&returnUrl=${encodeURIComponent(returnUrl)}`
        : `/callback/sign-in?locale=${locale}`
      router.push(callbackUrl)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create account")
    },
  })

  const onSignUp = handleSubmit((values) => mutate(values))

  return {
    register,
    errors,
    onSignUp,
    isPending,
  }
}

export const useGoogleAuth = (opts?: { locale?: string; returnUrl?: string }) => {
  const locale = opts?.locale ?? "en"
  const returnUrl = opts?.returnUrl
  const callbackURL = returnUrl 
    ? `/callback/sign-in?locale=${locale}&returnUrl=${encodeURIComponent(returnUrl)}`
    : `/callback/sign-in?locale=${locale}`

  const { mutate: signInWithGoogle, isPending: isGooglePending } = useMutation({
    mutationKey: ["auth-google"],
    mutationFn: async () => {
      await signIn.social({
        provider: "google",
        callbackURL,
      })
    },
  })

  return { signInWithGoogle, isGooglePending }
}

export const useForgotPassword = (opts?: { onSuccess?: () => void }) => {
  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ["auth-forgot-password"],
    mutationFn: async (values: ForgotPasswordFormValues) => {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const result = await (authClient as any).forgetPassword({
        email: values.email,
        redirectTo: `${baseUrl}/en/reset-password`,
      })
      if (result?.error) {
        throw new Error(result.error.message || "Failed to send reset email")
      }
      return result
    },
    onSuccess: () => {
      reset()
      toast.success("If an account exists with this email, you will receive a password reset link.")
      opts?.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reset email")
    },
  })

  const onForgotPassword = handleSubmit((values) => mutate(values))

  return {
    register,
    errors,
    onForgotPassword,
    isPending,
  }
}

export const useResetPassword = (token: string, opts?: { onSuccess?: () => void }) => {
  const router = useRouter()

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordFormSchema),
    mode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ["auth-reset-password"],
    mutationFn: async (values: ResetPasswordFormValues) => {
      const result = await authClient.resetPassword({
        newPassword: values.password,
        token,
      })
      if (result.error) {
        throw new Error(result.error.message || "Failed to reset password")
      }
      return result
    },
    onSuccess: () => {
      reset()
      toast.success("Password reset successfully! Please sign in with your new password.")
      opts?.onSuccess?.()
      router.push("/en/sign-in")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password")
    },
  })

  const onResetPassword = handleSubmit((values) => mutate(values))

  return {
    register,
    errors,
    onResetPassword,
    isPending,
  }
}
