import { z } from "zod"

export const CreateEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  eventType: z.enum(["LIVE_CLASS", "WEBINAR", "WORKSHOP", "QA_SESSION", "MEETUP", "OTHER"]),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string(),
  location: z.string().optional(),
  meetingUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  maxAttendees: z.string().optional(),
})

export type CreateEventFormValues = z.infer<typeof CreateEventSchema>
