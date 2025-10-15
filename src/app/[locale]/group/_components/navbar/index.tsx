import { GlassSheet } from "@/components/global/glass-sheet"
import { LocaleSwitcher } from "@/components/global/locale-switcher"
import { Search } from "@/components/global/search"
import { SideBar } from "@/components/global/sidebar"
import { UserWidget } from "@/components/global/user-widget"
import { currentUser } from "@clerk/nextjs/server"
import { Menu as MenuIcon } from "lucide-react"
import { Menu } from "../group-navbar"
import { SidebarToggle } from "../sidebar-toggle"

type NavbarProps = {
  groupid: string
  userid: string
}
export const Navbar = async ({ groupid, userid }: NavbarProps) => {
  const user = await currentUser()
  return (
    <div className="sticky top-0 z-40 bg-[#1A1A1D]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1A1A1D]/80 py-2 px-4 sm:py-4 sm:px-6 flex items-center gap-3 justify-between">
      {/* Left cluster: group menu + sidebar trigger */}
      <div className="flex items-center gap-1 shrink-0">
        <SidebarToggle />
        <div className="shrink-0 overflow-x-auto hidden md:block">
          <Menu orientation="desktop" />
        </div>
        <GlassSheet trigger={<MenuIcon className="md:hidden cursor-pointer" />}>
          <SideBar groupid={groupid} userid={userid} mobile />
        </GlassSheet>
      </div>

      {/* Right cluster: search + locale switcher + user widget */}
      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
        <Search
          searchType="POSTS"
          className="rounded-full border-themeGray bg-black !opacity-100 px-3 flex-1 min-w-[100px] max-w-[140px]"
          placeholder="Search..."
        />
        <LocaleSwitcher />
        <UserWidget userid={userid} groupid={groupid} image={user?.imageUrl!} />
      </div>
    </div>
  )
}
