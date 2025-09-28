import { z } from "zod"

export const CreateChannelPostSchema = z.object({
  title: z.string(),
  content: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  htmlcontent: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  jsoncontent: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
})

export const MultiChannelPostSchema = z.object({
  payloads: z
    .array(
      z.object({
        locale: z.string(),
        title: z.string().optional(),
        content: z
          .string()
          .optional()
          .or(z.literal("").transform(() => undefined)),
        htmlcontent: z
          .string()
          .optional()
          .or(z.literal("").transform(() => undefined)),
        jsoncontent: z
          .string()
          .optional()
          .or(z.literal("").transform(() => undefined)),
      }),
    )
    .min(1),
})
