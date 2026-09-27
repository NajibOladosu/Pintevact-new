import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { CourseCover } from "@/components/course/course-cover";
import { InteractionIcon } from "@/components/course/interaction-icon";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth/session";
import { getCourse, getStore } from "@/lib/data";
import { ensureCourseAccess } from "@/lib/enrollment";
import { courseProgress, resumeLesson } from "@/lib/course";
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
    <div className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-night-2">
        <CourseCover theme={course.theme} glyph={course.glyph} className="h-44 sm:h-56" size="lg" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <Badge tone="glass">{course.category}</Badge>
            <Badge tone="glass">{course.level}</Badge>
            {!hasAccess ? <Badge tone="ember">Preview</Badge> : null}
          </div>
          <h1 className="mt-4 text-5xl leading-none sm:text-6xl">{course.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-mist">{course.subtitle}</p>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full max-w-sm">
              <div className="mb-1.5 flex justify-between font-mono text-xs text-mist">
                <span>
                  {pct.completed}/{pct.total} lessons
                </span>
                <span>{pct.percent}%</span>
              </div>
              <Progress value={pct.percent} label="Course progress" />
            </div>
            <div className="flex flex-wrap gap-3">
              {certificate ? (
                <Link href={`/certificates/${certificate.id}`} className={buttonClasses({ variant: "subtle" })}>
                  <Award size={16} /> View certificate
                </Link>
              ) : null}
              {resume && (hasAccess || resume.isPreview) ? (
                <Link href={`/learn/${course.slug}/${resume.slug}`} className={buttonClasses({ variant: "lucid" })}>
                  <PlayCircle size={18} /> {pct.completed ? "Continue" : "Start course"}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {!hasAccess ? (
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl border border-ember/40 bg-ember/10 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold">You&apos;re previewing this course.</p>
            <p className="text-mist">Unlock every lesson for {formatPrice(course.priceCents)}, or get everything with All-Access.</p>
          </div>
          <div className="flex gap-3">
            <form action="/api/stripe/checkout" method="post">
              <input type="hidden" name="mode" value="course" />
              <input type="hidden" name="courseSlug" value={course.slug} />
              <button type="submit" className={buttonClasses({ size: "sm" })}>
                Buy course
              </button>
            </form>
            <Link href="/pricing" className={buttonClasses({ variant: "subtle", size: "sm" })}>
              All-Access
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-10 space-y-8">
        {course.modules.map((m, mi) => (
          <section key={m.id}>
            <p className="eyebrow text-mist">Module {mi + 1}</p>
            <h2 className="mt-1 text-3xl">{m.title}</h2>
            <ol className="mt-4 overflow-hidden rounded-3xl border border-white/10">
              {m.lessons.map((l) => {
                const isDone = done.has(l.id);
                const isNext = resume?.id === l.id;
                const locked = !hasAccess && !l.isPreview;
                const content = (
                  <>
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                        isDone ? "border-lucid bg-lucid text-ink" : isNext ? "border-lucid text-lucid" : "border-white/15 text-mist",
                      )}
                    >
                      {isDone ? <CheckCircle2 size={20} /> : locked ? <Lock size={16} /> : <PlayCircle size={20} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 font-semibold">
                        {l.title}
                        {l.isPreview && !hasAccess ? <Badge tone="lucid">Free preview</Badge> : null}
                        {isNext && !isDone ? <Badge tone="iris">Up next</Badge> : null}
                      </span>
                      <span className="mt-0.5 block text-sm text-mist">{l.summary}</span>
                    </span>
                    <span className="hidden shrink-0 items-center gap-3 sm:flex">
                      <span className="flex -space-x-1">
                        {l.interactions.map((i) => (
                          <InteractionIcon key={i.id} type={i.type} size={12} />
                        ))}
                      </span>
                      <span className="w-12 text-right font-mono text-xs text-mist">{formatDuration(l.durationSeconds)}</span>
                    </span>
                  </>
                );
                return (
                  <li key={l.id} className="border-b border-white/10 last:border-b-0">
                    {locked ? (
                      <div className="flex items-center gap-4 p-4 opacity-60">{content}</div>
                    ) : (
                      <Link href={`/learn/${course.slug}/${l.slug}`} className={cn("flex items-center gap-4 p-4 transition hover:bg-white/5", isNext && "bg-lucid/5")}>
                        {content}
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
