import { z } from "zod"

export const TimelineStepSchema = z.object({
  date_period: z.string().trim().default(""),
  event_description: z.string().trim().default(""),
})

export const BranchingOptionSchema = z.object({
  option_text: z.string().trim().default(""),
  is_correct: z.boolean().optional().default(false),
  option_consequence: z.string().trim().optional().default(""),
})

export const BranchingNodeSchema = z.object({
  node_id: z.string().trim().default(""),
  decision_prompt: z.string().trim().default(""),
  options: z.array(BranchingOptionSchema).default([]),
})

export const CaseStudyFormSchema = z.object({
  title: z.string().optional().nullable(),
  block_title: z.string().optional().nullable(),
  background_md: z.string().optional().nullable(),
  analysis_md: z.string().optional().nullable(),
  decision_md: z.string().optional().nullable(),
  outcome_md: z.string().optional().nullable(),
  data_points: z.array(z.string().trim()).default([]),
  timeline_steps: z.array(TimelineStepSchema).default([]),
  learning_points: z.array(z.string().trim()).default([]),
  sebi_context: z.string().optional().nullable(),
  branching_points: z.array(BranchingNodeSchema).default([]),
})

export type CaseStudyFormValues = z.infer<typeof CaseStudyFormSchema>
export type CaseStudyFormInput = z.input<typeof CaseStudyFormSchema>
