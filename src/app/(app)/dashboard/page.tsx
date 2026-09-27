import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineBullet, StationLine } from "@/components/brand/station-line";
import { badgeIcon } from "@/components/app/badge-icon";
import { requireViewer } from "@/lib/auth/session";
import { getLearnerSnapshot } from "@/lib/learner";
import { courseCode, courseStations, summarizeCourse } from "@/lib/course";
import { cn, formatMinutes, formatPrice } from "@/lib/utils";

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
  const done = snap.completedLessonIds;
  const prompt = prompts[new Date().getDay() % prompts.length];
  const latestReflection = snap.reflections[0];
  const reflectionCtx = latestReflection ? snap.lessonIndex.get(latestReflection.lessonId) : null;
  const earned = snap.badges.filter((b) => b.earned);
  const nextBadge = snap.badges.filter((b) => !b.earned).sort((a, b) => b.progress - a.progress)[0];
  const recommended = snap.recommended[0];
  const activeDays = snap.heatmap.filter((d) => d.xp > 0).length;

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {greeting()}, {firstName}.
        </h1>
        <p className="tabular mt-2 text-muted">
          {snap.level.name}, level {snap.level.level}. {snap.stats.totalXp.toLocaleString()} XP
          {snap.level.next ? `, ${snap.level.xpForNext} to ${snap.level.next.name}` : ""}. {snap.streak}-day streak.
        </p>
      </header>

      {/* The next card */}
      {cont && cont.resume ? (
        <section className="mt-8 rounded-2xl border border-line bg-raised p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm text-subtle">{cont.progress.completed === 0 ? "Start here" : "Up next"}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{cont.resume.title}</h2>
              <p className="tabular mt-2 text-sm text-muted">
                {cont.course.title}, {formatMinutes(cont.resume.durationSeconds)}, {cont.resume.interactions.length} checkpoints
              </p>
            </div>
            <Link href={`/learn/${cont.course.slug}/${cont.resume.slug}`} className={buttonClasses({ size: "lg", className: "self-start md:self-auto" })}>
              {cont.progress.completed === 0 ? "Begin lesson" : "Resume lesson"} <ArrowRight size={16} />
            </Link>
          </div>
          <StationLine className="mt-8" stations={courseStations(cont.course, done, cont.resume.id, (s) => `/learn/${cont.course.slug}/${s}`)} />
          <p className="tabular mt-3 text-xs text-subtle">
            {cont.progress.completed} of {cont.progress.total} lessons
          </p>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl bg-violet p-6 text-on-violet sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Start with Meet Your Mind.</h2>
          <p className="mt-2 max-w-[50ch] text-on-violet-muted">Four short lessons, about half an hour. Your first stations on the line.</p>
          <Link href="/learn/meet-your-mind" className={buttonClasses({ size: "lg", className: "mt-6" })}>
            Start free course
          </Link>
        </section>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
        {/* Lines */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Your lines</h2>
            <p className="tabular text-sm text-subtle">{done.size} stations reached</p>
          </div>
          {snap.enrolled.length ? (
            <ul className="mt-4 space-y-2">
              {snap.enrolled.map((e) => (
                <li key={e.course.id}>
                  <Link href={`/learn/${e.course.slug}`} className="group grid grid-cols-[auto_1fr] items-center gap-4 rounded-xl p-3 transition-colors hover:bg-fg/[0.03]">
                    <LineBullet code={courseCode(e.course)} />
                    <div className="min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate font-medium">{e.course.title}</p>
                        <p className="tabular shrink-0 text-xs text-subtle">
                          {e.progress.completed}/{e.progress.total}
                        </p>
                      </div>
                      <StationLine className="mt-3" size="sm" stations={courseStations(e.course, done, e.resume?.id)} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-muted">No courses yet. Your lines appear here when you start one.</p>
          )}

          {recommended ? (
            <Link href={`/courses/${recommended.slug}`} className="group mt-8 flex items-center gap-4 rounded-xl border border-dashed border-line-strong p-4 transition-colors hover:border-fg">
              <LineBullet code={courseCode(recommended)} className="border-line-strong text-muted" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-subtle">Suggested next line</p>
                <p className="truncate font-medium">{recommended.title}</p>
              </div>
              <span className="tabular text-sm text-muted">
                {summarizeCourse(recommended).lessonCount} lessons, {formatPrice(recommended.priceCents)}
              </span>
            </Link>
          ) : null}
        </section>

        {/* Side: vault, badges, rhythm */}
        <div className="space-y-10">
          <section className="rounded-2xl bg-violet p-6 text-on-violet">
            <p className="text-sm text-on-violet-muted">Today&apos;s prompt</p>
            <p className="mt-2 text-lg font-semibold leading-snug">{prompt}</p>
            {latestReflection && reflectionCtx ? (
              <div className="mt-6 border-t border-on-violet/15 pt-4">
                <p className="text-sm text-on-violet-muted">Your latest reflection, {reflectionCtx.lesson.title}</p>
                <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed">“{latestReflection.response.text}”</p>
              </div>
            ) : null}
            <Link href="/reflections" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
              Open your vault <ArrowRight size={14} />
            </Link>
          </section>

          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Badges</h2>
              <Link href="/achievements" className="text-sm text-muted hover:text-fg">
                See all
              </Link>
            </div>
            {earned.length ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {earned.map((b) => {
                  const Icon = badgeIcon(b.id);
                  return (
                    <li key={b.id} title={b.description} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-sm">
                      <Icon size={15} weight="fill" className="text-accent-ink" /> {b.name}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">Finish a lesson to earn your first badge.</p>
            )}
            {nextBadge ? (
              <div className="mt-5">
                <p className="text-sm text-muted">
                  Next: <span className="font-medium text-fg">{nextBadge.name}</span>, {nextBadge.description.toLowerCase()}
                </p>
                <Progress value={nextBadge.progress * 100} className="mt-3" label={`${nextBadge.name} progress`} />
              </div>
            ) : null}
          </section>

          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Last 4 weeks</h2>
              <p className="tabular text-sm text-subtle">{activeDays} active days</p>
            </div>
            <div className="mt-4 grid grid-cols-14 gap-1.5" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
              {snap.heatmap.map((d) => (
                <span
                  key={d.date}
                  title={`${d.date}: ${d.xp} XP`}
                  className={cn("aspect-square rounded-full border-2", d.xp > 0 ? "border-accent bg-accent" : "border-line-strong")}
                  style={d.xp > 0 ? { opacity: Math.min(1, 0.45 + d.xp / 80) } : undefined}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
