import { onAuthenticatedUser } from "@/actions/auth"
import { onGetUserGroups } from "@/actions/groups"
import { GlassSheet } from "@/components/global/glass-sheet"
import { LocaleSwitcher } from "@/components/global/locale-switcher"
import { ThemeSwitcher } from "@/components/global/theme-switcher"
import { UserWidget } from "@/components/global/user-widget"
import { Button } from "@/components/ui/button"
import { CheckBadge, Logout } from "@/icons"
import { MenuIcon, Plus } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { GroupDropDown } from "./group-dropdown"

export const Navbar = async () => {
  const user = await onAuthenticatedUser()
  const groups = await onGetUserGroups(user.id!)

  return (
    <div className="flex px-5 lg:px-8 py-4 items-center bg-[#0a0a0b]/80 border-b border-themeGray/20 fixed z-50 w-full backdrop-blur-xl">
      <div className="hidden lg:inline">
        {user.status === 200 ? (
          <GroupDropDown groups={groups} />
        ) : (
          <Link href="/" className="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
            TradeFlix
          </Link>
        )}
      </div>
      <GlassSheet
        trigger={
          <span className="lg:hidden flex items-center gap-2 py-2">
            <MenuIcon className="cursor-pointer h-5 w-5" />
            <p className="font-semibold">TradeFlix</p>
          </span>
        }
      >
        <div>Content</div>
      </GlassSheet>
      <div className="flex-1 lg:flex hidden justify-end gap-3 items-center">
        <Link href={user.status === 200 ? `/group/create` : "/sign-in"}>
          <Button
            variant="outline"
            className="bg-transparent rounded-full flex gap-2 border-themeGray/60 hover:bg-[#1a1d21] hover:border-themeGray text-white transition-all h-10 px-5"
          >
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </Link>
        <ThemeSwitcher />
        <LocaleSwitcher />
        {user.status === 200 ? (
          <UserWidget image={user.image!} />
        ) : (
          <Link href="/sign-in">
            <Button className="rounded-full flex gap-2 font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 h-10 px-5 transition-all">
              <Logout />
              Login / Signup
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
