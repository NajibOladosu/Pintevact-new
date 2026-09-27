import { computeStreak, levelFor } from "@/lib/gamification";

export type EngagementUser = {
  id: string;
  email: string;
  name: string | null;
  xpEvents: { amount: number; reason: string; createdAt: string }[];
  reflectionsThisWeek: number;
  nextLesson: { title: string; url: string } | null;
};

export type EngagementEmail =
  | { kind: "streak"; to: EngagementUser; streak: number; nextLesson: { title: string; url: string } }
  | { kind: "digest"; to: EngagementUser; xp: number; lessons: number; reflections: number; levelName: string };

const insights = [
  "People who reflect in writing after learning retain noticeably more of it. Your reflections are compounding.",
  "Spacing your learning across days beats cramming, your streak is doing real cognitive work.",
  "Naming a pattern is the first step to changing it. You've been naming a lot of them.",
];

/** Decide which engagement emails to send. Pure so it can be unit tested. */
export function planEngagementEmails(users: EngagementUser[], now = new Date()): EngagementEmail[] {
  const today = now.toISOString().slice(0, 10);
  const isSunday = now.getUTCDay() === 0;
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const out: EngagementEmail[] = [];
  for (const u of users) {
    const dates = u.xpEvents.map((e) => e.createdAt);
    const learnedToday = dates.some((d) => d.slice(0, 10) === today);
    const streak = computeStreak(dates, now);
    if (!learnedToday && streak >= 2 && u.nextLesson) out.push({ kind: "streak", to: u, streak, nextLesson: u.nextLesson });
    if (isSunday) {
      const week = u.xpEvents.filter((e) => Date.parse(e.createdAt) >= weekAgo);
      if (week.length) {
        out.push({
          kind: "digest",
          to: u,
          xp: week.reduce((s, e) => s + e.amount, 0),
          lessons: week.filter((e) => e.reason === "lesson").length,
          reflections: u.reflectionsThisWeek,
          levelName: levelFor(u.xpEvents.reduce((s, e) => s + e.amount, 0)).name,
        });
      }
    }
  }
  return out;
}

export function digestInsight(seed: number) {
  return insights[Math.abs(seed) % insights.length];
}
