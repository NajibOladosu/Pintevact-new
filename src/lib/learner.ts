import "server-only";
import { cache } from "react";
import { getCourses, getStore } from "@/lib/data";
import { canAccessCourse } from "@/lib/access";
import { courseProgress, flattenLessons, resumeLesson } from "@/lib/course";
import { activityHeatmap, computeBadges, computeStreak, levelFor, longestStreak, type LearnerStats } from "@/lib/gamification";
import type { Course, Lesson, LessonProgress } from "@/lib/types";

export type EnrolledCourse = {
  course: Course;
  progress: { completed: number; total: number; percent: number };
  resume: Lesson | null;
  lastActivity: string | null;
  completedAt: string | null;
};

/** Everything the learner-facing pages need about the signed-in user, computed once per request. */
export const getLearnerSnapshot = cache(async (userId: string) => {
  const store = getStore();
  const [courses, enrollments, progress, xpEvents, reflections, notes, access, certificates] = await Promise.all([
    getCourses(),
    store.listEnrollments(userId),
    store.listProgress(userId),
    store.listXpEvents(userId),
    store.listResponses(userId, { type: "reflection" }),
    store.listNotes(userId),
    store.getAccess(userId),
    store.listCertificates(userId),
  ]);

  const byCourse = new Map<string, LessonProgress[]>();
  for (const p of progress) byCourse.set(p.courseId, [...(byCourse.get(p.courseId) ?? []), p]);

  const enrolled: EnrolledCourse[] = enrollments
    .map((e): EnrolledCourse | null => {
      const course = courses.find((c) => c.id === e.courseId);
      if (!course) return null;
      const p = byCourse.get(course.id) ?? [];
      const last = p.map((x) => x.updatedAt).sort().at(-1) ?? null;
      return { course, progress: courseProgress(course, p), resume: resumeLesson(course, p), lastActivity: last ?? e.createdAt, completedAt: e.completedAt };
    })
    .filter((x): x is EnrolledCourse => x !== null)
    .sort((a, b) => (b.lastActivity ?? "").localeCompare(a.lastActivity ?? ""));

  const totalXp = xpEvents.reduce((s, e) => s + e.amount, 0);
  const dates = xpEvents.map((e) => e.createdAt);
  const stats: LearnerStats = {
    totalXp,
    lessonsCompleted: progress.filter((p) => p.completedAt).length,
    coursesCompleted: enrolled.filter((e) => e.progress.total > 0 && e.progress.completed === e.progress.total).length,
    reflections: reflections.length,
    correctQuizzes: 0,
    enrollments: enrolled.length,
    notes: notes.length,
    longestStreak: longestStreak(dates),
  };
  const quizResponses = await store.listResponses(userId);
  stats.correctQuizzes = quizResponses.filter((r) => r.isCorrect === true).length;

  const lessonIndex = new Map<string, { lesson: Lesson; course: Course }>();
  for (const c of courses) for (const l of flattenLessons(c)) lessonIndex.set(l.id, { lesson: l, course: c });

  const continueWith = enrolled.find((e) => e.resume && e.progress.percent < 100) ?? enrolled[0] ?? null;
  const recommended = courses.filter((c) => !enrolled.some((e) => e.course.id === c.id));

  return {
    courses,
    enrolled,
    access,
    certificates,
    xpEvents,
    reflections,
    notes,
    stats,
    level: levelFor(totalXp),
    streak: computeStreak(dates),
    heatmap: activityHeatmap(xpEvents, 28),
    badges: computeBadges(stats),
    continueWith,
    recommended,
    lessonIndex,
    progress,
    completedLessonIds: new Set(progress.filter((p) => p.completedAt).map((p) => p.lessonId)),
    canAccess: (c: Pick<Course, "id" | "priceCents">) => canAccessCourse(c, access),
  };
});

export type LearnerSnapshot = Awaited<ReturnType<typeof getLearnerSnapshot>>;
