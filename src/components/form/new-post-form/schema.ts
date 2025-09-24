import { z } from "zod"

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 2 // 2MB
export const ACCEPTED_FILE_TYPES = ["image/png", "image/jpg", "image/jpeg"]

export const NewPostSchema = z.object({
  channelId: z.string().min(1, { message: "You must select a channel" }),
  htmldescription: z
    .string()
    .min(8, {
      message: "Post cannot be empty",
    })
    .or(z.literal("").transform(() => undefined)),
  jsondescription: z
    .string()
    .min(1, {
      message: "Post cannot be empty",
    })
    .optional()
    .or(z.literal("").transform(() => undefined)),
})
