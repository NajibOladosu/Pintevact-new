import { describe, expect, it } from "vitest";
import { catalog, findCourse } from "@/content/catalog";
import { flattenLessons } from "@/lib/course";

describe("course catalog integrity", () => {
  it("has unique course slugs and ids", () => {
    expect(new Set(catalog.map((c) => c.slug)).size).toBe(catalog.length);
    expect(new Set(catalog.map((c) => c.id)).size).toBe(catalog.length);
  });

  it("has exactly one free course and at least one preview lesson per paid course", () => {
    expect(catalog.filter((c) => c.priceCents === 0)).toHaveLength(1);
    for (const c of catalog.filter((c) => c.priceCents > 0)) {
      expect(flattenLessons(c).some((l) => l.isPreview), c.slug).toBe(true);
    }
  });

  it("keeps every lesson id and interaction id globally unique", () => {
    const lessons = catalog.flatMap(flattenLessons);
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    const interactions = lessons.flatMap((l) => l.interactions);
    expect(new Set(interactions.map((i) => i.id)).size).toBe(interactions.length);
  });

  it.each(catalog.flatMap((c) => flattenLessons(c).map((l) => [`${c.slug}/${l.slug}`, l] as const)))(
    "%s has valid interactions inside the video",
    (_, lesson) => {
      expect(lesson.interactions.length).toBeGreaterThan(0);
      for (const i of lesson.interactions) {
        expect(i.atSeconds).toBeGreaterThan(0);
        expect(i.atSeconds).toBeLessThan(lesson.durationSeconds);
        if (i.type === "quiz") expect(i.options?.filter((o) => o.correct)).toHaveLength(1);
        if (i.type === "poll") expect(i.options!.length).toBeGreaterThanOrEqual(2);
        if (i.type === "scale") expect(i.scale!.max).toBeGreaterThan(i.scale!.min);
        if (i.type === "insight") expect(i.body).toBeTruthy();
      }
      const sorted = [...lesson.interactions].sort((a, b) => a.atSeconds - b.atSeconds);
      expect(lesson.interactions).toEqual(sorted);
      expect(lesson.takeaways.length).toBeGreaterThanOrEqual(2);
    },
  );

  it("finds courses by slug", () => {
    expect(findCourse("meet-your-mind")?.title).toBe("Meet Your Mind");
    expect(findCourse("nope")).toBeNull();
  });
});
