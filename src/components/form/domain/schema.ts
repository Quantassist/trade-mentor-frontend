import { z } from "zod"

export const AddCustomDomainSchema = z.object({
  domain: z
    .string()
    .min(1, "You must enter a domain")
    .max(255, "Domain must be less than 255 characters"),
})
