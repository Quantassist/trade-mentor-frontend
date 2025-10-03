import { onGetGroupInfo } from "@/actions/groups"
import { redirect } from "@/i18n/navigation"
import React from "react"

type SettingsLayoutProps = {
  children: React.ReactNode
  params: Promise<{ groupid: string; locale: string }>
}

const SettingsLayout = async ({ children, params }: SettingsLayoutProps) => {
  const { groupid, locale } = await params

  // Server-side access control: only superadmin, group owner, or admin may access settings
  const info = await onGetGroupInfo(groupid, locale)
  const canManage = Boolean((info as any)?.isSuperAdmin || (info as any)?.groupOwner || (info as any)?.role === "ADMIN")

  if (!canManage) {
    // Redirect unauthorized users back to the group home
    redirect({ href: `/group/${groupid}/feed`, locale })
  }

  return <>{children}</>
}

export default SettingsLayout
