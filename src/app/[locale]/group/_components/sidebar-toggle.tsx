"use client"

import { useSidebar } from "@/components/global/sidebar/sidebar-context"
import { cn } from "@/lib/utils"

// Custom sidebar toggle icon similar to image 3 - horizontal lines with arrow
function SidebarIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-200"
    >
      {/* Three horizontal lines representing sidebar */}
      <rect x="1" y="3" width="10" height="1.5" rx="0.5" fill="currentColor" />
      <rect x="1" y="7.25" width="10" height="1.5" rx="0.5" fill="currentColor" />
      <rect x="1" y="11.5" width="10" height="1.5" rx="0.5" fill="currentColor" />
      {/* Arrow indicator */}
      <path
        d={collapsed ? "M13 8L15 6V10L13 8Z" : "M15 8L13 6V10L15 8Z"}
        fill="currentColor"
      />
    </svg>
  )
}

export function SidebarToggle() {
  const { collapsed, toggle } = useSidebar()
  return (
    <button
      onClick={toggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "hidden md:inline-flex items-center justify-center cursor-pointer",
        "h-8 w-8 rounded-lg",
        "bg-[#1e2329] hover:bg-[#2a2f36]",
        "border border-themeGray/40 hover:border-themeGray/60",
        "text-themeTextGray hover:text-white",
        "transition-all duration-200",
      )}
    >
      <SidebarIcon collapsed={collapsed} />
    </button>
  )
}
