import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "@/components/icons";
import { LineBullet } from "@/components/brand/station-line";
import { InteractionIcon } from "@/components/course/interaction-icon";
import { PurchasePanel, type CourseAccessState } from "@/components/course/purchase-panel";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getCourse, getStore, getViewer } from "@/lib/data";
import { canAccessCourse } from "@/lib/access";
import { courseCode, flattenLessons, summarizeCourse } from "@/lib/course";
import { formatDuration, formatMinutes } from "@/lib/utils";

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

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 md:pt-14">
      <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft size={14} /> All courses
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div>
          <div className="flex items-center gap-3">
            <LineBullet code={courseCode(course)} tone="solid" />
            <span className="text-sm text-muted">
              {course.category}, {course.level.toLowerCase()}
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-[52ch] text-lg text-muted">{course.subtitle}</p>
          <p className="tabular mt-6 text-sm text-subtle">
            {summary.lessonCount} lessons, {formatMinutes(summary.durationSeconds)} of video, {summary.interactionCount} checkpoints
          </p>

          <p className="mt-10 max-w-[65ch] leading-relaxed text-muted">{course.description}</p>

          <h2 className="mt-14 text-xl font-semibold tracking-tight">What you&apos;ll be able to do</h2>
          <ul className="mt-5 space-y-3">
            {course.outcomes.map((o) => (
              <li key={o} className="flex items-start gap-3">
                <Check size={18} className="mt-0.5 shrink-0 text-accent-ink" />
                <span>{o}</span>
              </li>
            ))}
          </ul>

          <h2 id="curriculum" className="mt-14 text-xl font-semibold tracking-tight">
            The line
          </h2>
          <div className="relative mt-6">
            <span aria-hidden className="absolute bottom-3 left-[7px] top-3 w-0.5 bg-line-strong" />
            {course.modules.map((m, mi) => (
              <section key={m.id} className="relative pb-6">
                <h3 className="flex items-center gap-4 font-semibold">
                  <span aria-hidden className="relative h-4 w-4 rounded-full bg-fg" />
                  Module {mi + 1}: {m.title}
                </h3>
                <ol className="mt-3">
                  {m.lessons.map((l) => (
                    <li key={l.id} className="relative flex gap-4 py-3">
                      <span aria-hidden className="relative mt-1.5 ml-[3px] h-2.5 w-2.5 shrink-0 rounded-full border-2 border-line-strong bg-bg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                          <p className="font-medium">
                            {l.title}
                            {l.isPreview ? (
                              <Badge tone="soft" className="ml-2 align-middle">
                                Free preview
                              </Badge>
                            ) : null}
                          </p>
                          <span className="flex items-center gap-2.5 text-subtle">
                            {l.interactions.map((i) => (
                              <InteractionIcon key={i.id} type={i.type} size={14} />
                            ))}
                            <span className="tabular text-xs">{formatDuration(l.durationSeconds)}</span>
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted">{l.summary}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>

          <div className="mt-10 flex items-start gap-4 border-t border-line pt-10">
            <Avatar name={course.instructor.name} size={48} />
            <div>
              <p className="font-semibold">{course.instructor.name}</p>
              <p className="text-sm text-subtle">{course.instructor.title}</p>
              <p className="mt-3 max-w-[60ch] text-muted">{course.instructor.bio}</p>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <PurchasePanel course={course} state={state} firstLessonHref={`/learn/${course.slug}/${preview.slug}`} />
        </aside>
      </div>
    </div>
  );
}
