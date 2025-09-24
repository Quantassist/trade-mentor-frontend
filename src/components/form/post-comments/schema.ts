import { z } from "zod"

export const CreateCommentSchema = z.object({
  comment: z
    .string()
    .min(1, "Comment must have at least 1 character")
    .max(255, "Comment is too long"),
})
