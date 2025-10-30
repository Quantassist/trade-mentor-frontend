"use client"

import { Skeleton } from "@/components/ui/skeleton"
import parse from "html-react-parser"
import Image from "next/image"
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

  const content = mounted
    ? parse(html, {
        replace: (node: any) => {
          if (node?.type === "tag" && node?.name === "img") {
            const attrs = node.attribs || {}
            const src: string = attrs.src || ""
            const alt: string = attrs.alt || ""
            const dw: string | undefined = attrs["data-w"]
            const dh: string | undefined = attrs["data-h"]
            const width = dw ? parseInt(dw, 10) : undefined
            const height = dh ? parseInt(dh, 10) : undefined

            if (width && height) {
              return (
                <span className="block my-4">
                  <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    sizes="(min-width: 1024px) 800px, 100vw"
                    className="h-auto w-full rounded-lg border border-themeGray/60"
                  />
                </span>
              )
            }

            return (
              <span className="block relative w-full my-4" style={{ aspectRatio: "16 / 9" }}>
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="100vw"
                  className="object-contain rounded-lg border border-themeGray/60"
                />
              </span>
            )
          }
          return undefined
        },
      })
    : null

  return (
    <div className="html-parser [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl text-themeTextGray flex flex-col gap-y-3">
      {!mounted && <Skeleton className="h-[280px] w-full bg-[#202020]" />}
      {mounted && (
        <div className="parsed-html prose prose-lg dark:prose-invert max-w-full [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1">
          {content}
        </div>
      )}
    </div>
  )
}
