import { z } from "zod"

export const QAPairSchema = z.object({
  question: z.string().trim().optional().default(""),
  answer: z.string().trim().optional().default(""),
})

export const PersonaSchema = z.object({
  name: z.string().trim().default(""),
  age: z.coerce.number().int().nonnegative().default(0),
  occupation: z.string().trim().optional().default(""),
  financial_goal: z.string().trim().optional().default(""),
})

export const FinancialContextSchema = z.object({
  time_horizon: z.string().trim().optional().default(""),
  risk_tolerance: z.string().trim().optional().default(""),
  available_amount: z.string().trim().optional().default(""),
  current_situation: z.string().trim().optional().default(""),
})

export const ExampleFormSchema = z.object({
  block_title: z.string().optional().nullable(),
  scenario_md: z.string().optional().nullable(),
  persona: z.array(PersonaSchema).default([]),
  qa_pairs: z.array(QAPairSchema).default([]),
  financial_context: FinancialContextSchema.default({
    time_horizon: "",
    risk_tolerance: "",
    available_amount: "",
    current_situation: "",
  }),
})

export type ExampleFormValues = z.infer<typeof ExampleFormSchema>
export type ExampleFormInput = z.input<typeof ExampleFormSchema>
