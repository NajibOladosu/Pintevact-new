"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
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
