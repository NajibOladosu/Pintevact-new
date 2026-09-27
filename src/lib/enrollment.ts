import "server-only";
import { getStore } from "@/lib/data";
import { canAccessCourse, enrollmentSource } from "@/lib/access";
import type { Course } from "@/lib/types";

/** Resolve access to a course for a user and make sure an enrolment row exists when they have it. */
export async function ensureCourseAccess(userId: string, course: Course) {
  const store = getStore();
  const access = await store.getAccess(userId);
  const hasAccess = canAccessCourse(course, access);
  if (hasAccess) {
    const enrollments = await store.listEnrollments(userId);
    if (!enrollments.some((e) => e.courseId === course.id)) {
      await store.enroll(userId, course.id, enrollmentSource(course, access));
    }
  }
  return { access, hasAccess };
}
