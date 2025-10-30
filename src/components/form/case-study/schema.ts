import { z } from "zod"

export const CaseStudyFormSchema = z.object({
  title: z.string().optional().nullable(),
  background_md: z.string().optional().nullable(),
  analysis_md: z.string().optional().nullable(),
  decision_md: z.string().optional().nullable(),
  outcome_md: z.string().optional().nullable(),
  data_points: z.array(z.string().trim()).default([]),
  timeline_steps: z.array(z.string().trim()).default([]),
  learning_points: z.array(z.string().trim()).default([]),
  sebi_context: z.string().optional().nullable(),
})

export type CaseStudyFormValues = z.infer<typeof CaseStudyFormSchema>
export type CaseStudyFormInput = z.input<typeof CaseStudyFormSchema>
