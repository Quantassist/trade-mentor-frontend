"use client"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/global/sidebar/sidebar-context"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

export function SidebarToggle() {
  const { collapsed, toggle } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      className="hidden md:inline-flex rounded-lg border border-themeGray"
      onClick={toggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
    </Button>
  )
}
