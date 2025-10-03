"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { Check, ChevronDown, Globe } from "lucide-react"
import { useMemo } from "react"

const SUPPORTED: Array<{ code: "en" | "hi"; label: string }> = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
]

export function AuthLanguageSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const current = useLocale() as "en" | "hi"

  const switchTo = (nextLocale: "en" | "hi") => {
    // Push same pathname with new locale using next-intl router
    router.push({ pathname }, { locale: nextLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 gap-2 rounded-full border-themeGray bg-[#0B0B0C] text-white hover:bg-[#121214] hover:border-themeGray"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm">{SUPPORTED.find(s => s.code === current)?.label ?? "Language"}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 border-themeGray bg-[#0B0B0C] text-white">
        <DropdownMenuLabel className="text-xs text-[#9aa0a6]">Language</DropdownMenuLabel>
        {SUPPORTED.map(({ code, label }) => (
          <DropdownMenuItem
            key={code}
            className="cursor-pointer focus:bg-[#121214] focus:text-white"
            onClick={() => switchTo(code)}
          >
            <span className="flex-1">{label}</span>
            {current === code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
