import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { flattenLessons } from "@/lib/course";
import { mapCourse } from "@/lib/data/supabase-store";
import type { Course } from "@/lib/types";
import { DEFAULT_XP, interactionRow, uniqueSlug, type CourseDetails, type CurriculumLayout, type InteractionInput, type LessonDetails } from "./schemas";

/* eslint-disable @typescript-eslint/no-explicit-any -- PostgREST rows */

/**
 * Course authoring for the admin. Runs with the service role from server actions that have
 * already checked the caller is an admin (requireAdmin). Throws AdminError with a message
 * that is safe to show in the UI.
 */

export class AdminError extends Error {}

const COURSE_SELECT = "*, modules(id, course_id, title, position, lessons(*, lesson_interactions(*)))";
const COVER_BUCKET = "course-covers";
const COVER_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
export const MAX_COVER_BYTES = 5 * 1024 * 1024;

const db = () => createAdminClient();

function check<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/* ─── Reading ──────────────────────────────────────────────────────── */

export async function getCourseForAdmin(slug: string): Promise<Course | null> {
  const row = check(await db().from("courses").select(COURSE_SELECT).eq("slug", slug).maybeSingle());
  return row ? mapCourse(row) : null;
}

export async function getCourseById(id: string): Promise<Course | null> {
  const row = check(await db().from("courses").select(COURSE_SELECT).eq("id", id).maybeSingle());
  return row ? mapCourse(row) : null;
}

export type CourseStats = { learners: number; purchases: number; revenueCents: number; completions: number };

/** Learners, purchases and revenue per course, for the course list. */
export async function courseStats(): Promise<Map<string, CourseStats>> {
  const client = db();
  const [enrollments, purchases] = await Promise.all([
    client.from("enrollments").select("course_id, completed_at"),
    client.from("purchases").select("course_id, amount_cents").eq("status", "paid"),
  ]);
  const stats = new Map<string, CourseStats>();
  const get = (id: string) => stats.get(id) ?? (stats.set(id, { learners: 0, purchases: 0, revenueCents: 0, completions: 0 }), stats.get(id)!);
  for (const e of check(enrollments) as any[]) {
    const s = get(e.course_id);
    s.learners++;
    if (e.completed_at) s.completions++;
  }
  for (const p of check(purchases) as any[]) {
    const s = get(p.course_id);
    s.purchases++;
    s.revenueCents += p.amount_cents;
  }
  return stats;
}

/** Which lessons use each Bunny video, for the library page. */
export async function videoUsage(): Promise<Map<string, { courseTitle: string; courseSlug: string; lessonId: string; lessonTitle: string }[]>> {
  const rows = check(await db().from("lessons").select("id, title, bunny_video_id, courses(title, slug)").not("bunny_video_id", "is", null)) as any[];
  const usage = new Map<string, { courseTitle: string; courseSlug: string; lessonId: string; lessonTitle: string }[]>();
  for (const r of rows) {
    const list = usage.get(r.bunny_video_id) ?? [];
    list.push({ courseTitle: r.courses?.title ?? "", courseSlug: r.courses?.slug ?? "", lessonId: r.id, lessonTitle: r.title });
    usage.set(r.bunny_video_id, list);
  }
  return usage;
}

async function takenCourseSlugs() {
  return (check(await db().from("courses").select("slug")) as any[]).map((r) => r.slug as string);
}

async function takenLessonSlugs(courseId: string) {
  return (check(await db().from("lessons").select("slug").eq("course_id", courseId)) as any[]).map((r) => r.slug as string);
}

/* ─── Courses ──────────────────────────────────────────────────────── */

