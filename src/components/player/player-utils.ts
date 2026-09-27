import type { Chapter, Interaction } from "@/lib/types";

/**
 * Returns the first interaction whose timestamp was crossed while playing
 * from `prev` to `now`, skipping ones already handled. Large jumps (seeks)
 * never trigger, so scrubbing past a checkpoint doesn't ambush the learner.
 */
export function crossedInteraction(interactions: Interaction[], prev: number, now: number, handled: Set<string>, maxStep = 2.5): Interaction | null {
  if (now <= prev || now - prev > maxStep) return null;
  return interactions.find((i) => !handled.has(i.id) && i.atSeconds > prev && i.atSeconds <= now) ?? null;
}

export function currentChapter(chapters: Chapter[], t: number): Chapter | null {
  let current: Chapter | null = null;
  for (const c of [...chapters].sort((a, b) => a.atSeconds - b.atSeconds)) if (c.atSeconds <= t) current = c;
  return current;
}

export function nextInteraction(interactions: Interaction[], t: number, handled: Set<string>) {
  return interactions.find((i) => i.atSeconds > t + 0.5 && !handled.has(i.id)) ?? null;
}

/** Accumulates genuinely-watched seconds (ignores seeks and idle time). */
export function accumulateWatched(total: number, prev: number, now: number, maxStep = 2.5) {
  const delta = now - prev;
  return delta > 0 && delta <= maxStep ? total + delta : total;
}

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;

export function parseStartTime(raw: string | null | undefined, duration: number) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(n, Math.max(0, duration - 1));
}
