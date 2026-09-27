import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Check, Lock, Play } from "@/components/icons";
import { LineBullet } from "@/components/brand/station-line";
import { InteractionIcon } from "@/components/course/interaction-icon";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth/session";
import { getCourse, getStore } from "@/lib/data";
import { ensureCourseAccess } from "@/lib/enrollment";
import { courseCode, courseProgress, resumeLesson } from "@/lib/course";
import { cn, formatDuration, formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ course: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourse((await params).course);
  return { title: course?.title ?? "Course" };
}

export default async function LearnCoursePage({ params }: Props) {
  const { course: slug } = await params;
  const viewer = await requireViewer(`/learn/${slug}`);
  const course = await getCourse(slug);
  if (!course) notFound();

  const { hasAccess } = await ensureCourseAccess(viewer.id, course);
  const store = getStore();
  const [progress, certificates] = await Promise.all([store.listProgress(viewer.id, course.id), store.listCertificates(viewer.id)]);
  const pct = courseProgress(course, progress);
  const resume = resumeLesson(course, progress);
  const done = new Set(progress.filter((p) => p.completedAt).map((p) => p.lessonId));
  const certificate = certificates.find((c) => c.courseId === course.id);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft size={14} /> My courses
      </Link>
      <div className="mt-8 flex items-center gap-3">
        <LineBullet code={courseCode(course)} tone="solid" />
        <span className="text-sm text-muted">
          {course.category}, {course.level.toLowerCase()}
        </span>
        {!hasAccess ? <Badge tone="soft">Preview</Badge> : null}
      </div>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{course.title}</h1>
      <p className="mt-3 max-w-[56ch] text-muted">{course.subtitle}</p>

      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-sm">
          <p className="tabular text-sm text-subtle">
            {pct.completed} of {pct.total} lessons, {pct.percent}%
          </p>
          <Progress value={pct.percent} className="mt-3" label="Course progress" />
        </div>
        <div className="flex flex-wrap gap-2">
          {certificate ? (
            <Link href={`/certificates/${certificate.id}`} className={buttonClasses({ variant: "outline" })}>
              <Award size={16} /> Certificate
            </Link>
          ) : null}
          {resume && (hasAccess || resume.isPreview) ? (
            <Link href={`/learn/${course.slug}/${resume.slug}`} className={buttonClasses()}>
              <Play size={16} weight="fill" /> {pct.completed ? "Continue" : "Start course"}
            </Link>
          ) : null}
        </div>
      </div>

      {!hasAccess ? (
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-violet p-6 text-on-violet sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold">You&apos;re previewing this course.</p>
            <p className="text-sm text-on-violet-muted">Unlock every lesson for {formatPrice(course.priceCents)}, or get every course with All-Access.</p>
          </div>
          <div className="flex gap-2">
            <form action="/api/stripe/checkout" method="post">
              <input type="hidden" name="mode" value="course" />
              <input type="hidden" name="courseSlug" value={course.slug} />
              <button type="submit" className={buttonClasses({ size: "sm" })}>
                Buy course
              </button>
            </form>
            <Link href="/pricing" className="inline-flex h-9 items-center rounded-[10px] px-3.5 text-sm font-medium text-on-violet ring-1 ring-on-violet/30 hover:ring-on-violet/60">
              All-Access
            </Link>
          </div>
        </div>
      ) : null}

      <div className="relative mt-12">
        <span aria-hidden className="absolute bottom-4 left-[9px] top-4 w-0.5 bg-line-strong" />
        {course.modules.map((m, mi) => (
          <section key={m.id} className="relative pb-8">
            <h2 className="flex items-center gap-4 font-semibold">
              <span aria-hidden className="relative h-5 w-5 rounded-full bg-fg" />
              Module {mi + 1}: {m.title}
            </h2>
            <ol className="mt-2">
              {m.lessons.map((l) => {
                const isDone = done.has(l.id);
                const isNext = resume?.id === l.id && !isDone;
                const locked = !hasAccess && !l.isPreview;
                const body = (
                  <>
                    <span
                      aria-hidden
                      className={cn(
                        "relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        isDone && "border-accent bg-accent text-on-accent",
                        isNext && "border-accent bg-bg ring-4 ring-accent/20",
                        !isDone && !isNext && "border-line-strong bg-bg text-subtle",
                      )}
                    >
                      {isDone ? <Check size={11} weight="bold" /> : locked ? <Lock size={10} /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                        <span className="font-medium">
                          {l.title}
                          {isNext ? <span className="ml-2 text-sm font-normal text-accent-ink">Up next</span> : null}
                          {l.isPreview && !hasAccess ? (
                            <Badge tone="soft" className="ml-2 align-middle">
                              Free preview
                            </Badge>
                          ) : null}
                        </span>
                        <span className="flex items-center gap-2.5">
                          {l.interactions.map((i) => (
                            <InteractionIcon key={i.id} type={i.type} size={14} />
                          ))}
                          <span className="tabular text-xs text-subtle">{formatDuration(l.durationSeconds)}</span>
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-muted">{l.summary}</span>
                    </span>
                  </>
                );
                return (
                  <li key={l.id}>
                    {locked ? (
                      <div className="flex gap-4 rounded-xl py-3 pr-3 opacity-60">{body}</div>
                    ) : (
                      <Link href={`/learn/${course.slug}/${l.slug}`} className="-ml-0 flex gap-4 rounded-xl py-3 pr-3 transition-colors hover:bg-fg/[0.03]">
                        {body}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
