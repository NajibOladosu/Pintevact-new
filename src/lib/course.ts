import type { Course, CourseSummary, Lesson, LessonProgress } from "./types";

export function flattenLessons(course: Pick<Course, "modules">): Lesson[] {
  return course.modules.flatMap((m) => m.lessons).sort((a, b) => a.position - b.position);
}

export function summarizeCourse(course: Course): CourseSummary {
  const lessons = flattenLessons(course);
  const { modules: _modules, ...rest } = course;
  void _modules;
  return {
    ...rest,
    lessonCount: lessons.length,
    durationSeconds: lessons.reduce((sum, l) => sum + l.durationSeconds, 0),
    interactionCount: lessons.reduce((sum, l) => sum + l.interactions.length, 0),
  };
}

export function findLesson(course: Course, lessonSlug: string) {
  const lessons = flattenLessons(course);
  const index = lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return null;
  return { lesson: lessons[index], prev: lessons[index - 1] ?? null, next: lessons[index + 1] ?? null, index, total: lessons.length };
}

export function courseProgress(course: Course, progress: Pick<LessonProgress, "lessonId" | "completedAt">[]) {
  const lessons = flattenLessons(course);
  if (lessons.length === 0) return { completed: 0, total: 0, percent: 0 };
  const done = new Set(progress.filter((p) => p.completedAt).map((p) => p.lessonId));
  const completed = lessons.filter((l) => done.has(l.id)).length;
  return { completed, total: lessons.length, percent: Math.round((completed / lessons.length) * 100) };
}

/** The lesson a learner should open next: first incomplete, else the first lesson. */
export function resumeLesson(course: Course, progress: Pick<LessonProgress, "lessonId" | "completedAt" | "updatedAt">[]) {
  const lessons = flattenLessons(course);
  const done = new Set(progress.filter((p) => p.completedAt).map((p) => p.lessonId));
  return lessons.find((l) => !done.has(l.id)) ?? lessons[0] ?? null;
}

/** A lesson counts as complete once 90% watched and every required interaction answered. */
export function isLessonComplete(lesson: Lesson, watchedSeconds: number, answeredIds: Set<string>) {
  const watchedEnough = watchedSeconds >= lesson.durationSeconds * 0.9;
  const requiredDone = lesson.interactions.filter((i) => i.required).every((i) => answeredIds.has(i.id));
  return watchedEnough && requiredDone;
}

export const themeClasses: Record<Course["theme"], { bg: string; text: string; soft: string; ring: string }> = {
  ember: { bg: "bg-ember", text: "text-ember", soft: "bg-ember/15", ring: "ring-ember" },
  iris: { bg: "bg-iris", text: "text-iris", soft: "bg-iris/15", ring: "ring-iris" },
  lucid: { bg: "bg-lucid", text: "text-lucid", soft: "bg-lucid/20", ring: "ring-lucid" },
  tide: { bg: "bg-tide", text: "text-tide", soft: "bg-tide/15", ring: "ring-tide" },
  sun: { bg: "bg-sun", text: "text-sun", soft: "bg-sun/20", ring: "ring-sun" },
  blush: { bg: "bg-blush", text: "text-blush", soft: "bg-blush/25", ring: "ring-blush" },
};
