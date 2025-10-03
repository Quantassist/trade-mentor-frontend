"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Check, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (nextLocale: string) => {
    if (!pathname || nextLocale === locale) return;
    router.push({ pathname }, { locale: nextLocale });
    // Persist preference asynchronously (fire-and-forget)
    fetch(`${window.location.origin}/api/user/locale`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    }).catch(() => {});
  };

  const labelFor = (l: string) => (l === "hi" ? "हिन्दी" : "English");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 gap-2 rounded-full border-themeGray bg-[#0B0B0C] text-white hover:bg-[#121214] hover:border-themeGray"
        >
          {/* <Globe className="h-4 w-4" /> */}
          <span className="ml-1 rounded bg-[#1F1F22] px-1.5 py-0.5 text-[10px] text-[#cbd5e1]">A/अ</span>
          <span className="text-sm">{labelFor(locale)}</span>
          
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 border-themeGray bg-[#0B0B0C] text-white"
      >
        <DropdownMenuLabel className="text-xs text-[#9aa0a6]">
          Language
        </DropdownMenuLabel>
        <DropdownMenuItem
          className="cursor-pointer focus:bg-[#121214] focus:text-white"
          onClick={() => switchTo("en")}
        >
          <span className="flex-1">English</span>
          {locale === "en" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer focus:bg-[#121214] focus:text-white"
          onClick={() => switchTo("hi")}
        >
          <span className="flex-1">हिन्दी</span>
          {locale === "hi" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
