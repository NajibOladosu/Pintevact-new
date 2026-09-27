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

const LINE_CODES: Record<string, string> = {
  "meet-your-mind": "MM",
  "emotional-alchemy": "EA",
  "the-persuasion-lab": "PL",
  "habit-architecture": "HA",
  "attachment-and-you": "AY",
  "deep-focus-mind": "DF",
  "shadow-work": "SW",
};

/** Two-letter line code for a course, like a transit line bullet. */
export function courseCode(course: Pick<Course, "slug" | "title">) {
  if (LINE_CODES[course.slug]) return LINE_CODES[course.slug];
  const words = course.title.replace(/^the\s+/i, "").split(/[^A-Za-z]+/).filter((w) => w.length > 1 && !/^(and|of|the|you)$/i.test(w));
  return ((words[0]?.[0] ?? "P") + (words[1]?.[0] ?? words[0]?.[1] ?? "")).toUpperCase();
}

/** Stations for a course line given which lessons are complete and which is next. */
export function courseStations(course: Course, completed: Set<string>, nextId?: string | null, hrefFor?: (lessonSlug: string) => string) {
  return flattenLessons(course).map((l) => ({
    id: l.id,
    title: l.title,
    state: completed.has(l.id) ? ("done" as const) : l.id === nextId ? ("current" as const) : ("ahead" as const),
    href: hrefFor?.(l.slug),
  }));
}
