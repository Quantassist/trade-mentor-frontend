import { onAuthenticatedUser } from "@/actions/auth"
import { GlassSheet } from "@/components/global/glass-sheet"
import { LocaleSwitcher } from "@/components/global/locale-switcher"
import { ThemeSwitcher } from "@/components/global/theme-switcher"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { Logout } from "@/icons"
import { ArrowRight, MenuIcon } from "lucide-react"
import { Menu } from "./menu"

export const LandingPageNavbar = async () => {
  const user = await onAuthenticatedUser()

  return (
    <div className="w-full flex justify-between sticky top-0 items-center px-5 py-5 z-50">
      <p className="font-bold text-2xl">TradeFlix</p>
      <Menu orientation="desktop" />
      <div className="flex gap-2 items-center">
        <ThemeSwitcher />
        <LocaleSwitcher />
        {user.status === 200 ? (
          <Link href="/explore">
            <Button className="bg-white text-black rounded-2xl flex gap-2 hover:bg-white/90 font-medium">
              Go to Groups
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link href="/sign-in">
            <Button className="rounded-2xl flex gap-2 font-medium bg-gradient-to-r from-[#d4f0e7] to-[#e8f5f0] text-[#1a1a1a] hover:from-[#c4e6db] hover:to-[#d8ebe5] shadow-lg">
              <Logout />
              Login / Signup
            </Button>
          </Link>
        )}
        <GlassSheet
          triggerClass="lg:hidden"
          trigger={
            <Button variant="ghost" className="hover:bg-transparent">
              <MenuIcon size={30} />
            </Button>
          }
        >
          <Menu orientation="mobile" />
        </GlassSheet>
      </div>
    </div>
  )
}
