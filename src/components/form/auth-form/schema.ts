import { z } from "zod"

// Password validation with production-grade checks
const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(128, { message: "Password cannot exceed 128 characters" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })

// Email validation
const emailSchema = z
  .string()
  .min(1, { message: "Email is required" })
  .email({ message: "Please enter a valid email address" })
  .max(255, { message: "Email cannot exceed 255 characters" })

// Sign In Schema
export const SignInFormSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(128, { message: "Password cannot exceed 128 characters" }),
})

// Sign Up Schema
export const SignUpFormSchema = z.object({
  firstname: z
    .string()
    .min(1, { message: "First name is required" })
    .min(2, { message: "First name must be at least 2 characters" })
    .max(50, { message: "First name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "First name can only contain letters, spaces, hyphens, and apostrophes" }),
  lastname: z
    .string()
    .min(1, { message: "Last name is required" })
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(50, { message: "Last name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Last name can only contain letters, spaces, hyphens, and apostrophes" }),
  email: emailSchema,
  password: passwordSchema,
})

// Forgot Password Schema
export const ForgotPasswordFormSchema = z.object({
  email: emailSchema,
})

// Reset Password Schema
export const ResetPasswordFormSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

// Type exports
export type SignInFormValues = z.infer<typeof SignInFormSchema>
export type SignUpFormValues = z.infer<typeof SignUpFormSchema>
export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordFormSchema>
export type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>
