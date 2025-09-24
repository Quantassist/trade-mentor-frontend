"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Image from "next/image"
import { JSX } from "react"

type SimpleModalProps = {
  trigger: JSX.Element
  children: React.ReactNode
  title?: string
  description?: string
  type?: "Integration"
  logo?: string
}

export const SimpleModal = ({
  children,
  trigger,
  title,
  description,
  type,
  logo,
}: SimpleModalProps) => {
  switch (type) {
    case "Integration":
      return (
        <Dialog modal={false}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent
            role="dialog"
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            className="bg-themeBlack border-themeDarkGray"
          >
            <div className="flex justify-center gap-3">
              <div className="w-12 h-12 relative">
                <Image
                  src={`https://ucarecdn.com/2c9bd4ab-1f00-41df-bad2-df668f65a232`}
                  alt="logo"
                  fill
                  // className="object-contain"
                />
              </div>
              <div className="text-grapy-400">
                <ArrowLeft size={20} />
                <ArrowRight size={20} />
              </div>
              <div className="w-12 h-12 relative">
                <Image
                  src={`https://ucarecdn.com/${logo}`}
                  alt="stripe"
                  fill
                  // className="object-contain"
                />
              </div>
            </div>
            <DialogHeader className="flex items-center">
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription className="text-center">
                {description}
              </DialogDescription>
            </DialogHeader>
            <VisuallyHidden>
              <DialogTitle>{title}</DialogTitle>
              {/* <DialogDescription>{description}</DialogDescription> */}
            </VisuallyHidden>
            {children}
          </DialogContent>
        </Dialog>
      )
    default:
      return (
        <Dialog modal={false}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent
            role="dialog"
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            className="bg-[#1C1C1E] !max-w-2xl border-themeDarkGray"
          >
            <DialogHeader>
              <VisuallyHidden>
                <DialogTitle>{title}</DialogTitle>
              </VisuallyHidden>
            </DialogHeader>
            {children}
          </DialogContent>
        </Dialog>
      )
  }
}
