"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { useState } from "react"

type ClapButtonProps = {
  totalClaps: number
  myClaps: number
  onClap: () => void
  showConfetti: boolean
  showMyClaps?: boolean
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

// Clapping hands icon using the SVG from public folder
const ClapIcon = ({ filled, size = 24 }: { filled: boolean; size?: number }) => (
  <div 
    className={cn(
      "relative transition-all duration-200",
      filled ? "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : ""
    )}
    style={{ width: size, height: size }}
  >
    <Image
      src="/clapping-hand-svgrepo-com.svg"
      alt="Clap"
      width={size}
      height={size}
      className={cn(
        "transition-all duration-200",
        filled ? "brightness-100 saturate-100" : "brightness-75 saturate-0 opacity-70"
      )}
    />
  </div>
)

// Confetti particles with better visual effect
const ConfettiParticle = ({ index }: { index: number }) => {
  const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4"]
  const color = colors[index % colors.length]
  const angle = (index * 60) + Math.random() * 30
  const distance = 25 + Math.random() * 20
  
  return (
    <span
      className="absolute w-2 h-2 rounded-full animate-confetti-burst"
      style={{
        backgroundColor: color,
        left: "50%",
        top: "50%",
        "--angle": `${angle}deg`,
        "--distance": `${distance}px`,
      } as React.CSSProperties}
    />
  )
}

export const ClapButton = ({
  totalClaps,
  myClaps,
  onClap,
  showConfetti,
  showMyClaps = false,
  disabled,
  size = "md",
}: ClapButtonProps) => {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    if (disabled) return
    setIsAnimating(true)
    onClap()
    setTimeout(() => setIsAnimating(false), 200)
  }

  // Size configurations for visual hierarchy
  const sizeConfig = {
    sm: { icon: 18, text: "text-sm", padding: "p-1.5", badge: "text-xs px-1.5 py-0.5" },
    md: { icon: 22, text: "text-base font-medium", padding: "p-1.5", badge: "text-xs px-2 py-0.5" },
    lg: { icon: 26, text: "text-lg font-semibold", padding: "p-2", badge: "text-sm px-2.5 py-1" },
  }

  const config = sizeConfig[size]

  return (
    <div className="relative flex items-center gap-2 group">
      {/* Clap button - larger touch target for better engagement */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-200",
          config.padding,
          "hover:bg-amber-500/15 hover:scale-105 active:scale-95",
          isAnimating && "scale-110",
          disabled && "opacity-50 cursor-not-allowed",
          myClaps > 0 && "bg-amber-500/10"
        )}
        title="Clap to show appreciation"
        aria-label={`Clap (${totalClaps} claps)`}
      >
        <ClapIcon filled={myClaps > 0} size={config.icon} />
        
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {[...Array(8)].map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
          </div>
        )}
      </button>

      {/* Clap count - prominent display */}
      <span className={cn(
        "tabular-nums transition-colors duration-200",
        config.text,
        myClaps > 0 ? "text-amber-500" : "text-themeTextGray group-hover:text-white"
      )}>
        {totalClaps}
      </span>

      {/* My claps indicator - gamification element, only shows while clapping */}
      {showMyClaps && myClaps > 0 && (
        <span className={cn(
          "bg-amber-500/20 text-amber-400 rounded-full tabular-nums font-medium animate-in fade-in zoom-in duration-200",
          config.badge
        )}>
          +{myClaps}
        </span>
      )}
    </div>
  )
}
