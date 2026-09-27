import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "@/components/icons";
import { AdminNav } from "@/components/app/admin-nav";
import { CourseForm, LessonForm } from "@/components/app/admin-forms";
import { InteractionIcon } from "@/components/course/interaction-icon";
import { requireAdmin } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { listBunnyVideos } from "@/lib/bunny";
import { formatDuration } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Edit course" };

export default async function AdminCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const course = await getStore().getCourse(slug, { includeUnpublished: true });
  if (!course) notFound();
  const videos = await listBunnyVideos().catch(() => []);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <AdminNav active="courses" />
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/courses" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
          <ArrowLeft size={14} /> All courses
        </Link>
        <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-1 text-sm text-accent-ink">
          View public page <ExternalLink size={14} />
        </Link>
      </div>
      <section className="rounded-[1.6rem] bg-raised ring-1 ring-line p-6 sm:p-8">
        <h2 className="text-2xl tracking-tight">{course.title}</h2>
        <div className="mt-6">
          <CourseForm course={course} />
        </div>
      </section>
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl tracking-tight">Lessons and videos</h2>
          <p className="mt-1 text-sm text-muted">
            {videos.length ? `${videos.length} videos found in your Bunny Stream library, start typing to pick one.` : "Connect Bunny Stream (BUNNY_STREAM_LIBRARY_ID + BUNNY_STREAM_API_KEY) to pick videos from your library."}
          </p>
        </div>
        {course.modules.map((m, mi) => (
          <div key={m.id} className="rounded-[1.6rem] bg-raised ring-1 ring-line p-6">
            <p className="text-sm text-muted">Module {mi + 1}</p>
            <h3 className="mt-1 text-lg">{m.title}</h3>
            <ul className="mt-5 space-y-6">
              {m.lessons.map((l) => (
                <li key={l.id} className="border-t border-line pt-5">
                  <LessonForm lesson={l} videos={videos} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {l.interactions.map((i) => (
                      <span key={i.id} className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-xs text-muted" title={i.prompt}>
                        <InteractionIcon type={i.type} size={11} /> {formatDuration(i.atSeconds)}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
