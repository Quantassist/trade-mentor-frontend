import { onAuthenticatedUser } from "@/actions/auth"
import { UserProfileSchema } from "@/components/form/user-profile/schema"
import { UserSettingsSchema } from "@/components/form/user-settings/schema"
import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

export const useAuthenticatedUser = () => {
  const [user, setUser] = useState<{
    status: number
    id?: string
    username?: string
    image?: string | null
  }>({
    status: 0,
    id: undefined,
    username: undefined,
    image: undefined,
  })

  useEffect(() => {
    onAuthenticatedUser().then((resolvedUser) => {
      setUser(resolvedUser)
    })
  }, [])

  return user
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

type Session = {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
    emailVerified: boolean
    role?: string | null
  }
  session: {
    id: string
    expiresAt: Date
    token: string
  }
}

export const useUserProfileForm = (session: Session) => {
  const router = useRouter()
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(session.user.image || null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm<z.infer<typeof UserProfileSchema>>({
    resolver: zodResolver(UserProfileSchema),
    mode: "onChange",
    defaultValues: {
      name: session.user.name || "",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    startTransition(async () => {
      await authClient.updateUser({
        name: values.name || undefined,
        image: image ? await convertImageToBase64(image) : undefined,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Profile updated successfully")
            router.refresh()
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to update profile")
          },
        },
      })
    })
  })

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return {
    register,
    errors,
    onSubmit,
    isPending,
    image,
    setImage,
    imagePreview,
    setImagePreview,
    handleImageChange,
    initials,
    session,
    watch,
  }
}

type ActiveSession = {
  id: string
  token: string
  expiresAt: Date
  userAgent?: string | null
  ipAddress?: string | null
}

export const useUserSettingsForm = (session: Session, activeSessions: ActiveSession[]) => {
  const router = useRouter()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null)

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<z.infer<typeof UserSettingsSchema>>({
    resolver: zodResolver(UserSettingsSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onChangePassword = handleSubmit(async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    startTransition(async () => {
      const res = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: false,
      })

      if (res.error) {
        toast.error(res.error.message || "Failed to change password")
      } else {
        toast.success("Password changed successfully")
        reset()
      }
    })
  })

  const handleTerminateSession = async (sessionToken: string, sessionId: string) => {
    setTerminatingSession(sessionId)
    const res = await authClient.revokeSession({ token: sessionToken })

    if (res.error) {
      toast.error(res.error.message || "Failed to terminate session")
    } else {
      toast.success("Session terminated successfully")
      if (sessionId === session.session.id) {
        router.push("/")
      } else {
        router.refresh()
      }
    }
    setTerminatingSession(null)
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await authClient.deleteUser({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Account deleted successfully")
            router.push("/")
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to delete account")
          },
        },
      })
    } catch (error) {
      toast.error("Failed to delete account")
    }
    setIsDeleting(false)
  }

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
        },
      },
    })
  }

  const getDeviceIcon = (userAgent: string | null | undefined) => {
    if (!userAgent) return "laptop"
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)
    return isMobile ? "smartphone" : "laptop"
  }

  const getDeviceName = (userAgent: string | null | undefined) => {
    if (!userAgent) return "Unknown Device"

    if (/windows/i.test(userAgent)) return "Windows"
    if (/macintosh|mac os/i.test(userAgent)) return "macOS"
    if (/linux/i.test(userAgent)) return "Linux"
    if (/android/i.test(userAgent)) return "Android"
    if (/iphone|ipad/i.test(userAgent)) return "iOS"
    return "Unknown Device"
  }

  return {
    register,
    errors,
    onChangePassword,
    isPending,
    isDeleting,
    terminatingSession,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleTerminateSession,
    handleDeleteAccount,
    handleSignOut,
    getDeviceIcon,
    getDeviceName,
    session,
    activeSessions,
    watch,
  }
}
