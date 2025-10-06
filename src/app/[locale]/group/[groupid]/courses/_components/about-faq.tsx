"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function AboutFaq({ faqs }: { faqs: { question?: string; answer?: string }[] }) {
  const items = Array.isArray(faqs)
    ? faqs
        .map((f) => ({ q: (f?.question || "").trim(), a: (f?.answer || "").trim() }))
        .filter((f) => f.q || f.a)
    : []
  if (items.length === 0) return null
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
      <Accordion type="single" collapsible>
        {items.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-themeGray rounded-xl px-4">
            <AccordionTrigger className="py-4 hover:no-underline text-left">{f.q || `FAQ ${i + 1}`}</AccordionTrigger>
            <AccordionContent className="pb-4 text-sm text-themeTextGray">{f.a || ""}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
