import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BookOpenCheck, Flame, NotebookPen, Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Progress, ProgressRing } from "@/components/ui/progress";
import { CourseCover } from "@/components/course/course-cover";
import { MindConstellation } from "@/components/app/mind-constellation";
import { HeatStrip } from "@/components/app/heat-strip";
import { StatCard } from "@/components/app/stat-card";
import { Flash } from "@/components/app/flash";
import { requireViewer } from "@/lib/auth/session";
import { getLearnerSnapshot } from "@/lib/learner";
import { summarizeCourse } from "@/lib/course";
import { formatMinutes, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Still up" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

const prompts = [
  "What's a belief about yourself you've outgrown but still act on?",
  "When did you last feel fully like yourself? What were you doing?",
  "What are you pretending not to know?",
  "Which emotion did you push away today?",
  "What would you attempt if nobody was watching?",
  "Whose approval are you still waiting for?",
  "What pattern showed up again this week?",
];

export default async function DashboardPage() {
  const viewer = await requireViewer();
  const snap = await getLearnerSnapshot(viewer.id);
  const firstName = viewer.profile.fullName?.split(" ")[0] ?? viewer.email.split("@")[0];
  const cont = snap.continueWith;
  const completedIds = snap.completedLessonIds;
  const prompt = prompts[new Date().getDay() % prompts.length];
  const latestReflection = snap.reflections[0];
  const reflectionCtx = latestReflection ? snap.lessonIndex.get(latestReflection.lessonId) : null;
  const earnedBadges = snap.badges.filter((b) => b.earned);
  const nextBadge = snap.badges.filter((b) => !b.earned).sort((a, b) => b.progress - a.progress)[0];
  const recommended = snap.recommended[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Suspense>
        <Flash />
      </Suspense>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-lucid">
            Level {snap.level.level} · {snap.level.name}
          </p>
          <h1 className="mt-2 text-5xl leading-none sm:text-6xl">
            {greeting()}, <span className="display-italic">{firstName}.</span>
          </h1>
        </div>
        {snap.level.next ? (
          <div className="w-full max-w-xs">
            <div className="mb-1.5 flex justify-between font-mono text-xs text-mist">
              <span>{snap.level.xpForNext} XP to {snap.level.next.name}</span>
              <span>{snap.level.percent}%</span>
            </div>
            <Progress value={snap.level.percent} label="Level progress" />
          </div>
        ) : null}
      </header>

      {/* Continue */}
      {cont && cont.resume ? (
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-night-2">
          <div className="grid gap-0 md:grid-cols-[1fr_16rem]">
            <div className="p-6 sm:p-8">
              <p className="eyebrow text-ember">{cont.progress.completed === 0 ? "Start here" : "Continue where you left off"}</p>
              <h2 className="mt-3 text-3xl sm:text-4xl">{cont.resume.title}</h2>
              <p className="mt-2 text-mist">
                {cont.course.title} · {formatMinutes(cont.resume.durationSeconds)} · {cont.resume.interactions.length} interactive moments
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link href={`/learn/${cont.course.slug}/${cont.resume.slug}`} className={buttonClasses({ variant: "lucid", size: "lg" })}>
                  {cont.progress.completed === 0 ? "Begin lesson" : "Resume lesson"} <ArrowRight size={18} />
                </Link>
                <div className="flex items-center gap-3">
                  <span className="relative flex h-12 w-12 items-center justify-center">
                    <ProgressRing value={cont.progress.percent} size={48} className="absolute inset-0 text-paper" />
                    <span className="font-mono text-xs">{cont.progress.percent}%</span>
                  </span>
                  <span className="text-sm text-mist">
                    {cont.progress.completed}/{cont.progress.total} lessons
                  </span>
                </div>
              </div>
            </div>
            <CourseCover theme={cont.course.theme} glyph={cont.course.glyph} size="md" className="hidden min-h-full md:block" />
          </div>
        </section>
      ) : (
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-iris/30 via-night-2 to-ember/20 p-8">
          <p className="eyebrow text-lucid">Your first step</p>
          <h2 className="mt-3 text-4xl">Start with the free course: Meet Your Mind.</h2>
          <p className="mt-2 max-w-xl text-mist">Four interactive lessons, about 30 minutes, and your first stars on the map.</p>
          <Link href="/learn/meet-your-mind" className={buttonClasses({ variant: "lucid", size: "lg", className: "mt-6" })}>
            Start free course <ArrowRight size={18} />
          </Link>
        </section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total XP" value={snap.stats.totalXp.toLocaleString()} icon={Sparkles} hint={`Level ${snap.level.level}`} />
        <StatCard label="Streak" value={`${snap.streak}d`} icon={Flame} accent="text-ember" hint={`Best: ${snap.stats.longestStreak} days`} />
        <StatCard label="Lessons" value={snap.stats.lessonsCompleted} icon={BookOpenCheck} accent="text-iris-2" hint="completed" />
        <StatCard label="Reflections" value={snap.stats.reflections} icon={NotebookPen} accent="text-tide" hint="in your vault" />
      </section>

      {/* Constellation + activity */}
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-night-2 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Your constellation</h2>
            <span className="font-mono text-xs text-mist">{completedIds.size} stars lit</span>
          </div>
          <div className="mt-4">
            <MindConstellation enrolled={snap.enrolled} completedIds={completedIds} />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-night-2 p-6">
            <h2 className="text-2xl">Last 4 weeks</h2>
            <div className="mt-4">
              <HeatStrip days={snap.heatmap} />
            </div>
          </div>
          <div className="flex-1 rounded-[2rem] border border-white/10 bg-night-2 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl">Badges</h2>
              <Link href="/achievements" className="text-sm font-semibold text-lucid">
                All →
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {earnedBadges.length ? (
                earnedBadges.map((b) => (
                  <span key={b.id} title={b.description} className="inline-flex items-center gap-1.5 rounded-full bg-lucid px-3 py-1 text-sm font-semibold text-ink">
                    <span aria-hidden>{b.glyph}</span> {b.name}
                  </span>
                ))
              ) : (
                <p className="text-mist">Complete a lesson to earn your first badge.</p>
              )}
            </div>
            {nextBadge ? (
              <div className="mt-5">
                <p className="text-sm text-mist">
                  Next: <strong className="text-paper">{nextBadge.name}</strong> — {nextBadge.description.toLowerCase()}
                </p>
                <Progress value={nextBadge.progress * 100} className="mt-2" label={`${nextBadge.name} progress`} />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl">Your courses</h2>
          <Link href="/learn" className="text-sm font-semibold text-lucid">
            View all →
          </Link>
        </div>
        {snap.enrolled.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {snap.enrolled.slice(0, 4).map((e) => (
              <Link key={e.course.id} href={`/learn/${e.course.slug}`} className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-night-2 p-4 transition hover:border-lucid/40">
                <CourseCover theme={e.course.theme} glyph={e.course.glyph} size="sm" className="h-20 w-20 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold group-hover:text-lucid">{e.course.title}</p>
                  <p className="text-sm text-mist">
                    {e.progress.completed}/{e.progress.total} lessons
                  </p>
                  <Progress value={e.progress.percent} className="mt-2" label={`${e.course.title} progress`} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-mist">No courses yet — your library fills up as you enrol.</p>
        )}
      </section>

      {/* Reflection + recommendation */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-ember/25 to-night-2 p-6 sm:p-8">
          <p className="eyebrow text-ember">Today&apos;s mind prompt</p>
          <p className="mt-3 font-display text-3xl italic leading-snug">{prompt}</p>
          {latestReflection && reflectionCtx ? (
            <div className="mt-6 rounded-2xl bg-night/60 p-4">
              <p className="eyebrow text-mist">Your latest reflection · {reflectionCtx.lesson.title}</p>
              <p className="mt-2 line-clamp-3 text-paper/90">“{latestReflection.response.text}”</p>
            </div>
          ) : null}
          <Link href="/reflections" className="mt-6 inline-block font-semibold text-lucid underline underline-offset-4">
            Open the Reflection Vault →
          </Link>
        </div>
        {recommended ? (
          <Link href={`/courses/${recommended.slug}`} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-night-2 transition hover:border-lucid/40">
            <CourseCover theme={recommended.theme} glyph={recommended.glyph} size="sm" className="h-32" />
            <div className="p-6">
              <p className="eyebrow text-lucid">Recommended next</p>
              <p className="mt-2 text-2xl font-display group-hover:text-lucid">{recommended.title}</p>
              <p className="mt-1 line-clamp-2 text-mist">{recommended.subtitle}</p>
              <p className="mt-3 font-mono text-xs text-mist">
                {summarizeCourse(recommended).lessonCount} lessons · {formatPrice(recommended.priceCents)}
              </p>
            </div>
          </Link>
        ) : null}
      </section>
    </div>
  );
}
