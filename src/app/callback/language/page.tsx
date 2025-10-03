"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

export default function LanguageInterstitial() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next") || "/explore"

  const choose = async (locale: "en" | "hi") => {
    try {
      await fetch("/api/user/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      })
    } catch {}
    router.push(`/${locale}${next}`)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-[#0B0B0C] border border-themeGray rounded-2xl p-8 flex flex-col items-center gap-4 text-white">
        <h2 className="text-xl font-semibold">Choose your language</h2>
        <p className="text-sm text-themeTextGray">We’ll personalize your experience.</p>
        <div className="flex gap-3 mt-2">
          <Button onClick={() => choose("en")} className="rounded-full">English</Button>
          <Button onClick={() => choose("hi")} className="rounded-full" variant="outline">हिन्दी</Button>
        </div>
      </div>
    </div>
  )
}
