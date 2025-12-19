"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUserProfileForm } from "@/hooks/user"
import { Camera, Loader2 } from "lucide-react"

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

type ProfileFormProps = {
  session: Session
}

export function ProfileForm({ session }: ProfileFormProps) {
  const {
    register,
    errors,
    onSubmit,
    isPending,
    imagePreview,
    handleImageChange,
    initials,
  } = useUserProfileForm(session)

  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <Card className="bg-[#161a20] border-themeGray/60">
        <CardHeader>
          <CardTitle className="text-white">Personal Information</CardTitle>
          <CardDescription className="text-themeTextGray">
            Update your profile details and photo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={imagePreview || undefined} alt={session.user.name} className="object-cover" />
                  <AvatarFallback className="text-xl bg-themeGray text-white">{initials}</AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1.5 bg-themeGray rounded-full cursor-pointer hover:bg-themeGray/80 transition-colors"
                >
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="font-medium text-white">{session.user.name}</p>
                <p className="text-sm text-themeTextGray">{session.user.email}</p>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-themeTextWhite">Full Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter your full name"
                className="bg-themeBlack border-themeGray text-white"
              />
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-themeTextWhite">Email</Label>
              <Input
                id="email"
                value={session.user.email}
                disabled
                className="bg-themeBlack border-themeGray text-themeTextGray"
              />
              <p className="text-xs text-themeTextGray">Email cannot be changed</p>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card className="bg-[#161a20] border-themeGray/60">
        <CardHeader>
          <CardTitle className="text-white">Account Information</CardTitle>
          <CardDescription className="text-themeTextGray">
            Details about your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-themeGray/60">
            <span className="text-themeTextGray">Account ID</span>
            <span className="text-white font-mono text-sm">{session.user.id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-themeGray/60">
            <span className="text-themeTextGray">Role</span>
            <span className="text-white capitalize">{session.user.role || "User"}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-themeTextGray">Email Verified</span>
            <span className={session.user.emailVerified ? "text-green-500" : "text-yellow-500"}>
              {session.user.emailVerified ? "Yes" : "No"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
