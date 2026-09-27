import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Lightbulb, Target } from "@/components/icons";
import { LessonPlayer } from "@/components/player/lesson-player";
import { parseStartTime } from "@/components/player/player-utils";
import { requireViewer } from "@/lib/auth/session";
import { getCourse, getStore } from "@/lib/data";
import { canWatchLesson } from "@/lib/access";
import { ensureCourseAccess } from "@/lib/enrollment";
import { findLesson } from "@/lib/course";
import { getPlaybackSource } from "@/lib/bunny";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ course: string; lesson: string }>; searchParams: Promise<{ t?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course: slug, lesson: lessonSlug } = await params;
  const course = await getCourse(slug);
  const found = course ? findLesson(course, lessonSlug) : null;
  return { title: found ? `${found.lesson.title} · ${course!.title}` : "Lesson" };
}

export default async function LessonPage({ params, searchParams }: Props) {
  const { course: slug, lesson: lessonSlug } = await params;
  const { t } = await searchParams;
  const viewer = await requireViewer(`/learn/${slug}/${lessonSlug}`);
  const course = await getCourse(slug);
  if (!course) notFound();
  const found = findLesson(course, lessonSlug);
  if (!found) notFound();
  const { lesson, prev, next, index, total } = found;

  const { access } = await ensureCourseAccess(viewer.id, course);
  if (!canWatchLesson(course, lesson, access)) redirect(`/courses/${course.slug}?locked=1`);

  const store = getStore();
  const [progress, responses, notes] = await Promise.all([
    store.listProgress(viewer.id, course.id),
    store.listResponses(viewer.id, { lessonId: lesson.id }),
    store.listNotes(viewer.id, { lessonId: lesson.id }),
  ]);
  const mine = progress.find((p) => p.lessonId === lesson.id);
  const resumeAt = mine && !mine.completedAt && mine.lastPosition < lesson.durationSeconds - 15 ? mine.lastPosition : 0;
  const initialTime = parseStartTime(t, lesson.durationSeconds) ?? resumeAt;
  const nextAllowed = next && canWatchLesson(course, next, access) ? next : null;
  const nextHref = nextAllowed ? `/learn/${course.slug}/${nextAllowed.slug}` : null;

  return (
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href={`/learn/${course.slug}`} className="inline-flex items-center gap-1.5 hover:text-fg">
          <ArrowLeft size={14} /> {course.title}
        </Link>
        <span className="text-subtle">/</span>
        <span className="tabular">
          Lesson {index + 1} of {total}
        </span>
      </nav>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">{lesson.title}</h1>

      <LessonPlayer
        key={lesson.id}
        lesson={{ id: lesson.id, title: lesson.title, durationSeconds: lesson.durationSeconds, chapters: lesson.chapters, takeaways: lesson.takeaways, interactions: lesson.interactions }}
        courseTitle={course.title}
        source={getPlaybackSource(lesson.bunnyVideoId)}
        initialTime={initialTime}
        initialWatched={mine?.watchedSeconds ?? 0}
        initiallyCompleted={Boolean(mine?.completedAt)}
        responses={responses}
        notes={notes}
        nextHref={nextHref}
        courseHref={`/learn/${course.slug}`}
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="text-lg font-semibold">About this lesson</h2>
          <p className="mt-2 text-muted">{lesson.summary}</p>
          <h3 className="mt-8 flex items-center gap-2 font-semibold">
            <Lightbulb size={16} className="text-accent-ink" /> Key takeaways
          </h3>
          <ol className="mt-4 space-y-3">
            {lesson.takeaways.map((k, i) => (
              <li key={k} className="flex gap-4">
                <span className="tabular w-4 shrink-0 text-sm text-subtle">{i + 1}</span>
                <span>{k}</span>
              </li>
            ))}
          </ol>
        </section>
        {lesson.exercise ? (
          <section className="self-start rounded-2xl bg-violet p-6 text-on-violet sm:p-7">
            <h2 className="flex items-center gap-2 text-sm text-on-violet-muted">
              <Target size={16} /> Try it this week
            </h2>
            <p className="mt-3 text-lg font-medium leading-relaxed">{lesson.exercise}</p>
          </section>
        ) : null}
      </div>

      <div className="mt-12 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`/learn/${course.slug}/${prev.slug}`} className="group rounded-xl p-4 transition-colors hover:bg-fg/[0.03]">
            <span className="inline-flex items-center gap-1 text-sm text-subtle">
              <ArrowLeft size={12} /> Previous
            </span>
            <span className="mt-1 block font-medium">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={nextHref ?? `/courses/${course.slug}`} className={cn("group rounded-xl p-4 text-right transition-colors hover:bg-fg/[0.03]", !nextHref && "opacity-70")}>
            <span className="inline-flex items-center gap-1 text-sm text-subtle">
              {nextHref ? "Next" : "Unlock next"} <ArrowRight size={12} />
            </span>
            <span className="mt-1 block font-medium">{next.title}</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
