import { describe, expect, it } from "vitest";
import { catalog } from "@/content/catalog";
import { courseProgress, findLesson, flattenLessons, isLessonComplete, resumeLesson, summarizeCourse } from "@/lib/course";

const course = catalog.find((c) => c.slug === "emotional-alchemy")!;
const lessons = flattenLessons(course);

describe("course helpers", () => {
  it("summarizes a course", () => {
    const s = summarizeCourse(course);
    expect(s.lessonCount).toBe(lessons.length);
    expect(s.durationSeconds).toBe(lessons.reduce((a, l) => a + l.durationSeconds, 0));
    expect(s).not.toHaveProperty("modules");
  });

  it("finds a lesson with prev/next", () => {
    const found = findLesson(course, lessons[1].slug)!;
    expect(found.prev?.id).toBe(lessons[0].id);
    expect(found.next?.id).toBe(lessons[2].id);
    expect(found.index).toBe(1);
    expect(findLesson(course, "missing")).toBeNull();
  });

  it("computes progress and resume point", () => {
    const now = new Date().toISOString();
    const progress = [
      { lessonId: lessons[0].id, completedAt: now, updatedAt: now },
      { lessonId: lessons[1].id, completedAt: null, updatedAt: now },
    ];
    const p = courseProgress(course, progress);
    expect(p.completed).toBe(1);
    expect(p.percent).toBe(Math.round(100 / lessons.length));
    expect(resumeLesson(course, progress)?.id).toBe(lessons[1].id);
  });

  it("requires watching 90% and answering required interactions", () => {
    const lesson = lessons[0];
    const required = lesson.interactions.filter((i) => i.required).map((i) => i.id);
    expect(isLessonComplete(lesson, lesson.durationSeconds, new Set())).toBe(required.length === 0);
    expect(isLessonComplete(lesson, lesson.durationSeconds * 0.5, new Set(required))).toBe(false);
    expect(isLessonComplete(lesson, lesson.durationSeconds * 0.95, new Set(required))).toBe(true);
  });
});
