"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { sendAnnouncement, sendNewsletterIssue, sendNewsletterTest } from "@/lib/newsletter";
import { notify } from "@/lib/notifications";
import { fieldErrors, type FormState } from "@/lib/validation";

const courseSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(300),
  description: z.string().trim().max(5000),
  category: z.string().trim().min(2).max(40),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  priceCents: z.coerce.number().int().min(0).max(1_000_000),
  stripePriceId: z
    .string()
    .trim()
    .max(100)
    .transform((v) => v || null),
  theme: z.enum(["ember", "iris", "lucid", "tide", "sun", "blush"]),
  published: z.boolean(),
  featured: z.boolean(),
});

export async function saveCourse(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = courseSchema.safeParse({ ...raw, priceCents: Math.round(Number(raw.price ?? 0) * 100), published: raw.published === "on", featured: raw.featured === "on" });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const { courseId, ...patch } = parsed.data;
  await getStore().adminUpdateCourse(courseId, patch);
  revalidatePath("/", "layout");
  return { ok: true, message: "Course saved." };
}

const lessonSchema = z.object({
  lessonId: z.string().uuid(),
  title: z.string().trim().min(2).max(160),
  summary: z.string().trim().max(600),
  durationSeconds: z.coerce.number().int().min(1).max(60 * 60 * 6),
  bunnyVideoId: z
    .string()
    .trim()
    .max(64)
    .regex(/^[a-zA-Z0-9-]*$/, "Use the Bunny video GUID")
    .transform((v) => v || null),
  isPreview: z.boolean(),
});

export async function saveLesson(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const minutes = Number(raw.durationMinutes ?? 0);
  const parsed = lessonSchema.safeParse({ ...raw, durationSeconds: Math.round(minutes * 60), isPreview: raw.isPreview === "on" });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const { lessonId, ...patch } = parsed.data;
  await getStore().adminUpdateLesson(lessonId, patch);
  revalidatePath("/", "layout");
  return { ok: true, message: "Lesson saved." };
}

export async function setUserRole(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId"));
  const role = formData.get("role") === "admin" ? "admin" : "student";
  if (userId === admin.id && role !== "admin") return; // never demote yourself
  await getStore().adminSetRole(userId, role);
  revalidatePath("/admin/users");
}

/** Blank-line separated text → paragraphs. */
const paragraphs = z
  .string()
  .trim()
  .min(1, "Write at least one paragraph")
  .max(10_000)
  .transform((v) => v.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean));

const optionalCta = (label: string | undefined, href: string | undefined) => (label?.trim() && href?.trim() ? { label: label.trim(), href: href.trim() } : undefined);
const ctaHref = z
  .string()
  .trim()
  .max(500)
  .refine((v) => !v || v.startsWith("/") || /^https:\/\//.test(v), "Use a path like /courses or an https:// link")
  .optional();

const issueSchema = z.object({
  subject: z.string().trim().min(3, "Add a subject line").max(150),
  title: z.string().trim().min(3, "Add a headline").max(160),
  idea: paragraphs,
  experiment: z.string().trim().min(3, "Add this week's experiment").max(1000),
  question: z.string().trim().max(400).optional(),
  ctaLabel: z.string().trim().max(60).optional(),
  ctaHref,
});

export async function sendNewsletter(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = issueSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: raw };
  const { subject, title, idea, experiment, question, ctaLabel, ctaHref: href } = parsed.data;
  const content = { title, idea, experiment, question: question || undefined, cta: optionalCta(ctaLabel, href) };

  if (raw.intent === "test") {
    const res = await sendNewsletterTest(admin.profile.email, subject, content);
    return res.ok ? { ok: true, message: `Test sent to ${admin.profile.email}.`, values: raw } : { message: `Test failed: ${res.error}`, values: raw };
  }
  const result = await sendNewsletterIssue(subject, content, admin.id);
  revalidatePath("/admin/emails");
  if (!result.sent && result.failed) return { message: `Issue ${result.issue} failed: ${result.errors[0]}`, values: raw };
  const failed = result.failed ? `, ${result.failed} failed` : "";
  return { ok: true, message: `Issue ${result.issue} sent to ${result.sent} ${result.sent === 1 ? "subscriber" : "subscribers"}${failed}.` };
}

const announcementSchema = z.object({
  subject: z.string().trim().min(3, "Add a subject line").max(150),
  eyebrow: z.string().trim().min(2, "Add a short label").max(40),
  title: z.string().trim().min(3, "Add a headline").max(160),
  body: paragraphs,
  ctaLabel: z.string().trim().max(60).optional(),
  ctaHref,
});

export async function sendLearnerAnnouncement(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = announcementSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: raw };
  const { subject, eyebrow, title, body, ctaLabel, ctaHref: href } = parsed.data;
  const content = { eyebrow, title, body, cta: optionalCta(ctaLabel, href) };

  if (raw.intent === "test") {
    const res = await notify.announcement([{ id: admin.id, email: admin.profile.email, name: admin.profile.fullName }], content, { subject: `[Test] ${subject}` });
    return res.sent ? { ok: true, message: `Test sent to ${admin.profile.email}.`, values: raw } : { message: `Test failed: ${res.errors[0]}`, values: raw };
  }
  const result = await sendAnnouncement(subject, content);
  if (!result.sent && result.failed) return { message: `Announcement failed: ${result.errors[0]}`, values: raw };
  const failed = result.failed ? `, ${result.failed} failed` : "";
  return { ok: true, message: `Announcement sent to ${result.sent} ${result.sent === 1 ? "learner" : "learners"}${failed}.` };
}
