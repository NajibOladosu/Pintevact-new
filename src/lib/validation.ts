import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[a-zA-Z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Tell us what to call you").max(80),
  email: emailSchema,
  password: passwordSchema,
  terms: z.literal("on", { message: "Please accept the terms to continue" }),
  next: z.string().optional(),
});

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

export const contactTopics = ["general", "courses", "billing", "teams", "press"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: emailSchema,
  topic: z.enum(contactTopics).default("general"),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(4000),
  company: z.string().max(0, "Spam detected").optional().default(""), // honeypot
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Name is too short").max(80),
  headline: z.string().trim().max(120).optional().default(""),
  emailOptIn: z.boolean().default(false),
});

export const noteSchema = z.object({
  lessonId: z.string().uuid(),
  atSeconds: z.number().min(0).max(60 * 60 * 6),
  body: z.string().trim().min(1, "Note is empty").max(2000),
});

export const responseSchema = z.object({
  interactionId: z.string().uuid(),
  optionId: z.string().max(20).optional(),
  text: z.string().max(5000).optional(),
  value: z.number().min(-1000).max(1000).optional(),
  acknowledged: z.boolean().optional(),
});

export const progressSchema = z.object({
  lessonId: z.string().uuid(),
  position: z.number().min(0).max(60 * 60 * 6),
  watched: z.number().min(0).max(60 * 60 * 6),
});

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
