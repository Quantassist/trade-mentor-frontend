"use client"

import React from "react"

export type SidebarState = {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  toggle: () => void
}

const STORAGE_KEY = "sidebar:collapsed"
const EVENT_KEY = "sidebar:changed"

export const useSidebar = (): SidebarState => {
  const [collapsed, setCollapsed] = React.useState(false)

  // Initialize from localStorage and subscribe to global changes
  React.useEffect(() => {
    try {
      const saved = globalThis?.localStorage?.getItem(STORAGE_KEY)
      if (saved != null) setCollapsed(saved === "1")
    } catch {}

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail
      if (typeof detail === "boolean") setCollapsed(detail)
    }
    window.addEventListener(EVENT_KEY, handler as EventListener)
    return () => window.removeEventListener(EVENT_KEY, handler as EventListener)
  }, [])

  const apply = React.useCallback((v: boolean) => {
    setCollapsed(v)
    try {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0")
    } catch {}
    try {
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: v }))
    } catch {}
  }, [])

  return {
    collapsed,
    setCollapsed: apply,
    toggle: () => apply(!collapsed),
  }
}

// No-op provider for compatibility. Not required for the hook.
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
