import { describe, expect, it } from "vitest";
import { activityHeatmap, computeBadges, computeStreak, levelFor, longestStreak, scoreResponse, XP_RULES } from "@/lib/gamification";

const quiz = {
  type: "quiz" as const,
  xp: 20,
  options: [
    { id: "o1", label: "A" },
    { id: "o2", label: "B", correct: true },
  ],
};

describe("levelFor", () => {
  it("starts at Sleepwalker", () => {
    const l = levelFor(0);
    expect(l.name).toBe("Sleepwalker");
    expect(l.next?.name).toBe("Noticer");
    expect(l.percent).toBe(0);
  });
  it("computes progress into the level", () => {
    const l = levelFor(275);
    expect(l.level).toBe(2);
    expect(l.xpForNext).toBe(125);
    expect(l.percent).toBe(50);
  });
  it("caps at the top level", () => {
    const l = levelFor(99999);
    expect(l.name).toBe("Luminary");
    expect(l.next).toBeNull();
    expect(l.percent).toBe(100);
  });
});

describe("scoreResponse", () => {
  it("rewards correct quiz answers", () => {
    expect(scoreResponse(quiz, { optionId: "o2" })).toMatchObject({ valid: true, isCorrect: true, xp: 20 });
  });
  it("gives consolation XP for wrong answers", () => {
    expect(scoreResponse(quiz, { optionId: "o1" })).toMatchObject({ valid: true, isCorrect: false, xp: XP_RULES.quizIncorrect });
  });
  it("rejects unknown options", () => expect(scoreResponse(quiz, { optionId: "zzz" }).valid).toBe(false));
  it("requires meaningful reflection text", () => {
    expect(scoreResponse({ type: "reflection", xp: 15 }, { text: "  " }).valid).toBe(false);
    expect(scoreResponse({ type: "reflection", xp: 15 }, { text: "I noticed fear" })).toMatchObject({ valid: true, xp: 15 });
  });
  it("validates scales", () => {
    expect(scoreResponse({ type: "scale", xp: 10 }, {}).valid).toBe(false);
    expect(scoreResponse({ type: "scale", xp: 10 }, { value: 4 }).valid).toBe(true);
  });
});

describe("streaks", () => {
  const now = new Date("2026-05-10T15:00:00Z");
  it("counts consecutive days ending today", () => {
    expect(computeStreak(["2026-05-10T01:00:00Z", "2026-05-09T12:00:00Z", "2026-05-08T12:00:00Z", "2026-05-06T12:00:00Z"], now)).toBe(3);
  });
  it("keeps yesterday's streak alive", () => {
    expect(computeStreak(["2026-05-09T12:00:00Z", "2026-05-08T12:00:00Z"], now)).toBe(2);
  });
  it("resets after a missed day", () => expect(computeStreak(["2026-05-07T12:00:00Z"], now)).toBe(0));
  it("finds the longest streak", () => {
    expect(longestStreak(["2026-01-01", "2026-01-02", "2026-01-03", "2026-02-01", "2026-02-02"])).toBe(3);
    expect(longestStreak([])).toBe(0);
  });
  it("builds a heatmap", () => {
    const h = activityHeatmap([{ createdAt: "2026-05-10T09:00:00Z", amount: 20 }, { createdAt: "2026-05-10T10:00:00Z", amount: 5 }], 7, now);
    expect(h).toHaveLength(7);
    expect(h[6]).toEqual({ date: "2026-05-10", xp: 25 });
    expect(h[0].xp).toBe(0);
  });
});

describe("computeBadges", () => {
  it("awards badges based on stats", () => {
    const badges = computeBadges({ totalXp: 100, lessonsCompleted: 1, coursesCompleted: 0, reflections: 5, correctQuizzes: 0, enrollments: 3, notes: 0, longestStreak: 2 });
    const byId = Object.fromEntries(badges.map((b) => [b.id, b]));
    expect(byId["first-light"].earned).toBe(true);
    expect(byId["polymath"].earned).toBe(true);
    expect(byId["deep-diver"].earned).toBe(false);
    expect(byId["deep-diver"].progress).toBe(0.5);
    expect(byId["kindled"].progress).toBeCloseTo(2 / 3);
  });
});
