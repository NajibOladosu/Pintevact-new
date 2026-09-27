import { describe, expect, it } from "vitest";
import { archetypes, quiz, scoreQuiz } from "@/content/mind-quiz";
import { catalog } from "@/content/catalog";

describe("mind quiz", () => {
  it("every question offers every archetype exactly once", () => {
    for (const q of quiz) expect(new Set(q.answers.map((a) => a.archetype)).size).toBe(4);
  });
  it("recommends real courses", () => {
    for (const a of Object.values(archetypes)) expect(catalog.some((c) => c.slug === a.courseSlug)).toBe(true);
  });
  it("picks the most frequent archetype", () => {
    expect(scoreQuiz(["feeler", "feeler", "seeker"]).winner).toBe("feeler");
    expect(scoreQuiz(["connector", "strategist", "strategist", "connector", "connector"]).scores.connector).toBe(3);
  });
  it("breaks ties deterministically", () => {
    expect(scoreQuiz(["connector", "seeker"]).winner).toBe("seeker");
    expect(scoreQuiz([]).winner).toBe("seeker");
  });
});
