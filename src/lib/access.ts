import type { Course, Lesson } from "./types";
import type { AccessInfo } from "./data/store";

export function hasActiveSubscription(access: Pick<AccessInfo, "subscription">, now = Date.now()) {
  const s = access.subscription;
  if (!s) return false;
  if (s.status !== "active" && s.status !== "trialing") return false;
  return !s.currentPeriodEnd || Date.parse(s.currentPeriodEnd) > now;
}

/** Full-course access: free course, purchase, membership, admin grant or admin role. */
export function canAccessCourse(course: Pick<Course, "id" | "priceCents">, access: AccessInfo | null) {
  if (course.priceCents === 0) return true;
  if (!access) return false;
  return (
    access.isAdmin ||
    hasActiveSubscription(access) ||
    access.purchasedCourseIds.includes(course.id) ||
    access.grantedCourseIds.includes(course.id)
  );
}

/** Preview lessons are open to any signed-in learner. */
export function canWatchLesson(course: Pick<Course, "id" | "priceCents">, lesson: Pick<Lesson, "isPreview">, access: AccessInfo | null) {
  return lesson.isPreview ? access !== null || course.priceCents === 0 : canAccessCourse(course, access);
}

export function enrollmentSource(course: Pick<Course, "id" | "priceCents">, access: AccessInfo) {
  if (course.priceCents === 0) return "free" as const;
  if (access.purchasedCourseIds.includes(course.id)) return "purchase" as const;
  if (hasActiveSubscription(access)) return "subscription" as const;
  return "admin" as const;
}
