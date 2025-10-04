import { z } from "zod"

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 2 // 2MB
export const ACCEPTED_FILE_TYPES = ["image/png", "image/jpg", "image/jpeg"]

export const CreateCourseSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Course title must be alteast 3 characters" }),
  description: z.string().min(100, "description must be atleast 100 words"),
  level: z.string().min(1, { message: "Please select a level" }),
  learnOutcomes: z
    .array(z.string().min(1, "Outcome cannot be empty"))
    .min(1, { message: "Add at least one learning outcome" }),
  faqs: z.array(
    z.object({
      question: z.string().min(1, "Question is required"),
      answer: z.string().min(1, "Answer is required"),
    }),
  ).default([]),
  mentorId: z.string().uuid({ message: "Invalid mentor id" }).nullable().optional().default(null),
  translations: z
    .array(
      z.object({
        locale: z.string().min(1),
        name: z.string().optional(),
        description: z.string().optional(),
        learnOutcomes: z.array(z.string()).optional(),
        faqs: z
          .array(
            z.object({
              question: z.string().optional().default(""),
              answer: z.string().optional().default(""),
            }),
          )
          .optional(),
      }),
    )
    .default([]),
  image: z
    .any()
    .refine((files: any) => files && files.length > 0, {
      message: "You must add an image",
    })
    .refine((files: any) => files?.[0]?.size <= MAX_UPLOAD_SIZE, {
      message: "Your file size must be less then 2MB",
    })
    .refine((files: any) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type), {
      message: "Only JPG, JPEG & PNG are accepted file formats",
    }),
  privacy: z.string().min(1, { message: "You need to pick a privacy setting" }),
  published: z.boolean(),
})
