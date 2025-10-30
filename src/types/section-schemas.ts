import { z } from "zod"

export const quizChoiceSchema = z.object({
  text_md: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  correct: z.boolean().optional().default(false),
  explanation_md: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
})

export const quizQuestionSchema = z.object({
  prompt_md: z.string().optional().nullable(),
  stem: z.string().optional().nullable(),
  choices: z.array(quizChoiceSchema).min(2).default([]),
  rationale: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  anchor_ids: z.array(z.string()).optional().default([]),
})

export const quizSchema = z.object({
  block_title: z.string().optional().nullable(),
  quiz_type: z.string().optional().nullable(),
  pass_threshold: z.number().min(0).max(100).optional().default(70),
  items: z.array(quizQuestionSchema).min(0).default([]),
})

export const reflectionSchema = z.object({
  block_title: z.string().optional().nullable(),
  reflection_type: z.string().optional().nullable(),
  prompt_md: z.string().optional().nullable(),
  guidance_md: z.string().optional().nullable(),
  sample_responses: z.array(z.string()).optional().default([]),
  min_chars: z.number().int().positive().optional().default(100),
})

export const caseStudySchema = z.object({
  background_md: z.string().optional().nullable(),
  analysis_md: z.string().optional().nullable(),
  decision_md: z.string().optional().nullable(),
  outcome_md: z.string().optional().nullable(),
  data_points: z.array(z.string()).optional().default([]),
  timeline_steps: z.array(z.string()).optional().default([]),
  learning_points: z.array(z.string()).optional().default([]),
  sebi_context: z.string().optional().nullable(),
})

export const exampleSchema = z.object({
  scenario_title: z.string().optional().nullable(),
  scenario_md: z.string().optional().nullable(),
  qa_pairs: z.array(
    z.object({
      question: z.string().trim().optional().default(""),
      answer: z.string().trim().optional().default(""),
    })
  ).optional().default([]),
  tips_md: z.string().optional().nullable(),
  takeaways: z.array(z.string().trim()).optional().default([]),
  indian_context: z.boolean().optional().default(false),
})

export type QuizPayloadInput = z.infer<typeof quizSchema>
export type ReflectionPayloadInput = z.infer<typeof reflectionSchema>

export const sectionTypeSchemaMap: Record<string, z.ZodTypeAny> = {
  quiz: quizSchema,
  reflection: reflectionSchema,
  case_study: caseStudySchema,
  example: exampleSchema,
}
