import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "@/components/icons";
import { AdminNav } from "@/components/app/admin-nav";
import { CheckpointEditor } from "@/components/admin/checkpoint-editor";
import { LessonDetailsForm, LessonVideoPanel } from "@/components/admin/lesson-editor";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { getCourseForAdmin } from "@/lib/admin/catalog";
import { flattenLessons } from "@/lib/course";
import { isBunnyLibraryConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Admin · Edit lesson" };

export default async function AdminLessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  await requireAdmin();
  const { slug, lessonId } = await params;
  const course = await getCourseForAdmin(slug);
  const lessons = course ? flattenLessons(course) : [];
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (!course || index === -1) notFound();
  const lesson = lessons[index];
  const mod = course.modules.find((m) => m.id === lesson.moduleId);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const base = `/admin/courses/${course.slug}`;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminNav active="courses" title={lesson.title} />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={base} className="inline-flex items-center gap-1 text-muted hover:text-fg">
            <ArrowLeft size={14} aria-hidden /> {course.title}
          </Link>
          <span className="text-subtle">
            {mod?.title} · Lesson {index + 1} of {lessons.length}
          </span>
          {lesson.isPreview ? <Badge tone="soft">Free preview</Badge> : null}
        </div>
        <div className="flex items-center gap-4">
          {prev ? (
            <Link href={`${base}/lessons/${prev.id}`} className="inline-flex items-center gap-1 text-muted hover:text-fg" aria-label={`Previous lesson: ${prev.title}`}>
              <ArrowLeft size={14} aria-hidden /> Previous
            </Link>
          ) : null}
          {next ? (
            <Link href={`${base}/lessons/${next.id}`} className="inline-flex items-center gap-1 text-muted hover:text-fg" aria-label={`Next lesson: ${next.title}`}>
              Next <ArrowRight size={14} aria-hidden />
            </Link>
          ) : null}
          <Link href={`/learn/${course.slug}/${lesson.slug}`} target="_blank" className="inline-flex items-center gap-1 text-accent-ink">
            Watch as a learner <ExternalLink size={14} aria-hidden />
          </Link>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="lesson-details" className="rounded-[1.6rem] bg-raised p-6 ring-1 ring-line sm:p-8">
          <h2 id="lesson-details" className="text-2xl tracking-tight">
            Lesson details
          </h2>
          <div className="mt-6">
            <LessonDetailsForm key={`${lesson.id}:${lesson.durationSeconds}`} lesson={lesson} />
          </div>
        </section>
        <aside aria-labelledby="lesson-video" className="rounded-[1.6rem] bg-raised p-6 ring-1 ring-line lg:sticky lg:top-24">
          <h2 id="lesson-video" className="text-lg">
            Video
          </h2>
          <div className="mt-4">
            <LessonVideoPanel key={lesson.bunnyVideoId ?? "none"} lessonId={lesson.id} videoId={lesson.bunnyVideoId} durationSeconds={lesson.durationSeconds} libraryReady={isBunnyLibraryConfigured()} />
          </div>
        </aside>
      </div>

      <section aria-labelledby="checkpoints" className="rounded-[1.6rem] bg-raised p-6 ring-1 ring-line sm:p-8">
        <h2 id="checkpoints" className="text-2xl tracking-tight">
          Checkpoints
        </h2>
        <p className="mt-1 text-sm text-muted">The video pauses at each one. Required checkpoints must be answered before the lesson counts as finished.</p>
        <div className="mt-6">
          <CheckpointEditor lessonId={lesson.id} durationSeconds={lesson.durationSeconds} interactions={lesson.interactions} />
        </div>
      </section>
    </div>
  );
}
