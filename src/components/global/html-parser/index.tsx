"use client"

import { Skeleton } from "@/components/ui/skeleton"
import parse from "html-react-parser"
import { useEffect, useState } from "react"

type HtmlParserProps = {
  html: string
}

export const HtmlParser = ({ html }: HtmlParserProps) => {
  //use effect to avoid hydragtion error with ssr html data
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  return (
    <div className="html-parser [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl text-themeTextGray flex flex-col gap-y-3">
      {!mounted && <Skeleton className="h-[280px] w-full bg-[#202020]" />}
      {mounted && (
        <div className="parsed-html prose prose-lg dark:prose-invert max-w-full">
          {parse(html)}
        </div>
      )}
    </div>
  )
}
