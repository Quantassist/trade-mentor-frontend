"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUserSettingsForm } from "@/hooks/user"
import { AlertTriangle, Eye, EyeOff, Laptop, Loader2, LogOut, Smartphone, Trash2 } from "lucide-react"

type Session = {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
    emailVerified: boolean
  }
  session: {
    id: string
    expiresAt: Date
    token: string
  }
}

type ActiveSession = {
  id: string
  token: string
  expiresAt: Date
  userAgent?: string | null
  ipAddress?: string | null
}

type SettingsFormProps = {
  session: Session
  activeSessions: ActiveSession[]
}

export function SettingsForm({ session, activeSessions }: SettingsFormProps) {
  const {
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
  } = useUserSettingsForm(session, activeSessions)

  const renderDeviceIcon = (userAgent: string | null | undefined) => {
    const iconType = getDeviceIcon(userAgent)
    return iconType === "smartphone" ? <Smartphone className="h-4 w-4" /> : <Laptop className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <Card className="bg-[#161a20] border-themeGray/60">
        <CardHeader>
          <CardTitle className="text-white">Change Password</CardTitle>
          <CardDescription className="text-themeTextGray">
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-themeTextWhite">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  {...register("currentPassword")}
                  placeholder="Enter current password"
                  className="bg-themeBlack border-themeGray text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-themeTextGray hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-400 text-sm">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-themeTextWhite">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword")}
                  placeholder="Enter new password"
                  className="bg-themeBlack border-themeGray text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-themeTextGray hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-400 text-sm">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-themeTextWhite">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Confirm new password"
                  className="bg-themeBlack border-themeGray text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-themeTextGray hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions Card */}
      <Card className="bg-[#161a20] border-themeGray/60">
        <CardHeader>
          <CardTitle className="text-white">Active Sessions</CardTitle>
          <CardDescription className="text-themeTextGray">
            Information about your current session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-themeGray/60">
            <span className="text-themeTextGray">Session ID</span>
            <span className="text-white font-mono text-sm truncate max-w-[200px]">
              {session.session.id}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-themeTextGray">Expires At</span>
            <span className="text-white">
              {new Date(session.session.expiresAt).toLocaleDateString()}
            </span>
          </div>

          {activeSessions.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-themeTextGray">All active sessions:</p>
              {activeSessions.map((activeSession) => (
                <div
                  key={activeSession.id}
                  className="flex items-center justify-between p-3 bg-themeBlack rounded-lg border border-themeGray/30"
                >
                  <div className="flex items-center gap-3">
                    {renderDeviceIcon(activeSession.userAgent)}
                    <div>
                      <p className="text-sm text-white">{getDeviceName(activeSession.userAgent)}</p>
                      <p className="text-xs text-themeTextGray">
                        {activeSession.id === session.session.id ? "Current session" : "Active"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTerminateSession(activeSession.token, activeSession.id)}
                    disabled={terminatingSession === activeSession.id}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    {terminatingSession === activeSession.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : activeSession.id === session.session.id ? (
                      "Sign Out"
                    ) : (
                      "Terminate"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full mt-4 border-themeGray text-white hover:bg-themeGray/20"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="bg-[#161a20] border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-themeTextGray">
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-medium text-white">Delete Account</p>
              <p className="text-sm text-themeTextGray">
                Permanently delete your account and all associated data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#161a20] border-themeGray/60">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-themeTextGray">
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-themeGray text-white hover:bg-themeGray/20">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
