import type { Interaction, InteractionOption } from "./types";

export const XP_RULES = {
  lessonComplete: 50,
  courseComplete: 250,
  quizIncorrect: 5,
} as const;

export const LEVELS = [
  { level: 1, name: "Sleepwalker", minXp: 0 },
  { level: 2, name: "Noticer", minXp: 150 },
  { level: 3, name: "Observer", minXp: 400 },
  { level: 4, name: "Seeker", minXp: 800 },
  { level: 5, name: "Navigator", minXp: 1400 },
  { level: 6, name: "Strategist", minXp: 2200 },
  { level: 7, name: "Alchemist", minXp: 3300 },
  { level: 8, name: "Sage", minXp: 4800 },
  { level: 9, name: "Luminary", minXp: 7000 },
] as const;

export function levelFor(xp: number) {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.minXp) current = l;
  const next = LEVELS.find((l) => l.minXp > xp) ?? null;
  const span = next ? next.minXp - current.minXp : 1;
  const into = xp - current.minXp;
  return {
    ...current,
    next,
    xpIntoLevel: into,
    xpForNext: next ? next.minXp - xp : 0,
    percent: next ? Math.round((into / span) * 100) : 100,
  };
}

/** Evaluate an answer and return correctness + XP earned. */
export function scoreResponse(
  interaction: Pick<Interaction, "type" | "xp" | "options">,
  response: { optionId?: string; text?: string; value?: number; acknowledged?: boolean },
): { valid: boolean; isCorrect: boolean | null; xp: number; option?: InteractionOption } {
  switch (interaction.type) {
    case "quiz": {
      const option = interaction.options?.find((o) => o.id === response.optionId);
      if (!option) return { valid: false, isCorrect: null, xp: 0 };
      return { valid: true, isCorrect: !!option.correct, xp: option.correct ? interaction.xp : XP_RULES.quizIncorrect, option };
    }
    case "poll": {
      const option = interaction.options?.find((o) => o.id === response.optionId);
      if (!option) return { valid: false, isCorrect: null, xp: 0 };
      return { valid: true, isCorrect: null, xp: interaction.xp, option };
    }
    case "reflection": {
      const text = (response.text ?? "").trim();
      if (text.length < 3) return { valid: false, isCorrect: null, xp: 0 };
      return { valid: true, isCorrect: null, xp: interaction.xp };
    }
    case "scale": {
      if (typeof response.value !== "number" || Number.isNaN(response.value)) return { valid: false, isCorrect: null, xp: 0 };
      return { valid: true, isCorrect: null, xp: interaction.xp };
    }
    case "insight":
      return { valid: true, isCorrect: null, xp: interaction.xp };
  }
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Consecutive-day streak ending today (or yesterday, so a streak isn't lost before you've had a chance to learn today). */
export function computeStreak(activityDates: (string | Date)[], now = new Date()) {
  const days = new Set(activityDates.map((d) => dayKey(typeof d === "string" ? new Date(d) : d)));
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/** Longest streak ever, for achievements. */
export function longestStreak(activityDates: (string | Date)[]) {
  const days = Array.from(new Set(activityDates.map((d) => dayKey(typeof d === "string" ? new Date(d) : d)))).sort();
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of days) {
    const t = Date.parse(d);
    run = prev !== null && t - prev === 86_400_000 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return best;
}

/** Last N days of activity, oldest first — powers the dashboard heat strip. */
export function activityHeatmap(events: { createdAt: string; amount: number }[], days = 28, now = new Date()) {
  const totals = new Map<string, number>();
  for (const e of events) {
    const k = dayKey(new Date(e.createdAt));
    totals.set(k, (totals.get(k) ?? 0) + e.amount);
  }
  const out: { date: string; xp: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const k = dayKey(d);
    out.push({ date: k, xp: totals.get(k) ?? 0 });
  }
  return out;
}

export type LearnerStats = {
  totalXp: number;
  lessonsCompleted: number;
  coursesCompleted: number;
  reflections: number;
  correctQuizzes: number;
  enrollments: number;
  notes: number;
  longestStreak: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  glyph: string;
  earned: boolean;
  progress: number; // 0..1
};

const BADGE_DEFS: { id: string; name: string; description: string; glyph: string; metric: keyof LearnerStats; target: number }[] = [
  { id: "first-light", name: "First Light", description: "Complete your first lesson", glyph: "✦", metric: "lessonsCompleted", target: 1 },
  { id: "inner-voice", name: "Inner Voice", description: "Write your first reflection", glyph: "✎", metric: "reflections", target: 1 },
  { id: "sharp-mind", name: "Sharp Mind", description: "Answer 10 quiz questions correctly", glyph: "◆", metric: "correctQuizzes", target: 10 },
  { id: "kindled", name: "Kindled", description: "Reach a 3-day learning streak", glyph: "🜂", metric: "longestStreak", target: 3 },
  { id: "unbroken", name: "Unbroken", description: "Reach a 7-day learning streak", glyph: "∞", metric: "longestStreak", target: 7 },
  { id: "deep-diver", name: "Deep Diver", description: "Write 10 reflections", glyph: "◉", metric: "reflections", target: 10 },
  { id: "cartographer", name: "Cartographer", description: "Complete 10 lessons", glyph: "✧", metric: "lessonsCompleted", target: 10 },
  { id: "polymath", name: "Polymath", description: "Enrol in 3 courses", glyph: "❖", metric: "enrollments", target: 3 },
  { id: "scribe", name: "Scribe", description: "Take 5 timestamped notes", glyph: "✐", metric: "notes", target: 5 },
  { id: "integrated", name: "Integrated", description: "Complete a full course", glyph: "☀", metric: "coursesCompleted", target: 1 },
  { id: "luminary", name: "Luminary", description: "Earn 7,000 XP", glyph: "✺", metric: "totalXp", target: 7000 },
];

export function computeBadges(stats: LearnerStats): Badge[] {
  return BADGE_DEFS.map((b) => {
    const value = stats[b.metric];
    return {
      id: b.id,
      name: b.name,
      description: b.description,
      glyph: b.glyph,
      earned: value >= b.target,
      progress: Math.min(1, value / b.target),
    };
  });
}