/** A new draft course with one empty module, placed last in the catalogue. */
export async function createCourse(title: string): Promise<{ id: string; slug: string }> {
  const client = db();
  const slug = uniqueSlug(title, await takenCourseSlugs());
  const last = check(await client.from("courses").select("position").order("position", { ascending: false }).limit(1)) as any[];
  const course = check(
    await client
      .from("courses")
      .insert({
        slug,
        title,
        subtitle: "",
        description: "",
        category: "General",
        level: "Beginner",
        price_cents: 0,
        theme: "iris",
        instructor: { name: "", title: "", bio: "" },
        outcomes: [],
        published: false,
        featured: false,
        position: (last[0]?.position ?? -1) + 1,
      })
      .select("id, slug")
      .single(),
  ) as any;
  check(await client.from("modules").insert({ course_id: course.id, title: "Module 1", position: 0 }));
  return { id: course.id, slug: course.slug };
}

export async function updateCourseDetails(d: CourseDetails) {
  const client = db();
  const clash = check(await client.from("courses").select("id").eq("slug", d.slug).neq("id", d.courseId).maybeSingle());
  if (clash) throw new AdminError(`Another course already uses /courses/${d.slug}`);
  check(
    await client
      .from("courses")
      .update({
        title: d.title,
        slug: d.slug,
        subtitle: d.subtitle,
        description: d.description,
        category: d.category,
        level: d.level,
        price_cents: d.priceCents,
        stripe_price_id: d.stripePriceId,
        theme: d.theme,
        outcomes: d.outcomes,
        instructor: { name: d.instructorName, title: d.instructorTitle, bio: d.instructorBio },
        published: d.published,
        featured: d.featured,
      })
      .eq("id", d.courseId),
  );
}

export async function setCoursePublished(courseId: string, published: boolean) {
  if (published) {
    const course = await getCourseById(courseId);
    if (!course) throw new AdminError("Course not found");
    if (!flattenLessons(course).length) throw new AdminError("Add at least one lesson before publishing");
  }
  check(await db().from("courses").update({ published }).eq("id", courseId));
}

/** Copies a course with every module, lesson and checkpoint, as an unpublished draft. */
export async function duplicateCourse(courseId: string): Promise<{ id: string; slug: string; title: string }> {
  const client = db();
  const src = check(await client.from("courses").select("slug, title").eq("id", courseId).maybeSingle()) as any;
  if (!src) throw new AdminError("Course not found");
  const slug = uniqueSlug(`${src.slug}-copy`, await takenCourseSlugs());
  const title = `${src.title} (copy)`;
  const id = check(await client.rpc("admin_duplicate_course", { p_course_id: courseId, p_slug: slug, p_title: title })) as string;
  return { id, slug, title };
}

/** Deletes a course and its lessons. Courses someone paid for can only be unpublished. */
export async function deleteCourse(courseId: string) {
  const client = db();
  const { count } = await client.from("purchases").select("id", { count: "exact", head: true }).eq("course_id", courseId);
  if (count) throw new AdminError(`${count} ${count === 1 ? "learner has" : "learners have"} bought this course, so it can't be deleted. Unpublish it instead.`);
  const course = check(await client.from("courses").select("cover_image_url").eq("id", courseId).maybeSingle()) as any;
  check(await client.from("courses").delete().eq("id", courseId));
  if (course?.cover_image_url) await removeCoverFile(course.cover_image_url);
}

/** Saves the catalogue order (ids first to last). */
export async function reorderCourses(ids: string[]) {
  const client = db();
  const results = await Promise.all(ids.map((id, position) => client.from("courses").update({ position }).eq("id", id)));
  for (const r of results) check(r);
}

/* ─── Cover images ─────────────────────────────────────────────────── */

