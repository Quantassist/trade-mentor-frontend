// TODO: implement create section schema
import { z } from "zod"

export const SectionFormSchema = z.object({
  name: z.string().min(1, { message: "Please enter a section name" }),
  typeId: z.string().min(1, { message: "Please choose a section type" }),
})