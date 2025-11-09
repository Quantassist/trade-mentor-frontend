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
  block_title: z.string().optional().nullable(),
  background_md: z.string().optional().nullable(),
  analysis_md: z.string().optional().nullable(),
  decision_md: z.string().optional().nullable(),
  outcome_md: z.string().optional().nullable(),
  data_points: z.array(z.string()).optional().default([]),
  timeline_steps: z
    .array(
      z.object({
        date_period: z.string().trim(),
        event_description: z.string().trim(),
      }),
    )
    .optional()
    .default([]),
  learning_points: z.array(z.string()).optional().default([]),
  sebi_context: z.string().optional().nullable(),
  branching_points: z
    .array(
      z.object({
        node_id: z.string().trim(),
        decision_prompt: z.string().trim(),
        options: z.array(
          z.object({
            is_correct: z.boolean().optional().default(false),
            option_text: z.string().trim(),
            option_consequence: z.string().trim().optional().default(""),
          }),
        ).default([]),
      }),
    )
    .optional()
    .default([]),
})

export const exampleSchema = z.object({
  block_title: z.string().optional().nullable(),
  scenario_md: z.string().optional().nullable(),
  persona: z
    .array(
      z.object({
        name: z.string().trim(),
        age: z.number().int().nonnegative(),
        occupation: z.string().trim().optional().default(""),
        financial_goal: z.string().trim().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  qa_pairs: z
    .array(
      z.object({
        question: z.string().trim().optional().default(""),
        answer: z.string().trim().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  image_prompts: z.array(z.string()).optional().default([]),
  financial_context: z
    .object({
      time_horizon: z.string().trim().optional().default(""),
      risk_tolerance: z.string().trim().optional().default(""),
      available_amount: z.string().trim().optional().default(""),
      current_situation: z.string().trim().optional().default(""),
    })
    .optional()
    .default({
      time_horizon: "",
      risk_tolerance: "",
      available_amount: "",
      current_situation: "",
    }),
})

export type QuizPayloadInput = z.infer<typeof quizSchema>
export type ReflectionPayloadInput = z.infer<typeof reflectionSchema>

export const sectionTypeSchemaMap: Record<string, z.ZodTypeAny> = {
  quiz: quizSchema,
  reflection: reflectionSchema,
  case_study: caseStudySchema,
  example: exampleSchema,
}
