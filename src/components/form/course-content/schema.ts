import { z } from "zod"

export const CourseContentSchema = z.object({
  content: z
    .string()
    // .min(100, {
    //   message: "description must have atleast 100 characters",
    // })
    .optional()
    .or(z.literal("").transform(() => undefined)),

  htmlContent: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),

  jsoncontent: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
})
