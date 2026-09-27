import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/app/admin-nav";
import { LineBullet } from "@/components/brand/station-line";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { courseCode, summarizeCourse } from "@/lib/course";
import { formatMinutes, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Courses" };

export default async function AdminCoursesPage() {
  await requireAdmin();
  const courses = await getStore().listCourses({ includeUnpublished: true });
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <AdminNav active="courses" />
      <ul className="border-t border-line">
        {courses.map((c) => {
          const s = summarizeCourse(c);
          return (
            <li key={c.id}>
              <Link href={`/admin/courses/${c.slug}`} className="flex flex-col gap-3 border-b border-line px-2 py-4 transition-colors hover:bg-fg/[0.03] sm:flex-row sm:items-center">
                <LineBullet code={courseCode(c)} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{c.title}</p>
                    {c.published ? <Badge tone="success">Published</Badge> : <Badge>Draft</Badge>}
                    {c.featured ? <Badge tone="soft">Featured</Badge> : null}
                  </div>
                  <p className="tabular mt-1 text-sm text-subtle">
                    {c.category}, {s.lessonCount} lessons, {formatMinutes(s.durationSeconds)}, {s.interactionCount} checkpoints
                  </p>
                </div>
                <span className="tabular text-sm font-medium">{formatPrice(c.priceCents)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-subtle">
        New courses and checkpoints are authored in <code className="font-mono text-fg">src/content/catalog.ts</code> and synced with <code className="font-mono text-fg">npm run db:seed:generate</code>. Use this panel for pricing, publishing and attaching Bunny videos.
      </p>
    </div>
  );
}
