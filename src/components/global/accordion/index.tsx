import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

type GlobalAccordionProps = {
  id: string
  title: React.ReactNode
  ref?: React.RefObject<HTMLButtonElement | null>
  onEdit?: () => void
  edit?: boolean
  editable?: React.ReactNode
  children: React.ReactNode
  itemClassName?: string
  triggerClassName?: string
  defaultOpen?: boolean
}

export const GlobalAccordion = ({
  id,
  title,
  children,
  ref,
  edit,
  onEdit,
  editable,
  itemClassName,
  triggerClassName,
  defaultOpen,
}: GlobalAccordionProps) => {
  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? id : undefined}>
      <AccordionItem className={cn("bg-none", itemClassName)} value={id}>
        <AccordionTrigger
          ref={ref}
          onDoubleClick={onEdit}
          className={cn("font-bold capitalize", triggerClassName)}
        >
          {edit ? editable : title}
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
