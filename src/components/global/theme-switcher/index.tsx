"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600 dark:text-themeTextGray hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-themeGray/30">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-[#1a1a1d] border-slate-200 dark:border-themeGray shadow-xl">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="text-slate-600 dark:text-themeTextGray hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-themeGray cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="text-slate-600 dark:text-themeTextGray hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-themeGray cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="text-slate-600 dark:text-themeTextGray hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-themeGray cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
