import { GlassSheet } from "@/components/global/glass-sheet"
import { Search } from "@/components/global/search"
import { SideBar } from "@/components/global/sidebar"
import { UserWidget } from "@/components/global/user-widget"
import { getSession } from "@/lib/get-session"
import { Menu as MenuIcon } from "lucide-react"
import { Menu } from "../group-navbar"
import { SidebarToggle } from "../sidebar-toggle"

type NavbarProps = {
  groupid: string
  userid: string
}
export const Navbar = async ({ groupid, userid }: NavbarProps) => {
  const session = await getSession()
  return (
    <div className="sticky top-0 z-40 bg-slate-200! dark:bg-[#1A1A1D]! backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#1A1A1D]/80  py-2 px-4 sm:py-4 sm:px-6 flex items-center gap-3 justify-between">
      {/* Left cluster: group menu + sidebar trigger */}
      <div className="flex items-center gap-1 shrink-0">
        <SidebarToggle />
        <div className="shrink-0 overflow-x-auto hidden md:block">
          <Menu orientation="desktop" />
        </div>
        <GlassSheet trigger={<MenuIcon className="md:hidden cursor-pointer text-slate-600 dark:text-themeTextWhite" />}>
          <SideBar groupid={groupid} userid={userid} mobile />
        </GlassSheet>
      </div>

      {/* Right cluster: search + user widget */}
      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
        <Search
          searchType="POSTS"
          className="rounded-full border-slate-200 dark:border-themeGray bg-slate-50 dark:bg-black !opacity-100 px-3 flex-1 min-w-[100px] max-w-[140px]"
          placeholder="Search..."
        />
        <UserWidget userid={userid} groupid={groupid} image={session?.user?.image || ""} />
      </div>
    </div>
  )
}
