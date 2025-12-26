"use client"

import { USER_SETTINGS_MENU } from "@/constants/menus"
import { cn } from "@/lib/utils"
import { Settings, User } from "lucide-react"
import { Link, usePathname } from "@/i18n/navigation"

type UserSettingsSidebarProps = {
  locale: string
}

export const UserSettingsSidebar = ({ locale }: UserSettingsSidebarProps) => {
  const pathname = usePathname()
  const currentSection = pathname.split("/").pop()

  const getIcon = (path: string) => {
    switch (path) {
      case "profile":
        return <User className="h-4 w-4" />
      case "account":
        return <Settings className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-themeGray/30 h-[calc(100vh-80px)] sticky top-[80px]">
      <div className="py-8 px-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
        </div>
        <nav className="flex flex-col gap-1">
          {USER_SETTINGS_MENU.map((item) => (
            <Link
              key={item.id}
              href={`/${item.path}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                currentSection === item.path
                  ? "bg-[#2a2a2a] text-white"
                  : "text-themeTextGray hover:bg-[#2a2a2a]/70 hover:text-white"
              )}
            >
              {getIcon(item.path)}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
