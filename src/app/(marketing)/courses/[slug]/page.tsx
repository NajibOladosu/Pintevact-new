import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "@/components/icons";
import { InteractionIcon } from "@/components/course/interaction-icon";
import { CourseArt } from "@/components/course/course-card";
import { PurchasePanel, type CourseAccessState } from "@/components/course/purchase-panel";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { getCourse, getCourses, getStore, getViewer } from "@/lib/data";
import { canAccessCourse } from "@/lib/access";
import { flattenLessons, summarizeCourse } from "@/lib/course";
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

  const [viewer, courses] = await Promise.all([getViewer(), getCourses()]);
  let state: CourseAccessState = "guest";
  if (viewer) {
    const access = await getStore().getAccess(viewer.id);
    state = canAccessCourse(course, access) ? "owned" : "locked";
  }

  const index = Math.max(0, courses.findIndex((c) => c.id === course.id));
  const summary = summarizeCourse(course);
  const lessons = flattenLessons(course);
  const preview = lessons.find((l) => l.isPreview) ?? lessons[0];
  const previewHref = `/learn/${course.slug}/${preview.slug}`;

  return (
    <>
      {/* Hero */}
      <section className="shell pt-6 sm:pt-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <Link href="/courses" className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.8125rem] font-medium text-muted ring-1 ring-line transition-colors hover:text-fg hover:ring-line-strong">
              <ArrowLeft size={13} /> All courses
            </Link>
            <div className="mt-8 flex flex-wrap gap-2">
              {[course.category, course.level, course.priceCents === 0 ? "Free" : "Preview available"].map((t) => (
                <span key={t} className="rounded-full bg-raised px-3 py-1.5 text-[0.72rem] font-medium ring-1 ring-line">
                  {t}
                </span>
              ))}
            </div>
            <h1 className="h-section mt-6">{course.title}</h1>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-muted">{course.subtitle}</p>
            <p className="mt-4 text-sm text-muted">
              {summary.lessonCount} lessons · {formatMinutes(summary.durationSeconds)} of video · {summary.interactionCount} checkpoints
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={state === "owned" ? `/learn/${course.slug}` : previewHref} className={buttonClasses({ size: "lg" })}>
                {state === "owned" ? "Continue learning" : "Watch the free preview"} <ArrowUpRight size={15} aria-hidden />
              </Link>
              <Link href="#curriculum" className={buttonClasses({ variant: "outline", size: "lg" })}>
                See the lessons
              </Link>
            </div>
          </div>
          <CourseArt index={index} className="aspect-[4/3] rounded-[2rem] shadow-frame">
            <span aria-hidden className="absolute bottom-3 right-6 text-[clamp(4rem,8vw,7rem)] font-bold leading-none tracking-[-0.06em] text-white">
              {String(index + 1).padStart(2, "0")}
            </span>
          </CourseArt>
        </div>
        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 rounded-full bg-raised px-7 py-4 text-[0.8125rem] font-medium ring-1 ring-line max-sm:rounded-[1.4rem]">
          {["Self-paced", "Short video lessons", "Private reflections", "Certificate when you finish"].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" /> {f}
            </li>
          ))}
        </ul>
      </section>

      {/* Outcomes */}
      <section className="shell mt-24 sm:mt-32">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <span className="eyebrow text-muted">What you can take away</span>
            <h2 className="h-section mt-6 max-w-[13ch]">Useful in the lesson. Even better in life.</h2>
            <p className="mt-6 max-w-[60ch] leading-relaxed text-muted">{course.description}</p>
          </div>
          <ul className="self-end border-t border-line">
            {course.outcomes.map((o) => (
              <li key={o} className="flex items-start gap-4 border-b border-line py-5">
                <Check size={17} className="mt-0.5 shrink-0 text-accent-ink" aria-hidden />
                <span className="text-[1.02rem]">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="shell mt-24 scroll-mt-28 sm:mt-32">
        <span className="eyebrow text-muted">The learning path</span>
        <h2 className="h-section mt-6 max-w-[14ch]">One idea leads to the next.</h2>
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          <div>
            {course.modules.map((m, mi) => (
              <div key={m.id} className="mb-10 last:mb-0">
                <h3 className="eyebrow text-muted">
                  Module {mi + 1} · {m.title}
                </h3>
                <ol className="mt-4 border-t border-line">
                  {m.lessons.map((l) => (
                    <li key={l.id} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-line py-5 sm:grid-cols-[3rem_1fr_auto] sm:gap-x-6">
                      <span className="text-lg font-semibold text-accent-ink tabular">{String(lessons.indexOf(l) + 1).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <p className="font-semibold tracking-[-0.01em]">
                          {l.title}
                          {l.isPreview ? <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 align-middle text-[0.68rem] font-semibold text-accent-ink">Free preview</span> : null}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{l.summary}</p>
                      </div>
                      <span className="col-start-2 mt-2 flex items-center gap-2.5 text-muted sm:col-start-auto sm:mt-0">
                        {l.interactions.map((i) => (
                          <InteractionIcon key={i.id} type={i.type} size={14} />
                        ))}
                        <span className="text-xs tabular">{formatDuration(l.durationSeconds)}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
            <div className="mt-14 flex items-start gap-4 rounded-[1.6rem] bg-raised p-6 ring-1 ring-line sm:p-8">
              <Avatar name={course.instructor.name} size={52} />
              <div>
                <span className="eyebrow text-muted">Your guide</span>
                <p className="mt-3 text-lg font-semibold tracking-[-0.02em]">{course.instructor.name}</p>
                <p className="text-sm text-muted">{course.instructor.title}</p>
                <p className="mt-3 max-w-[60ch] leading-relaxed text-muted">{course.instructor.bio}</p>
              </div>
            </div>
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <PurchasePanel course={course} state={state} firstLessonHref={previewHref} />
          </aside>
        </div>
      </section>

      {/* Closing */}
      <section className="shell mt-24 sm:mt-32">
        <div className="rounded-[2.4rem] bg-frame px-8 py-14 text-on-frame shadow-frame sm:px-16 sm:py-20">
          <span className="eyebrow text-on-frame-muted">Ready when you are</span>
          <h2 className="h-section mt-6">Try the first step.</h2>
          <p className="mt-5 max-w-[48ch] leading-relaxed text-on-frame-muted">The preview lesson is free. Watch, answer, and see if this is for you.</p>
          <Link href={previewHref} className={buttonClasses({ variant: "light", className: "mt-8" })}>
            Watch and take part <ArrowUpRight size={15} aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
