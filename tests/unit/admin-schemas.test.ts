import { describe, expect, it } from "vitest";
import { chaptersSchema, courseDetailsSchema, formatChapters, formatClock, interactionRow, interactionSchema, layoutSchema, lessonDetailsSchema, parseClock, slugSchema, uniqueSlug } from "@/lib/admin/schemas";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

describe("slugs", () => {
  it("suffixes taken slugs", () => {
    expect(uniqueSlug("Emotional Alchemy", [])).toBe("emotional-alchemy");
    expect(uniqueSlug("Emotional Alchemy", ["emotional-alchemy", "emotional-alchemy-2"])).toBe("emotional-alchemy-3");
    expect(uniqueSlug("¿¿", [])).toBe("untitled");
  });
  it("accepts only clean slugs", () => {
    expect(slugSchema.parse(" Meet-Your-Mind ")).toBe("meet-your-mind");
    for (const bad of ["a", "has space", "double--dash", "-edge", "emoji-✨"]) expect(slugSchema.safeParse(bad).success, bad).toBe(false);
  });
});

describe("clock and chapters", () => {
  it("round-trips times", () => {
    expect(formatClock(75)).toBe("1:15");
    expect(formatClock(3725)).toBe("1:02:05");
    expect(parseClock("1:15")).toBe(75);
    expect(parseClock("1:02:05")).toBe(3725);
    expect(parseClock("90")).toBe(90);
    expect(parseClock("1:5")).toBeNull();
  });
  it("parses and sorts chapter lines", () => {
    const chapters = chaptersSchema.parse("3:00 Research\n\n0:00 The spark");
    expect(chapters).toEqual([
      { atSeconds: 0, title: "The spark" },
      { atSeconds: 180, title: "Research" },
    ]);
    expect(formatChapters(chapters)).toBe("0:00 The spark\n3:00 Research");
    expect(chaptersSchema.safeParse("soon Research").success).toBe(false);
  });
});

describe("course and lesson details", () => {
  const course = {
    courseId: id(1),
    title: "Calm",
    slug: "calm",
    subtitle: "",
    description: "",
    category: "Emotions",
    level: "Beginner",
    priceCents: 4900,
    stripePriceId: "",
    theme: "ember",
    outcomes: "One\n\n Two ",
    instructorName: "",
    instructorTitle: "",
    instructorBio: "",
    published: false,
    featured: false,
  };
  it("splits outcomes and empties the Stripe price", () => {
    const parsed = courseDetailsSchema.parse(course);
    expect(parsed.outcomes).toEqual(["One", "Two"]);
    expect(parsed.stripePriceId).toBeNull();
  });
  it("rejects things that aren't Stripe price IDs", () => {
    expect(courseDetailsSchema.safeParse({ ...course, stripePriceId: "prod_123" }).success).toBe(false);
  });
  it("needs a video length", () => {
    const lesson = { lessonId: id(2), title: "Intro", slug: "intro", summary: "", durationSeconds: 0, isPreview: false, chapters: "", takeaways: "", exercise: "" };
    expect(lessonDetailsSchema.safeParse(lesson).success).toBe(false);
    expect(lessonDetailsSchema.parse({ ...lesson, durationSeconds: 600 }).exercise).toBeNull();
  });
});

describe("checkpoints", () => {
  const quiz = { type: "quiz" as const, atSeconds: 60, prompt: "Which one?", xp: 20, explanation: "", options: [{ label: "A", correct: true }, { label: "B", correct: false }] };
  it("needs exactly one correct quiz answer", () => {
    expect(interactionSchema.safeParse(quiz).success).toBe(true);
    expect(interactionSchema.safeParse({ ...quiz, options: quiz.options.map((o) => ({ ...o, correct: true })) }).success).toBe(false);
    expect(interactionSchema.safeParse({ ...quiz, options: [quiz.options[0]] }).success).toBe(false);
  });
  it("keeps scales ordered", () => {
    const scale = { type: "scale" as const, atSeconds: 30, prompt: "How calm?", xp: 10, min: 5, max: 5, minLabel: "Not", maxLabel: "Very" };
    expect(interactionSchema.safeParse(scale).success).toBe(false);
    expect(interactionSchema.safeParse({ ...scale, max: 10 }).success).toBe(true);
  });
  it("maps to database rows, quizzes always required", () => {
    const row = interactionRow(interactionSchema.parse(quiz));
    expect(row.required).toBe(true);
    expect(row.options).toEqual([
      { id: "o1", label: "A", correct: true },
      { id: "o2", label: "B", correct: false },
    ]);
    const reflection = interactionRow(interactionSchema.parse({ type: "reflection", atSeconds: 90, prompt: "Write it down", xp: 15, required: false }));
    expect(reflection).toMatchObject({ required: false, options: null, scale: null });
  });
});

describe("curriculum layout", () => {
  it("rejects a lesson listed twice", () => {
    expect(layoutSchema.safeParse([{ id: id(1), lessons: [id(2)] }, { id: id(3), lessons: [id(2)] }]).success).toBe(false);
    expect(layoutSchema.safeParse([{ id: id(1), lessons: [id(2)] }, { id: id(3), lessons: [] }]).success).toBe(true);
  });
});
