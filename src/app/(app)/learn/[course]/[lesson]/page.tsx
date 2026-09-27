import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Lightbulb, Target } from "lucide-react";
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
    <div className="mx-auto max-w-7xl">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-widest text-mist">
        <Link href={`/learn/${course.slug}`} className="inline-flex items-center gap-1 hover:text-paper">
          <ArrowLeft size={14} /> {course.title}
        </Link>
        <span>/</span>
        <span>
          Lesson {index + 1} of {total}
        </span>
      </nav>
      <h1 className="mb-6 text-4xl leading-tight sm:text-5xl">{lesson.title}</h1>

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

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[1.75rem] border border-white/10 bg-night-2 p-6 sm:p-8">
          <h2 className="text-2xl">About this lesson</h2>
          <p className="mt-2 text-lg text-mist">{lesson.summary}</p>
          <h3 className="eyebrow mt-8 flex items-center gap-2 text-lucid">
            <Lightbulb size={14} /> Key takeaways
          </h3>
          <ul className="mt-4 space-y-3">
            {lesson.takeaways.map((k, i) => (
              <li key={k} className="flex gap-4">
                <span className="font-mono text-sm text-ember">{String(i + 1).padStart(2, "0")}</span>
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </section>
        {lesson.exercise ? (
          <section className="rounded-[1.75rem] border-2 border-ink bg-lucid p-6 text-ink sm:p-8">
            <h2 className="eyebrow flex items-center gap-2">
              <Target size={14} /> Try it this week
            </h2>
            <p className="mt-4 font-display text-2xl leading-snug">{lesson.exercise}</p>
          </section>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {prev ? (
          <Link href={`/learn/${course.slug}/${prev.slug}`} className="group rounded-3xl border border-white/10 p-5 transition hover:border-lucid/40">
            <span className="eyebrow inline-flex items-center gap-1 text-mist">
              <ArrowLeft size={12} /> Previous
            </span>
            <span className="mt-1 block text-lg font-semibold group-hover:text-lucid">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={nextHref ?? `/courses/${course.slug}`}
            className={cn("group rounded-3xl border border-white/10 p-5 text-right transition hover:border-lucid/40", !nextHref && "opacity-70")}
          >
            <span className="eyebrow inline-flex items-center gap-1 text-mist">
              {nextHref ? "Next" : "Unlock next"} <ArrowRight size={12} />
            </span>
            <span className="mt-1 block text-lg font-semibold group-hover:text-lucid">{next.title}</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
