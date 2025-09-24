import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type GlobalAccordionProps = {
  id: string
  title: string
  ref?: React.RefObject<HTMLButtonElement | null>
  onEdit?: () => void
  edit?: boolean
  editable?: React.ReactNode
  children: React.ReactNode
}

export const GlobalAccordion = ({
  id,
  title,
  children,
  ref,
  edit,
  onEdit,
  editable,
}: GlobalAccordionProps) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem className="bg-none" value={id}>
        <AccordionTrigger
          ref={ref}
          onDoubleClick={onEdit}
          className="font-bold capitalize"
        >
          {edit ? editable : title}
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
