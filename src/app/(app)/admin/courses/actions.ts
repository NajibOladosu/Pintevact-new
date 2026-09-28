"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { attempt, refreshCatalog, type ActionResult } from "@/lib/admin/action";
import { audit } from "@/lib/admin/audit";
import * as catalog from "@/lib/admin/catalog";
import { courseDetailsSchema, interactionSchema, layoutSchema, lessonDetailsSchema, newCourseSchema, type InteractionInput } from "@/lib/admin/schemas";
import { getBunnyVideo, BUNNY_STATUS } from "@/lib/bunny";
import { fieldErrors, type FormState } from "@/lib/validation";

const uuid = z.string().uuid();
const title = z.string().trim().min(1, "Give it a name").max(160);

/* ─── Courses ──────────────────────────────────────────────────────── */

export async function createCourse(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = newCourseSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const course = await catalog.createCourse(parsed.data.title);
  await audit(admin.id, "created", "course", course.id, parsed.data.title);
  refreshCatalog();
  redirect(`/admin/courses/${course.slug}?created=1`);
}

export async function saveCourseDetails(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = courseDetailsSchema.safeParse({
    ...raw,
    priceCents: Math.round(Number(raw.price || 0) * 100),
    published: raw.published === "on",
    featured: raw.featured === "on",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const before = await catalog.getCourseById(parsed.data.courseId);
  if (!before) return { message: "This course no longer exists." };
  const res = await attempt(async () => {
    if (parsed.data.published && !before.published) await catalog.setCoursePublished(parsed.data.courseId, true);
    await catalog.updateCourseDetails(parsed.data);
  });
  if (!res.ok) return { message: res.error, errors: res.errors };
  await audit(admin.id, "edited", "course", parsed.data.courseId, parsed.data.title);
  refreshCatalog();
  if (before.slug !== parsed.data.slug) redirect(`/admin/courses/${parsed.data.slug}?saved=1`);
  return { ok: true, message: "Course saved." };
}

export async function setPublished(courseId: string, published: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => catalog.setCoursePublished(uuid.parse(courseId), published), published ? "Published. It's live on the site." : "Unpublished. Only admins can see it now.");
  if (res.ok) {
    await audit(admin.id, published ? "published" : "unpublished", "course", courseId, "");
    refreshCatalog();
  }
  return res;
}

export async function duplicateCourse(courseId: string): Promise<ActionResult<{ slug: string }>> {
  const admin = await requireAdmin();
  const res = await attempt(() => catalog.duplicateCourse(uuid.parse(courseId)));
  if (!res.ok) return res;
  await audit(admin.id, "duplicated", "course", res.data!.id, res.data!.title);
  refreshCatalog();
  return { ok: true, message: `Created ${res.data!.title} as a draft.`, data: { slug: res.data!.slug } };
}

export async function deleteCourse(courseId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const course = await catalog.getCourseById(uuid.parse(courseId));
  const res = await attempt(() => catalog.deleteCourse(courseId), "Course deleted.");
  if (res.ok) {
    await audit(admin.id, "deleted", "course", courseId, course?.title ?? "");
    refreshCatalog();
  }
  return res;
}

export async function reorderCourses(ids: string[]): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => catalog.reorderCourses(z.array(uuid).min(1).parse(ids)), "Order saved.");
  if (res.ok) {
    await audit(admin.id, "reordered", "course", null, "Catalogue order");
    refreshCatalog();
  }
  return res;
}

export async function uploadCover(courseId: string, formData: FormData): Promise<ActionResult<{ url: string }>> {
  const admin = await requireAdmin();
  const file = formData.get("cover");
  if (!(file instanceof File) || !file.size) return { ok: false, error: "Choose an image first" };
  const res = await attempt(async () => ({ url: await catalog.uploadCourseCover(uuid.parse(courseId), file) }), "Cover updated.");
  if (res.ok) {
    await audit(admin.id, "changed cover", "course", courseId, file.name);
    refreshCatalog();
  }
  return res;
}

export async function removeCover(courseId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => catalog.removeCourseCover(uuid.parse(courseId)), "Cover removed. The course uses its papercut artwork again.");
  if (res.ok) {
    await audit(admin.id, "removed cover", "course", courseId, "");
    refreshCatalog();
  }
  return res;
}

/* ─── Curriculum ───────────────────────────────────────────────────── */

export async function saveCurriculumOrder(courseId: string, layout: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => catalog.reorderCurriculum(uuid.parse(courseId), layoutSchema.parse(layout)), "Order saved.");
  if (res.ok) {
    await audit(admin.id, "reordered", "course", courseId, "Lessons and modules");
    refreshCatalog();
  }
  return res;
}

