"use client"

import { useLayoutEffect, useRef } from "react"

type Props = { children: React.ReactNode }

export default function ClientNavbarWrapper({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const setVar = () => {
      const h = ref.current?.offsetHeight ?? 0
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--group-navbar-h", `${h}px`)
      }
    }
    setVar()
    const ro = new ResizeObserver(() => setVar())
    if (ref.current) ro.observe(ref.current)
    window.addEventListener("resize", setVar)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", setVar)
    }
  }, [])

  return (
    <div ref={ref} className="sticky top-0 z-40">
      {children}
    </div>
  )
}
