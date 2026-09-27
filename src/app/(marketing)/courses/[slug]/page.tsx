import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, PlayCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CourseCover } from "@/components/course/course-cover";
import { InteractionIcon, interactionMeta } from "@/components/course/interaction-icon";
import { PurchasePanel, type CourseAccessState } from "@/components/course/purchase-panel";
import { Avatar } from "@/components/ui/avatar";
import { getCourse, getStore, getViewer } from "@/lib/data";
import { canAccessCourse } from "@/lib/access";
import { flattenLessons, summarizeCourse } from "@/lib/course";
import { formatDuration, formatMinutes } from "@/lib/utils";
import type { InteractionType } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Course not found" };
  return { title: course.title, description: course.subtitle, openGraph: { title: course.title, description: course.subtitle } };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  const viewer = await getViewer();
  let state: CourseAccessState = "guest";
  if (viewer) {
    const access = await getStore().getAccess(viewer.id);
    state = canAccessCourse(course, access) ? "owned" : "locked";
  }

  const summary = summarizeCourse(course);
  const lessons = flattenLessons(course);
  const preview = lessons.find((l) => l.isPreview) ?? lessons[0];
  const typeCounts = lessons
    .flatMap((l) => l.interactions)
    .reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.type]: (acc[i.type] ?? 0) + 1 }), {});

  return (
    <>
      <section className="border-b-2 border-ink">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8 lg:pt-16">
          <div>
            <nav aria-label="Breadcrumb" className="font-mono text-xs uppercase tracking-widest text-ink-3">
              <Link href="/courses" className="hover:text-ink">Courses</Link> / <span>{course.category}</span>
            </nav>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="ink">{course.category}</Badge>
              <Badge tone="outline">{course.level}</Badge>
              {course.priceCents === 0 ? <Badge tone="lucid">Free</Badge> : null}
            </div>
            <h1 className="text-balance mt-5 text-6xl leading-[0.92] sm:text-7xl lg:text-8xl">{course.title}</h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink-2">{course.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm uppercase tracking-wider text-ink-2">
              <span className="inline-flex items-center gap-2"><PlayCircle size={16} /> {summary.lessonCount} lessons</span>
              <span className="inline-flex items-center gap-2"><Clock size={16} /> {formatMinutes(summary.durationSeconds)}</span>
              <span className="inline-flex items-center gap-2"><Sparkles size={16} /> {summary.interactionCount} interactive moments</span>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <Avatar name={course.instructor.name} size={48} />
              <div>
                <p className="font-semibold">{course.instructor.name}</p>
                <p className="text-sm text-ink-3">{course.instructor.title}</p>
              </div>
            </div>
          </div>
          <CourseCover theme={course.theme} glyph={course.glyph} size="lg" className="min-h-72 rounded-[2rem] border-2 border-ink shadow-hard-lg" />
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="space-y-16">
          <section>
            <h2 className="text-4xl">About this course</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-2">{course.description}</p>
          </section>

          <section>
            <h2 className="text-4xl">What you&apos;ll discover</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-1">
              {course.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-4 rounded-2xl border-2 border-ink/10 bg-white/60 p-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-lucid">
                    <Check size={16} />
                  </span>
                  <span className="text-lg">{o}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-4xl">How you&apos;ll interact</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {(Object.keys(typeCounts) as InteractionType[]).map((t) => (
                <span key={t} className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 font-semibold">
                  <InteractionIcon type={t} /> {typeCounts[t]} {interactionMeta[t].label.toLowerCase()}
                  {typeCounts[t] > 1 ? "s" : ""}
                </span>
              ))}
            </div>
          </section>

          <section id="curriculum">
            <h2 className="text-4xl">Curriculum</h2>
            <div className="mt-6 space-y-4">
              {course.modules.map((m, mi) => (
                <details key={m.id} open={mi === 0} className="group rounded-[1.5rem] border-2 border-ink bg-paper [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 p-5">
                    <span>
                      <span className="eyebrow text-ink-3">Module {mi + 1}</span>
                      <span className="mt-1 block font-display text-2xl">{m.title}</span>
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink text-xl transition group-open:rotate-45">+</span>
                  </summary>
                  <ol className="border-t-2 border-ink/10">
                    {m.lessons.map((l) => (
                      <li key={l.id} className="flex flex-col gap-2 border-b border-ink/10 px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold">
                            {l.title}
                            {l.isPreview ? <Badge tone="lucid" className="ml-2 align-middle">Preview</Badge> : null}
                          </p>
                          <p className="mt-0.5 text-sm text-ink-3">{l.summary}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="flex -space-x-1">
                            {l.interactions.map((i) => (
                              <InteractionIcon key={i.id} type={i.type} size={12} />
                            ))}
                          </span>
                          <span className="font-mono text-xs text-ink-3">{formatDuration(l.durationSeconds)}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-night p-8 text-paper sm:p-10">
            <p className="eyebrow text-lucid">Your guide</p>
            <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
              <Avatar name={course.instructor.name} size={88} />
              <div>
                <h2 className="text-3xl">{course.instructor.name}</h2>
                <p className="text-mist">{course.instructor.title}</p>
                <p className="mt-3 max-w-xl text-paper/85">{course.instructor.bio}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <PurchasePanel course={course} state={state} firstLessonHref={`/learn/${course.slug}/${preview.slug}`} />
        </aside>
      </div>
    </>
  );
}
