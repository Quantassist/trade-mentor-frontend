"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

export function AboutMentor() {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Meet your Mentor</h3>
      <Card className="border-themeGray bg-[#121315] rounded-xl p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="https://i.pravatar.cc/120?img=12" />
            <AvatarFallback>MB</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-white font-medium">Milan Bavishi</p>
            <p className="text-xs text-themeTextGray">Director-Content • 20 years of experience</p>
            <p className="text-sm text-themeTextWhite/90 max-w-3xl leading-relaxed">
              Milan is a stock market expert with over two decades of experience. He is a trusted authority in the world of trading and investment, passionate about demystifying complex financial concepts.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
