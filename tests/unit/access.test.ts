import { describe, expect, it } from "vitest";
import { canAccessCourse, canWatchLesson, enrollmentSource, hasActiveSubscription } from "@/lib/access";
import type { AccessInfo } from "@/lib/data/store";

const paid = { id: "c1", priceCents: 7900 };
const free = { id: "c0", priceCents: 0 };
const none: AccessInfo = { isAdmin: false, subscription: null, purchasedCourseIds: [], grantedCourseIds: [] };
const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

describe("access rules", () => {
  it("free courses are open to everyone", () => {
    expect(canAccessCourse(free, null)).toBe(true);
    expect(enrollmentSource(free, none)).toBe("free");
  });
  it("paid courses need a purchase, membership, grant or admin", () => {
    expect(canAccessCourse(paid, null)).toBe(false);
    expect(canAccessCourse(paid, none)).toBe(false);
    expect(canAccessCourse(paid, { ...none, purchasedCourseIds: ["c1"] })).toBe(true);
    expect(canAccessCourse(paid, { ...none, grantedCourseIds: ["c1"] })).toBe(true);
    expect(canAccessCourse(paid, { ...none, isAdmin: true })).toBe(true);
  });
  it("respects subscription status and period end", () => {
    const sub = { id: "s", priceId: null, interval: "month" as const, cancelAtPeriodEnd: false };
    expect(hasActiveSubscription({ subscription: { ...sub, status: "active", currentPeriodEnd: future } })).toBe(true);
    expect(hasActiveSubscription({ subscription: { ...sub, status: "trialing", currentPeriodEnd: null } })).toBe(true);
    expect(hasActiveSubscription({ subscription: { ...sub, status: "active", currentPeriodEnd: past } })).toBe(false);
    expect(hasActiveSubscription({ subscription: { ...sub, status: "past_due", currentPeriodEnd: future } })).toBe(false);
    expect(enrollmentSource(paid, { ...none, subscription: { ...sub, status: "active", currentPeriodEnd: future } })).toBe("subscription");
  });
  it("preview lessons need only a signed-in learner", () => {
    expect(canWatchLesson(paid, { isPreview: true }, none)).toBe(true);
    expect(canWatchLesson(paid, { isPreview: true }, null)).toBe(false);
    expect(canWatchLesson(paid, { isPreview: false }, none)).toBe(false);
  });
});