export async function uploadCourseCover(courseId: string, file: File): Promise<string> {
  const ext = COVER_TYPES[file.type];
  if (!ext) throw new AdminError("Use a JPG, PNG, WebP or AVIF image");
  if (file.size > MAX_COVER_BYTES) throw new AdminError("Keep the image under 5 MB");
  const client = db();
  const path = `${courseId}/${randomUUID()}.${ext}`;
  const upload = await client.storage.from(COVER_BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (upload.error) throw new Error(upload.error.message);
  const url = client.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl;
  const prev = check(await client.from("courses").select("cover_image_url").eq("id", courseId).single()) as any;
  check(await client.from("courses").update({ cover_image_url: url }).eq("id", courseId));
  if (prev?.cover_image_url) await removeCoverFile(prev.cover_image_url);
  return url;
}

export async function removeCourseCover(courseId: string) {
  const client = db();
  const prev = check(await client.from("courses").select("cover_image_url").eq("id", courseId).single()) as any;
  check(await client.from("courses").update({ cover_image_url: null }).eq("id", courseId));
  if (prev?.cover_image_url) await removeCoverFile(prev.cover_image_url);
}

async function removeCoverFile(url: string) {
  const marker = `/object/public/${COVER_BUCKET}/`;
  const at = url.indexOf(marker);
  if (at === -1) return; // an external URL we don't own
  await db().storage.from(COVER_BUCKET).remove([decodeURIComponent(url.slice(at + marker.length))]);
}

/* ─── Modules ──────────────────────────────────────────────────────── */

export async function addModule(courseId: string, title: string) {
  const client = db();
  const last = check(await client.from("modules").select("position").eq("course_id", courseId).order("position", { ascending: false }).limit(1)) as any[];
  return check(await client.from("modules").insert({ course_id: courseId, title, position: (last[0]?.position ?? -1) + 1 }).select("id").single()) as { id: string };
}

export async function renameModule(moduleId: string, title: string) {
  check(await db().from("modules").update({ title }).eq("id", moduleId));
}

export async function deleteModule(moduleId: string) {
  const client = db();
  const mod = check(await client.from("modules").select("course_id").eq("id", moduleId).maybeSingle()) as any;
  if (!mod) throw new AdminError("Module not found");
  const { count } = await client.from("lessons").select("id", { count: "exact", head: true }).eq("module_id", moduleId);
  if (count) throw new AdminError("Move or delete this module's lessons first");
  const { count: modules } = await client.from("modules").select("id", { count: "exact", head: true }).eq("course_id", mod.course_id);
  if ((modules ?? 0) <= 1) throw new AdminError("A course needs at least one module");
  check(await client.from("modules").delete().eq("id", moduleId));
  await renumber(mod.course_id);
}

/* ─── Lessons ──────────────────────────────────────────────────────── */

/** Re-applies the current order so positions are contiguous (after adds and deletes). */
async function renumber(courseId: string) {
  const course = await getCourseById(courseId);
  if (!course) return;
  await reorderCurriculum(courseId, course.modules.map((m) => ({ id: m.id, lessons: m.lessons.map((l) => l.id) })));
}

export async function reorderCurriculum(courseId: string, layout: CurriculumLayout) {
  const res = await db().rpc("admin_reorder_curriculum", { p_course_id: courseId, p_layout: layout });
  if (res.error) throw new AdminError(res.error.code === "22023" ? "The course changed while you were editing. Reload and try again." : res.error.message);
}

/** Adds a lesson at the end of a module. Returns its id. */
export async function addLesson(moduleId: string, title: string): Promise<{ id: string; courseId: string }> {
  const client = db();
  const mod = check(await client.from("modules").select("course_id").eq("id", moduleId).maybeSingle()) as any;
  if (!mod) throw new AdminError("Module not found");
  const slug = uniqueSlug(title, await takenLessonSlugs(mod.course_id));
  const lesson = check(
    await client
      .from("lessons")
      .insert({ course_id: mod.course_id, module_id: moduleId, slug, title, summary: "", duration_seconds: 600, position: 100_000, chapters: [], takeaways: [] })
      .select("id")
      .single(),
  ) as any;
  await renumber(mod.course_id);
  return { id: lesson.id, courseId: mod.course_id };
}

export async function updateLessonDetails(d: LessonDetails) {
  const client = db();
  const lesson = check(await client.from("lessons").select("course_id").eq("id", d.lessonId).maybeSingle()) as any;
  if (!lesson) throw new AdminError("Lesson not found");
  const clash = check(await client.from("lessons").select("id").eq("course_id", lesson.course_id).eq("slug", d.slug).neq("id", d.lessonId).maybeSingle());
  if (clash) throw new AdminError(`Another lesson in this course already uses "${d.slug}"`);
  const late = check(await client.from("lesson_interactions").select("at_seconds").eq("lesson_id", d.lessonId).gte("at_seconds", d.durationSeconds)) as any[];
  if (late.length) throw new AdminError(`${late.length} ${late.length === 1 ? "checkpoint sits" : "checkpoints sit"} after the end of the video. Move ${late.length === 1 ? "it" : "them"} first.`);
  check(
    await client
      .from("lessons")
      .update({
        title: d.title,
        slug: d.slug,
        summary: d.summary,
        duration_seconds: d.durationSeconds,
        is_preview: d.isPreview,
        chapters: d.chapters.filter((c) => c.atSeconds < d.durationSeconds),
        takeaways: d.takeaways,
        exercise: d.exercise,
      })
      .eq("id", d.lessonId),
  );
}

/** Attaches a library video to a lesson, taking its length when Bunny knows it. */
export async function setLessonVideo(lessonId: string, videoId: string | null, lengthSeconds?: number) {
  const patch: Record<string, unknown> = { bunny_video_id: videoId };
  if (videoId && lengthSeconds && lengthSeconds > 0) {
    const last = check(await db().from("lesson_interactions").select("at_seconds").eq("lesson_id", lessonId).order("at_seconds", { ascending: false }).limit(1)) as any[];
    if (!last.length || last[0].at_seconds < lengthSeconds) patch.duration_seconds = Math.round(lengthSeconds);
  }
  check(await db().from("lessons").update(patch).eq("id", lessonId));
}

export async function duplicateLesson(lessonId: string): Promise<{ id: string; courseId: string }> {
  const client = db();
  const src = check(await client.from("lessons").select("course_id, slug, title").eq("id", lessonId).maybeSingle()) as any;
  if (!src) throw new AdminError("Lesson not found");
  const slug = uniqueSlug(`${src.slug}-copy`, await takenLessonSlugs(src.course_id));
  const id = check(await client.rpc("admin_duplicate_lesson", { p_lesson_id: lessonId, p_slug: slug, p_title: `${src.title} (copy)` })) as string;
  return { id, courseId: src.course_id };
}

export async function deleteLesson(lessonId: string) {
  const client = db();
  const lesson = check(await client.from("lessons").select("course_id").eq("id", lessonId).maybeSingle()) as any;
  if (!lesson) throw new AdminError("Lesson not found");
  const { count } = await client.from("lessons").select("id", { count: "exact", head: true }).eq("course_id", lesson.course_id);
  const course = check(await client.from("courses").select("published").eq("id", lesson.course_id).single()) as any;
  if (course.published && (count ?? 0) <= 1) throw new AdminError("A published course needs at least one lesson. Unpublish it first.");
  check(await client.from("lessons").delete().eq("id", lessonId));
  await renumber(lesson.course_id);
  return { courseId: lesson.course_id as string };
}

/* ─── Checkpoints ──────────────────────────────────────────────────── */

export async function saveInteraction(lessonId: string, input: InteractionInput): Promise<string> {
  const client = db();
  const lesson = check(await client.from("lessons").select("duration_seconds").eq("id", lessonId).maybeSingle()) as any;
  if (!lesson) throw new AdminError("Lesson not found");
  if (input.atSeconds >= lesson.duration_seconds) throw new AdminError("Place the checkpoint before the video ends");
  const row = interactionRow(input);
  if (input.id) {
    const res = check(await client.from("lesson_interactions").update(row).eq("id", input.id).eq("lesson_id", lessonId).select("id")) as any[];
    if (!res.length) throw new AdminError("Checkpoint not found");
    return input.id;
  }
  return (check(await client.from("lesson_interactions").insert({ ...row, lesson_id: lessonId }).select("id").single()) as any).id;
}

export async function deleteInteraction(lessonId: string, interactionId: string) {
  check(await db().from("lesson_interactions").delete().eq("id", interactionId).eq("lesson_id", lessonId));
}

export { DEFAULT_XP };
