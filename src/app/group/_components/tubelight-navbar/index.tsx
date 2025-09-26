"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import Link from "next/link"
import type { ElementType, ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"

interface NavItem {
  name: string
  url: string
  icon?: LucideIcon | ElementType | ReactNode
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  activeUrl?: string
  onItemClick?: (item: NavItem) => void
  position?: "fixed" | "inline"
}

export function NavBar({
  items,
  className,
  activeUrl,
  onItemClick,
  position = "inline",
}: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? "")
  const [isMobile, setIsMobile] = useState(false)

  const activeFromUrl = useMemo(() => {
    if (!activeUrl) return undefined
    const found = items.find((i) => i.url === activeUrl)
    return found?.name
  }, [activeUrl, items])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Sync active tab from parent url if provided
  useEffect(() => {
    if (activeFromUrl) setActiveTab(activeFromUrl)
  }, [activeFromUrl])

  const containerPositionClass =
    position === "fixed"
      ? "fixed inset-x-0 bottom-0 z-50 flex justify-center"
      : "relative"

  return (
    <div className={cn(containerPositionClass, className)}>
      <div className="pointer-events-auto flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon =
            typeof item.icon === "function" ? (item.icon as ElementType) : null
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => {
                setActiveTab(item.name)
                onItemClick?.(item)
              }}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden sm:inline-flex items-center">
                {isActive && (
                  <span className="mr-2 inline-flex items-center">
                    {Icon ? (
                      <Icon size={16} strokeWidth={2.2} />
                    ) : (
                      (item.icon as ReactNode)
                    )}
                  </span>
                )}
                {item.name}
              </span>
              <span className="sm:hidden">
                {Icon ? (
                  <Icon size={18} strokeWidth={2.5} />
                ) : (
                  (item.icon as ReactNode)
                )}
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
