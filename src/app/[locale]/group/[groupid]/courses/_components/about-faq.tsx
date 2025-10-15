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
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="rounded-xl overflow-hidden border border-themeGray/60 bg-[#161a20] mb-3"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline text-left text-white">
              {f.q || `FAQ ${i + 1}`}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm text-themeTextGray border-t border-themeGray/60">
              {f.a || ""}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
