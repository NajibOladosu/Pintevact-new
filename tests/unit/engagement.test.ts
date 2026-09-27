import { describe, expect, it } from "vitest";
import { planEngagementEmails, type EngagementUser } from "@/lib/engagement";

const user = (events: string[], extra: Partial<EngagementUser> = {}): EngagementUser => ({
  id: "u",
  email: "u@test.com",
  name: "U",
  xpEvents: events.map((d) => ({ amount: 20, reason: "interaction", createdAt: d })),
  reflectionsThisWeek: 2,
  nextLesson: { title: "Next", url: "/learn/x/y" },
  ...extra,
});

describe("planEngagementEmails", () => {
  const saturday = new Date("2026-09-26T17:00:00Z");
  const sunday = new Date("2026-09-27T17:00:00Z");

  it("reminds learners whose streak is at risk", () => {
    const plan = planEngagementEmails([user(["2026-09-25T10:00:00Z", "2026-09-24T10:00:00Z"])], saturday);
    expect(plan).toEqual([expect.objectContaining({ kind: "streak", streak: 2 })]);
  });

  it("does not remind people who already learned today or have no streak", () => {
    expect(planEngagementEmails([user(["2026-09-26T09:00:00Z", "2026-09-25T09:00:00Z"])], saturday)).toEqual([]);
    expect(planEngagementEmails([user(["2026-09-20T09:00:00Z"])], saturday)).toEqual([]);
    expect(planEngagementEmails([user(["2026-09-25T10:00:00Z", "2026-09-24T10:00:00Z"], { nextLesson: null })], saturday)).toEqual([]);
  });

  it("sends Sunday digests to active learners", () => {
    const plan = planEngagementEmails([user(["2026-09-27T09:00:00Z", "2026-09-22T09:00:00Z"])], sunday);
    expect(plan).toEqual([expect.objectContaining({ kind: "digest", xp: 40, reflections: 2 })]);
    expect(planEngagementEmails([user(["2026-08-01T09:00:00Z"])], sunday)).toEqual([]);
  });
});
