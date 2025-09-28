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
}

export const DropDown = ({ trigger, title, children, ref }: DropDownProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild ref={ref}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="rounded-2xl w-56 items-start bg-[#1A1A1D] border-themeGray p-4">
        <h4 className="text-sm pl-3">{title}</h4>
        <Separator className="bg-themeGray my-3" />
        {children}
      </PopoverContent>
    </Popover>
  )
}
