import { SignInSchema } from "@/components/form/sign-in/schema"
import { SignUpSchema } from "@/components/form/sign-up/schema"
import { signIn, signUp } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

export const useAuthSignUp = (opts?: { locale?: "en" | "hi" }) => {
  const [creating, setCreating] = useState<boolean>(false)
  const router = useRouter()
  const locale = opts?.locale ?? "en"

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    getValues,
  } = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    mode: "onBlur",
  })

  const onInitiateUserRegistration = handleSubmit(async (values) => {
    try {
      setCreating(true)
      await signUp.email(
        {
          email: values.email,
          password: values.password,
          name: `${values.firstname} ${values.lastname}`.trim(),
        },
        {
          onSuccess: () => {
            reset()
            toast("Success", {
              description: "Account created successfully",
            })
            router.push(`/callback/sign-in?locale=${locale}`)
          },
          onError: (ctx) => {
            toast("Error", {
              description: ctx.error.message || "Sign up failed",
            })
          },
        }
      )
      setCreating(false)
    } catch (error) {
      console.error(error)
      setCreating(false)
    }
  })

  return {
    register,
    errors,
    onInitiateUserRegistration,
    creating,
    getValues,
  }
}

export const useGoogleAuth = (opts?: { locale?: "en" | "hi" }) => {
  const locale = opts?.locale ?? "en"

  const signInWithGoogle = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: `/callback/sign-in?locale=${locale}`,
    })
  }

  const signUpWithGoogle = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: `/callback/sign-in?locale=${locale}`,
    })
  }

  return { signUpWithGoogle, signInWithGoogle }
}

export const useAuthSignIn = (opts?: { locale?: "en" | "hi" }) => {
  const router = useRouter()
  const locale = opts?.locale ?? "en"

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    mode: "onBlur",
  })

  const onBetterAuth = async (email: string, password: string) => {
    await signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          reset()
          toast("Success", {
            description: "Welcome back!",
          })
          router.push(`/callback/sign-in?locale=${locale}`)
        },
        onError: (ctx) => {
          toast("Error", {
            description: ctx.error.message || "email/password is incorrect try again",
          })
        },
      }
    )
  }

  const { mutate: InitiateLoginFlow, isPending } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      onBetterAuth(email, password),
  })

  const onAuthenticateUser = handleSubmit(async (values) => {
    InitiateLoginFlow({ email: values.email, password: values.password })
  })

  return {
    onAuthenticateUser,
    isPending,
    register,
    errors,
  }
}
