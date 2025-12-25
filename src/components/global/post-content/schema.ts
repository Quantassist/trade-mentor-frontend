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
        title: z.string().min(1, "Title is required"),
        content: z
          .string()
          .optional()
          .or(z.literal("").transform(() => undefined)),
        htmlcontent: z
          .string()
          .min(1, "Content is required"),
        jsoncontent: z
          .string()
          .optional()
          .or(z.literal("").transform(() => undefined)),
      }),
    )
    .min(1)
    .refine(
      (payloads) => payloads.some((p) => p.title && p.title.trim().length > 0 && p.htmlcontent && p.htmlcontent.trim().length > 0),
      { message: "At least one locale must have both title and content" }
    ),
})
