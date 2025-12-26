"use client"

import { useEffect, useRef, useState } from "react"

type FeedLayoutProps = {
  children: React.ReactNode
  sidebar: React.ReactNode
}

export const FeedLayout = ({ children, sidebar }: FeedLayoutProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [stickyTop, setStickyTop] = useState(16)
  const lastScrollY = useRef(0)
  const accumulatedDelta = useRef(0)

  useEffect(() => {
    // Find the scrollable container (the overflow-y-auto div in GroupShell)
    const getScrollContainer = () => {
      // Look for the scrollable parent container
      let el = sidebarRef.current?.parentElement
      while (el) {
        const style = getComputedStyle(el)
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return el
        }
        el = el.parentElement
      }
      return null
    }

    const updateStickyPosition = (scrollContainer: HTMLElement | null) => {
      if (!sidebarRef.current || !wrapperRef.current) return

      const sidebarHeight = sidebarRef.current.offsetHeight
      const viewportHeight = window.innerHeight
      const navbarHeightStr = getComputedStyle(document.documentElement).getPropertyValue('--group-navbar-h').trim()
      const navbarHeight = navbarHeightStr ? parseFloat(navbarHeightStr) : 80
      
      // Available space below navbar
      const availableHeight = viewportHeight - navbarHeight
      
      // If sidebar fits in available viewport, just stick at top
      if (sidebarHeight <= availableHeight - 32) {
        setStickyTop(16)
        return
      }

      // Get scroll position from container or window
      const scrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY
      const scrollDelta = scrollY - lastScrollY.current
      lastScrollY.current = scrollY

      // Calculate the min and max top values
      // maxTop: sidebar top aligns with top of viewport (with padding)
      const maxTop = 16
      // minTop: sidebar bottom aligns with viewport bottom (negative value)
      const minTop = availableHeight - sidebarHeight - 16

      // Accumulate scroll delta
      accumulatedDelta.current -= scrollDelta

      // Clamp accumulated delta to valid range
      accumulatedDelta.current = Math.max(minTop, Math.min(maxTop, accumulatedDelta.current))

      setStickyTop(accumulatedDelta.current)
    }

    const scrollContainer = getScrollContainer()
    const handleScroll = () => updateStickyPosition(scrollContainer)

    // Initialize
    const initTimeout = setTimeout(() => {
      accumulatedDelta.current = 16
      updateStickyPosition(scrollContainer)
    }, 100)

    // Listen to the scroll container if found, otherwise window
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true })
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true })
    }
    window.addEventListener("resize", handleScroll, { passive: true })

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(handleScroll)
    })
    if (sidebarRef.current) {
      resizeObserver.observe(sidebarRef.current)
    }

    return () => {
      clearTimeout(initTimeout)
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      } else {
        window.removeEventListener("scroll", handleScroll)
      }
      window.removeEventListener("resize", handleScroll)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className="flex justify-center w-full">
      {/* Center - Posts Feed */}
      <div className="flex-1 max-w-[600px] border-x border-themeGray/30">
        <div className="flex flex-col gap-y-4 py-4 px-3">
          {children}
        </div>
      </div>

      {/* Right Sidebar - scroll-linked sticky behavior */}
      <div ref={wrapperRef} className="hidden lg:block w-[350px] shrink-0 pt-4 pl-4 pr-2">
        <div 
          ref={sidebarRef}
          className="sticky"
          style={{ top: `${stickyTop}px` }}
        >
          <div className="flex flex-col gap-4">
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  )
}
