"use client"

import React, { useEffect, useLayoutEffect, useRef } from "react"

export default function ClientNavbarWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)

  // Set CSS var for navbar height on :root
  const setVar = () => {
    const h = ref.current?.offsetHeight || 0
    if (h > 0) {
      document.documentElement.style.setProperty("--group-navbar-h", `${h}px`)
    }
  }

  useLayoutEffect(() => {
    setVar()
    if (!ref.current) return

    // Prefer ResizeObserver when available
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => setVar())
      ro.observe(ref.current)
    } else {
      const onResize = () => setVar()
      window.addEventListener("resize", onResize)
      return () => window.removeEventListener("resize", onResize)
    }
    return () => {
      if (ro && ref.current) ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Also re-apply after mount in case fonts cause reflow
  useEffect(() => {
    const t = setTimeout(setVar, 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div ref={ref} className="sticky top-0 z-30 w-full max-w-full overflow-x-hidden bg-[#101011] rounded-tl-xl">
      {children}
    </div>
  )
}
