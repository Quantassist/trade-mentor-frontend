"use client"

import { useEffect, useRef, useState } from "react"

type FeedLayoutProps = {
  children: React.ReactNode
  sidebar: React.ReactNode
}

export const FeedLayout = ({ children, sidebar }: FeedLayoutProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)
  const [stickyTopValue, setStickyTopValue] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarRef.current) return

      const sidebar = sidebarRef.current
      const sidebarRect = sidebar.getBoundingClientRect()
      const sidebarHeight = sidebar.offsetHeight
      const viewportHeight = window.innerHeight
      
      // When sidebar bottom reaches or goes above viewport bottom, make it sticky
      // The sticky position should keep the sidebar bottom at viewport bottom
      if (sidebarRect.bottom <= viewportHeight) {
        setIsSticky(true)
        // Calculate top value so that sidebar bottom aligns with viewport bottom
        // top = viewportHeight - sidebarHeight
        setStickyTopValue(viewportHeight - sidebarHeight)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })
    // Initial check after a small delay to ensure DOM is ready
    setTimeout(handleScroll, 100)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  return (
    <div className="flex justify-center w-full min-h-[calc(100dvh-var(--group-navbar-h,5rem))]">
      {/* Center - Posts Feed */}
      <div className="flex-1 max-w-[600px] border-x border-themeGray/30">
        <div className="flex flex-col gap-y-4 py-4 px-3">
          {children}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-[350px] shrink-0 py-4 pl-4 pr-2">
        <div 
          ref={sidebarRef}
          style={isSticky ? { 
            position: 'sticky', 
            top: `${stickyTopValue}px`
          } : undefined}
        >
          <div className="flex flex-col gap-4">
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  )
}
