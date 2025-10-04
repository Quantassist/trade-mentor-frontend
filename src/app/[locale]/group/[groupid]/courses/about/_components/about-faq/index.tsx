"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function AboutFaq() {
  const faqs = [
    { q: "What will the attendees achieve from the course?", a: "A structured path to understand markets, manage risk and build confidence to trade." },
    { q: "What are the prerequisites for this course?", a: "No prior experience required. Basic understanding of finance helps but is not mandatory." },
  ]
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
      <Accordion type="single" collapsible>
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-themeGray rounded-xl px-4">
            <AccordionTrigger className="py-4 hover:no-underline text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="pb-4 text-sm text-themeTextGray">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
