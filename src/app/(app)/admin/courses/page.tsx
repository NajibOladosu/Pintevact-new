import type { Metadata } from "next";
import { AdminNav } from "@/components/app/admin-nav";
import { CourseList, NewCourseForm, type CourseListItem } from "@/components/admin/course-list";
import { requireAdmin } from "@/lib/auth/session";
import { courseStats } from "@/lib/admin/catalog";
import { getStore } from "@/lib/data";
import { flattenLessons, summarizeCourse } from "@/lib/course";

export const metadata: Metadata = { title: "Admin · Courses" };

export default async function AdminCoursesPage() {
  await requireAdmin();
  const [courses, stats] = await Promise.all([getStore().listCourses({ includeUnpublished: true }), courseStats()]);
  const items: CourseListItem[] = courses.map((c) => {
    const s = summarizeCourse(c);
    const st = stats.get(c.id);
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      position: c.position,
      coverImageUrl: c.coverImageUrl,
      published: c.published,
      featured: c.featured,
      priceCents: c.priceCents,
      currency: c.currency,
      lessons: s.lessonCount,
      durationSeconds: s.durationSeconds,
      checkpoints: s.interactionCount,
      videosMissing: flattenLessons(c).filter((l) => !l.bunnyVideoId).length,
      learners: st?.learners ?? 0,
      purchases: st?.purchases ?? 0,
      revenueCents: st?.revenueCents ?? 0,
    };
  });
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminNav active="courses" title="Courses" />
      <section className="rounded-[1.6rem] bg-raised p-5 ring-1 ring-line sm:p-6">
        <NewCourseForm />
        <p className="mt-3 text-xs text-subtle">New courses start as hidden drafts with one empty module. Publish when the lessons are ready.</p>
      </section>
      <section className="space-y-3">
        <p className="text-sm text-muted">Drag the grip to change the order courses appear in across the site.</p>
        <CourseList courses={items} />
      </section>
    </div>
  );
}