export async function addModule(courseId: string, name: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(async () => (await catalog.addModule(uuid.parse(courseId), title.parse(name))).id, "Module added.");
  if (res.ok) {
    await audit(admin.id, "added", "module", String(res.data), name);
    refreshCatalog();
  }
  return { ...res, data: undefined } as ActionResult;
}

export async function renameModule(moduleId: string, name: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => catalog.renameModule(uuid.parse(moduleId), title.parse(name)), "Module renamed.");
  if (res.ok) {
    await audit(admin.id, "renamed", "module", moduleId, name);
    refreshCatalog();
  }
  return res;
}

export async function deleteModule(moduleId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => catalog.deleteModule(uuid.parse(moduleId)), "Module deleted.");
  if (res.ok) {
    await audit(admin.id, "deleted", "module", moduleId, "");
    refreshCatalog();
  }
  return res;
}

export async function addLesson(moduleId: string, name: string): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const res = await attempt(() => catalog.addLesson(uuid.parse(moduleId), title.parse(name)), "Lesson added.");
  if (!res.ok) return res;
  await audit(admin.id, "added", "lesson", res.data!.id, name);
  refreshCatalog();
  return { ok: true, message: res.message, data: { id: res.data!.id } };
}

export async function duplicateLesson(lessonId: string): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const res = await attempt(() => catalog.duplicateLesson(uuid.parse(lessonId)), "Lesson duplicated.");
  if (!res.ok) return res;
  await audit(admin.id, "duplicated", "lesson", res.data!.id, "");
  refreshCatalog();
  return { ok: true, message: res.message, data: { id: res.data!.id } };
}

export async function deleteLesson(lessonId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => catalog.deleteLesson(uuid.parse(lessonId)), "Lesson deleted.");
  if (res.ok) {
    await audit(admin.id, "deleted", "lesson", lessonId, "");
    refreshCatalog();
  }
  return { ...res, data: undefined } as ActionResult;
}

/* ─── Lesson editor ────────────────────────────────────────────────── */

export async function saveLessonDetails(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = lessonDetailsSchema.safeParse({
    ...raw,
    durationSeconds: Math.round(Number(raw.durationMinutes || 0) * 60),
    isPreview: raw.isPreview === "on",
  });
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if (errors.durationSeconds) errors.durationMinutes = errors.durationSeconds;
    return { errors, message: "Check the highlighted fields." };
  }
  const res = await attempt(() => catalog.updateLessonDetails(parsed.data));
  if (!res.ok) return { message: res.error };
  await audit(admin.id, "edited", "lesson", parsed.data.lessonId, parsed.data.title);
  refreshCatalog();
  return { ok: true, message: "Lesson saved." };
}

/** Attaches a Stream library video; the lesson takes the video's length once Bunny has encoded it. */
export async function attachVideo(lessonId: string, videoId: string | null): Promise<ActionResult<{ durationSeconds?: number }>> {
  const admin = await requireAdmin();
  const res = await attempt(async () => {
    const id = uuid.parse(lessonId);
    if (!videoId) {
      await catalog.setLessonVideo(id, null);
      return {};
    }
    const guid = z.string().regex(/^[a-zA-Z0-9-]{1,64}$/).parse(videoId);
    const video = await getBunnyVideo(guid).catch(() => null);
    const length = video && BUNNY_STATUS[video.status]?.ready ? video.length : undefined;
    await catalog.setLessonVideo(id, guid, length);
    return { durationSeconds: length };
  }, videoId ? "Video attached." : "Video removed from the lesson.");
  if (res.ok) {
    await audit(admin.id, videoId ? "attached video" : "detached video", "lesson", lessonId, videoId ?? "");
    refreshCatalog();
  }
  return res;
}

export async function saveInteraction(lessonId: string, input: InteractionInput): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const parsed = interactionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the checkpoint", errors: fieldErrors(parsed.error) };
  const res = await attempt(async () => ({ id: await catalog.saveInteraction(uuid.parse(lessonId), parsed.data) }), parsed.data.id ? "Checkpoint saved." : "Checkpoint added.");
  if (res.ok) {
    await audit(admin.id, parsed.data.id ? "edited" : "added", "checkpoint", res.data!.id, parsed.data.prompt);
    refreshCatalog();
  }
  return res;
}

export async function deleteInteraction(lessonId: string, interactionId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => catalog.deleteInteraction(uuid.parse(lessonId), uuid.parse(interactionId)), "Checkpoint deleted.");
  if (res.ok) {
    await audit(admin.id, "deleted", "checkpoint", interactionId, "");
    refreshCatalog();
  }
  return res;
}
