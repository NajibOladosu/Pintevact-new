import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "@/components/icons";
import { AdminNav } from "@/components/app/admin-nav";
import { CourseDetailsForm, CourseHeaderActions, CoverUploader } from "@/components/admin/course-editor";
import { CurriculumBoard } from "@/components/admin/curriculum-board";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { courseStats, getCourseForAdmin } from "@/lib/admin/catalog";
import { flattenLessons, summarizeCourse } from "@/lib/course";
import { formatMinutes, formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Edit course" };

export default async function AdminCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const course = await getCourseForAdmin(slug);
  if (!course) notFound();
  const s = summarizeCourse(course);
  const stats = (await courseStats()).get(course.id);
  const noVideo = flattenLessons(course).filter((l) => !l.bunnyVideoId).length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminNav active="courses" title={course.title} actions={<CourseHeaderActions course={course} lessons={s.lessonCount} purchases={stats?.purchases ?? 0} />} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/admin/courses" className="inline-flex items-center gap-1 text-muted hover:text-fg">
            <ArrowLeft size={14} aria-hidden /> All courses
          </Link>
          {course.published ? <Badge tone="success">Live</Badge> : <Badge>Draft</Badge>}
          {course.featured ? <Badge tone="soft">Featured</Badge> : null}
        </div>
        <Link href={`/courses/${course.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm text-accent-ink">
          {course.published ? "View on the site" : "Preview as admin"} <ExternalLink size={14} aria-hidden />
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.4rem] bg-line ring-1 ring-line sm:grid-cols-4">
        {[
          ["Lessons", `${s.lessonCount} · ${formatMinutes(s.durationSeconds)}`],
          ["Checkpoints", String(s.interactionCount)],
          ["Learners", `${stats?.learners ?? 0} · ${stats?.completions ?? 0} finished`],
          ["Revenue", `${formatMoney(stats?.revenueCents ?? 0, course.currency)} · ${stats?.purchases ?? 0} sales`],
        ].map(([k, v]) => (
          <div key={k} className="bg-raised p-4">
            <dt className="text-xs text-subtle">{k}</dt>
            <dd className="tabular mt-1 font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="curriculum" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="curriculum" className="text-2xl tracking-tight">
              Curriculum
            </h2>
            <p className="mt-1 text-sm text-muted">Drag lessons to reorder them or move them between modules. Open a lesson to set its video and checkpoints.</p>
          </div>
          {noVideo ? <p className="text-sm text-danger">{noVideo === 1 ? "1 lesson has" : `${noVideo} lessons have`} no video yet.</p> : null}
        </div>
        <CurriculumBoard course={course} />
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="details" className="rounded-[1.6rem] bg-raised p-6 ring-1 ring-line sm:p-8">
          <h2 id="details" className="text-2xl tracking-tight">
            Details
          </h2>
          <div className="mt-6">
            <CourseDetailsForm key={course.id} course={course} />
          </div>
        </section>
        <aside aria-labelledby="cover" className="rounded-[1.6rem] bg-raised p-6 ring-1 ring-line lg:sticky lg:top-24">
          <h2 id="cover" className="text-lg">
            Cover image
          </h2>
          <p className="mt-1 text-sm text-muted">Shown on course cards, the home page and the course page.</p>
          <div className="mt-4">
            <CoverUploader course={course} />
          </div>
        </aside>
      </div>
    </div>
  );
}
