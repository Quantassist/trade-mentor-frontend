import { z } from "zod"

export const InteractiveRunnerSchema = z.object({
  code: z.string().min(1, { message: "Please paste component code" }),
  artifact_type: z.enum(["react", "html"]).default("react").optional(),
  allowed_libraries: z.array(z.string()).default([]).optional(),
  scope_config: z.any().optional(),
})

export type InteractiveRunnerValues = z.infer<typeof InteractiveRunnerSchema>
