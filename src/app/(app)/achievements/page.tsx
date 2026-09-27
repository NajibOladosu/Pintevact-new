import type { Metadata } from "next";
import { Flame, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { HeatStrip } from "@/components/app/heat-strip";
import { requireViewer } from "@/lib/auth/session";
import { getLearnerSnapshot } from "@/lib/learner";
import { LEVELS } from "@/lib/gamification";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Achievements" };

const reasonLabel: Record<string, string> = { lesson: "Completed a lesson", interaction: "Interactive moment", course: "Completed a course" };

export default async function AchievementsPage() {
  const viewer = await requireViewer();
  const snap = await getLearnerSnapshot(viewer.id);
  const earned = snap.badges.filter((b) => b.earned).length;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <p className="eyebrow text-lucid">Achievements</p>
        <h1 className="mt-2 text-5xl sm:text-6xl">
          You are a <span className="display-italic text-lucid">{snap.level.name}.</span>
        </h1>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-night-2 p-6 sm:p-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow text-mist">Total experience</p>
              <p className="mt-1 font-display text-6xl text-lucid">{snap.stats.totalXp.toLocaleString()}</p>
            </div>
            <Sparkles className="text-lucid" size={32} />
          </div>
          {snap.level.next ? (
            <div className="mt-6">
              <div className="mb-1.5 flex justify-between font-mono text-xs text-mist">
                <span>{snap.level.name}</span>
                <span>
                  {snap.level.xpForNext} XP to {snap.level.next.name}
                </span>
              </div>
              <Progress value={snap.level.percent} label="Level progress" />
            </div>
          ) : (
            <p className="mt-6 text-mist">You&apos;ve reached the highest level. Luminary.</p>
          )}
          <ol className="mt-8 grid grid-cols-3 gap-2">
            {LEVELS.map((l) => {
              const reached = snap.stats.totalXp >= l.minXp;
              return (
                <li key={l.level} title={`${l.name} · ${l.minXp} XP`} className={cn("rounded-2xl border p-2 text-center", reached ? "border-lucid bg-lucid/10" : "border-white/10 opacity-50", l.level === snap.level.level && "ring-2 ring-lucid")}>
                  <p className="font-mono text-xs text-mist">L{l.level}</p>
                  <p className="truncate text-xs font-semibold">{l.name}</p>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-ember/25 to-night-2 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-ember">Streak</p>
            <Flame className="fill-ember text-ember" />
          </div>
          <p className="mt-1 font-display text-6xl">{snap.streak} days</p>
          <p className="text-mist">Longest: {snap.stats.longestStreak} days</p>
          <div className="mt-6">
            <HeatStrip days={snap.heatmap} />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-3xl">Badges</h2>
          <p className="font-mono text-sm text-mist">
            {earned}/{snap.badges.length} earned
          </p>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {snap.badges.map((b) => (
            <li key={b.id} className={cn("rounded-3xl border p-5 text-center transition", b.earned ? "border-lucid/50 bg-gradient-to-b from-lucid/15 to-night-2" : "border-white/10 bg-night-2")}>
              <span className={cn("mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 text-3xl", b.earned ? "border-lucid bg-lucid text-ink" : "border-dashed border-white/20 text-mist grayscale")} aria-hidden>
                {b.glyph}
              </span>
              <p className="mt-3 font-semibold">{b.name}</p>
              <p className="mt-1 text-sm text-mist">{b.description}</p>
              {!b.earned ? <Progress value={b.progress * 100} className="mt-3 h-1.5" label={`${b.name} progress`} /> : <p className="eyebrow mt-3 text-lucid">Earned</p>}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-3xl">Recent XP</h2>
        {snap.xpEvents.length ? (
          <ul className="mt-6 divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-night-2">
            {snap.xpEvents.slice(0, 15).map((e) => {
              const ctx = snap.lessonIndex.get(e.refId);
              return (
                <li key={`${e.reason}-${e.refId}`} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{reasonLabel[e.reason] ?? e.reason}{ctx ? ` · ${ctx.lesson.title}` : ""}</p>
                    <p className="text-sm text-mist">{formatDate(e.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  <span className="shrink-0 font-mono font-semibold text-lucid">+{e.amount}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-mist">Your XP history will appear here once you start learning.</p>
        )}
      </section>
    </div>
  );
}
