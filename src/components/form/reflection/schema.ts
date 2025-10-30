import { z } from "zod"

export const ReflectionFormSchema = z.object({
  reflection_type: z.string().trim().optional().default("short"),
  prompt_md: z.string().trim().optional().default(""),
  guidance_md: z.string().trim().optional().default(""),
  sample_responses: z.array(z.string().trim()).default([]),
  min_chars: z.number().int().min(0).optional().default(100),
})

export type ReflectionFormValues = z.infer<typeof ReflectionFormSchema>
