import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type GlassSheetProps = {
  children: React.ReactNode
  trigger: React.ReactNode
  className?: string
  triggerClass?: string
}

export const GlassSheet = ({
  children,
  trigger,
  className,
  triggerClass,
}: GlassSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger className={cn(triggerClass)} asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent
        className={cn(
          // wider sheet on small screens to fit sidebar; no internal scroll
          "w-[95vw] max-w-[420px] sm:max-w-[460px] p-4 overflow-y-visible",
          "bg-clip-padding backdrop-filter backdrop--blur__safari backdrop-blur-3xl bg-opacity-20 bg-white dark:bg-themeGray border-slate-200 dark:border-themeGray",
          className,
        )}
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  )
}
