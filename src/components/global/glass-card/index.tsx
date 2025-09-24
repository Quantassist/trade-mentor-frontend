import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import React from "react"

type GlassCardProps = {
  children: React.ReactNode
  className?: string
}

export const GlassCard = ({ children, className }: GlassCardProps) => {
  return (
    <Card
      className={cn(
        className,
        "rounded-2xl bg-themeGray border-themeGray bg-clip-padding backdrop--blur__safari backdrop-filter backdrop-blur-4xl bg-opacity-40",
      )}
    >
      {children}
    </Card>
  )
}
