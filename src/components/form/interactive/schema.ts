import { z } from "zod"

export const InteractiveFormSchema = z.object({
  html_content: z.string().trim(),
})

export type InteractiveFormValues = z.infer<typeof InteractiveFormSchema>
