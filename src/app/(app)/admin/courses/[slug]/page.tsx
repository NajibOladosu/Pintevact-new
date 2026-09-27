import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
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
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminNav active="courses" />
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/courses" className="inline-flex items-center gap-1 text-sm text-mist hover:text-paper">
          <ArrowLeft size={14} /> All courses
        </Link>
        <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-1 text-sm text-lucid">
          View public page <ExternalLink size={14} />
        </Link>
      </div>
      <section className="rounded-[2rem] border border-white/10 bg-night-2 p-6 sm:p-8">
        <h2 className="text-3xl">{course.title}</h2>
        <div className="mt-6">
          <CourseForm course={course} />
        </div>
      </section>
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl">Lessons & videos</h2>
          <p className="mt-1 text-sm text-mist">
            {videos.length ? `${videos.length} videos found in your Bunny Stream library — start typing to pick one.` : "Connect Bunny Stream (BUNNY_STREAM_LIBRARY_ID + BUNNY_STREAM_API_KEY) to pick videos from your library."}
          </p>
        </div>
        {course.modules.map((m, mi) => (
          <div key={m.id} className="rounded-[2rem] border border-white/10 bg-night-2 p-6">
            <p className="eyebrow text-mist">Module {mi + 1}</p>
            <h3 className="mt-1 text-2xl">{m.title}</h3>
            <ul className="mt-5 space-y-6">
              {m.lessons.map((l) => (
                <li key={l.id} className="border-t border-white/10 pt-5">
                  <LessonForm lesson={l} videos={videos} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {l.interactions.map((i) => (
                      <span key={i.id} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-mist" title={i.prompt}>
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
