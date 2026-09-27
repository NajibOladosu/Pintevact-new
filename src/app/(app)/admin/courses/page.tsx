import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/app/admin-nav";
import { CourseCover } from "@/components/course/course-cover";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { summarizeCourse } from "@/lib/course";
import { formatMinutes, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Courses" };

export default async function AdminCoursesPage() {
  await requireAdmin();
  const courses = (await getStore().listCourses({ includeUnpublished: true })).map(summarizeCourse);
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminNav active="courses" />
      <ul className="grid gap-4">
        {courses.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/courses/${c.slug}`} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-night-2 p-4 transition hover:border-lucid/40 sm:flex-row sm:items-center">
              <CourseCover theme={c.theme} glyph={c.glyph} size="sm" className="h-20 w-full shrink-0 rounded-2xl sm:w-28" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xl font-semibold">{c.title}</p>
                  {c.published ? <Badge tone="lucid">Published</Badge> : <Badge tone="outline">Draft</Badge>}
                  {c.featured ? <Badge tone="iris">Featured</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-mist">
                  {c.category} · {c.lessonCount} lessons · {formatMinutes(c.durationSeconds)} · {c.interactionCount} interactions
                </p>
              </div>
              <span className="font-display text-2xl">{formatPrice(c.priceCents)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-mist">
        New courses and interactions are authored in <code className="font-mono">src/content/catalog.ts</code> and synced with <code className="font-mono">npm run db:seed:generate</code>. Use this panel for pricing, publishing and attaching Bunny videos.
      </p>
    </div>
  );
}
