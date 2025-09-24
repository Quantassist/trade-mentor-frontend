import { z } from "zod"

export const EditGroupChannelSchema = z.object({
  name: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  icon: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
})
