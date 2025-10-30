import { z } from "zod"

export const QuizChoiceFormSchema = z.object({
  text: z.string().trim().optional().default(""),
  correct: z.boolean().optional().default(false),
  explanation: z.string().trim().optional().default(""),
})

export const QuizItemFormSchema = z.object({
  stem: z.string().trim().optional().default(""),
  choices: z.array(QuizChoiceFormSchema).default([]),
  rationale: z.string().trim().optional().default(""),
  difficulty: z.string().trim().optional().default(""),
  anchor_ids: z.array(z.string().trim()).default([]),
})

export const QuizFormSchema = z.object({
  title: z.string().trim().optional().default(""),
  quiz_type: z.string().trim().optional().default("mcq"),
  pass_threshold: z.number().int().min(0).max(100).optional().default(70),
  items: z.array(QuizItemFormSchema).default([]),
})

export type QuizFormValues = z.infer<typeof QuizFormSchema>
