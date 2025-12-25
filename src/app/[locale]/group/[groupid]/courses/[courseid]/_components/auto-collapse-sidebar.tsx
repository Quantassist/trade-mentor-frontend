"use client"

import { useSidebar } from "@/components/global/sidebar/sidebar-context"
import { useEffect } from "react"

/**
 * Auto-collapses the sidebar when entering course pages to maximize content space.
 * Renders nothing - just handles the side effect.
 */
export function AutoCollapseSidebar() {
  const { setCollapsed } = useSidebar()

  useEffect(() => {
    // Collapse sidebar when entering course pages
    setCollapsed(true)
  }, [setCollapsed])

  return null
}
