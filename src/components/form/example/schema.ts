import { z } from "zod"

export const QAPairSchema = z.object({
  question: z.string().trim().optional().default(""),
  answer: z.string().trim().optional().default(""),
})

export const ExampleFormSchema = z.object({
  scenario_title: z.string().optional().nullable(),
  scenario_md: z.string().optional().nullable(),
  qa_pairs: z.array(QAPairSchema).default([]),
  tips_md: z.string().optional().nullable(),
  takeaways: z.array(z.string().trim()).default([]),
  indian_context: z.boolean().optional().default(false),
})

export type ExampleFormValues = z.infer<typeof ExampleFormSchema>
