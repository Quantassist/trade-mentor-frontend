import { z } from "zod"

export const UserProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  image: z.string().optional(),
})

export type UserProfileFormData = z.infer<typeof UserProfileSchema>
