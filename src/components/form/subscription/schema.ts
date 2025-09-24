import { z } from "zod"

export const CreateGroupSubscriptionSchema = z.object({
  price: z.string().min(1, "Price must be at least 1"),
})
