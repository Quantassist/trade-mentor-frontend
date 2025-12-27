"use client"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { JSX } from "react"

type DropDownProps = {
  title: string
  trigger: JSX.Element
  children: React.ReactNode
  ref?: React.RefObject<HTMLButtonElement>
  headerLeft?: React.ReactNode
  footer?: React.ReactNode
}

export const DropDown = ({ trigger, title, children, ref, headerLeft, footer }: DropDownProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild ref={ref}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="rounded-2xl w-64 items-start bg-[#1e2329] border-themeGray/60 p-4 shadow-xl">
        <div className="flex items-center gap-2">
          {headerLeft}
          <h4 className="text-sm pl-3 text-themeTextGray">{title}</h4>
        </div>
        <Separator className="bg-themeGray/40 my-3" />
        {children}
        {footer && (
          <>
            <Separator className="bg-themeGray/40 my-3" />
            {footer}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
