import type { Metadata } from "next";
import { Flame } from "@/components/icons";
import { StationLine } from "@/components/brand/station-line";
import { Progress } from "@/components/ui/progress";
import { badgeIcon } from "@/components/app/badge-icon";
import { requireViewer } from "@/lib/auth/session";
import { getLearnerSnapshot } from "@/lib/learner";
import { LEVELS } from "@/lib/gamification";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Achievements" };

const reasonLabel: Record<string, string> = { lesson: "Finished a lesson", interaction: "Answered a checkpoint", course: "Finished a course" };

export default async function AchievementsPage() {
  const viewer = await requireViewer();
  const snap = await getLearnerSnapshot(viewer.id);
  const earned = snap.badges.filter((b) => b.earned).length;
  const levelStations = LEVELS.map((l) => ({
    id: String(l.level),
    label: l.name,
    title: `${l.name}, ${l.minXp.toLocaleString()} XP`,
    state: l.level < snap.level.level ? ("done" as const) : l.level === snap.level.level ? ("current" as const) : ("ahead" as const),
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="h-page">Achievements</h1>

      <section className="mt-8 rounded-[1.6rem] bg-raised ring-1 ring-line p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-subtle">Current level</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {snap.level.name} <span className="tabular text-lg font-normal text-subtle">level {snap.level.level}</span>
            </p>
          </div>
          <div className="tabular flex gap-8 text-sm">
            <div>
              <p className="text-subtle">Experience</p>
              <p className="mt-0.5 text-lg font-medium">{snap.stats.totalXp.toLocaleString()} XP</p>
            </div>
            <div>
              <p className="text-subtle">Streak</p>
              <p className="mt-0.5 flex items-center gap-1 text-lg font-medium">
                <Flame size={16} weight="fill" className="text-accent-ink" /> {snap.streak} days
              </p>
            </div>
            <div>
              <p className="text-subtle">Longest</p>
              <p className="mt-0.5 text-lg font-medium">{snap.stats.longestStreak} days</p>
            </div>
          </div>
        </div>
        <StationLine stations={levelStations} className="mt-10" showLabels={false} />
        <div className="mt-3 hidden justify-between text-[0.7rem] text-subtle md:flex">
          {LEVELS.map((l) => (
            <span key={l.level} className={cn(l.level === snap.level.level && "font-medium text-fg")}>
              {l.name}
            </span>
          ))}
        </div>
        <p className="tabular mt-4 text-sm text-muted">
          {snap.level.next ? `${snap.level.xpForNext} XP until ${snap.level.next.name}.` : "You have reached the highest level."}
        </p>
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Badges</h2>
          <p className="tabular text-sm text-subtle">
            {earned} of {snap.badges.length} earned
          </p>
        </div>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {snap.badges.map((b) => {
            const Icon = badgeIcon(b.id);
            return (
              <li key={b.id} className={cn("flex gap-4 rounded-[1.1rem] border p-4", b.earned ? "border-line-strong bg-raised" : "border-line")}>
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", b.earned ? "bg-accent text-on-accent" : "border-2 border-dashed border-line-strong text-subtle")}>
                  <Icon size={18} weight={b.earned ? "fill" : "regular"} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("font-medium", !b.earned && "text-muted")}>{b.name}</p>
                  <p className="text-sm text-subtle">{b.description}</p>
                  {b.earned ? <p className="mt-2 text-xs font-medium text-accent-ink">Earned</p> : <Progress value={b.progress * 100} className="mt-3" label={`${b.name} progress`} />}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">Recent XP</h2>
        {snap.xpEvents.length ? (
          <ul className="mt-4 border-t border-line">
            {snap.xpEvents.slice(0, 15).map((e) => {
              const ctx = snap.lessonIndex.get(e.refId);
              return (
                <li key={`${e.reason}-${e.refId}`} className="flex items-center justify-between gap-4 border-b border-line py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {reasonLabel[e.reason] ?? e.reason}
                      {ctx ? <span className="font-normal text-muted">, {ctx.lesson.title}</span> : null}
                    </p>
                    <p className="tabular text-xs text-subtle">{formatDate(e.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  <span className="tabular shrink-0 text-sm font-medium">+{e.amount}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-muted">Your XP history appears here once you start learning.</p>
        )}
      </section>
    </div>
  );
}
