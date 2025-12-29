"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { useState } from "react"

type CommentClapButtonProps = {
  totalClaps: number
  myClaps: number
  onClap: () => void
  showConfetti: boolean
  showMyClaps?: boolean
  disabled?: boolean
}

// Clapping hands icon using the SVG from public folder - smaller version for comments
const ClapIcon = ({ filled, size = 18 }: { filled: boolean; size?: number }) => (
  <div 
    className={cn(
      "relative transition-all duration-200",
      filled ? "drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" : ""
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

const ConfettiParticle = ({ index }: { index: number }) => {
  const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4"]
  const color = colors[index % colors.length]
  const angle = (index * 60) + Math.random() * 30
  const distance = 18 + Math.random() * 12
  
  return (
    <span
      className="absolute w-1.5 h-1.5 rounded-full animate-confetti-burst"
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

export const CommentClapButton = ({
  totalClaps,
  myClaps,
  onClap,
  showConfetti,
  showMyClaps = false,
  disabled,
}: CommentClapButtonProps) => {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    if (disabled) return
    setIsAnimating(true)
    onClap()
    setTimeout(() => setIsAnimating(false), 200)
  }

  return (
    <div className="relative flex items-center gap-1.5 group">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "relative flex items-center gap-1.5 text-slate-500 dark:text-themeTextGray text-sm transition-all duration-200",
          "hover:text-amber-500 active:scale-95 p-1 rounded-full hover:bg-amber-500/10",
          isAnimating && "scale-110",
          disabled && "opacity-50 cursor-not-allowed",
          myClaps > 0 && "text-amber-500"
        )}
        title="Clap"
      >
        <ClapIcon filled={myClaps > 0} size={18} />
        
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {[...Array(6)].map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
          </div>
        )}
        
        <span className="tabular-nums font-medium">
          {totalClaps > 0 ? totalClaps : "Clap"}
        </span>
      </button>

      {showMyClaps && myClaps > 0 && (
        <span className="px-1.5 py-0.5 text-[11px] bg-amber-500/20 text-amber-400 rounded-full tabular-nums font-medium animate-in fade-in zoom-in duration-200">
          +{myClaps}
        </span>
      )}
    </div>
  )
}
