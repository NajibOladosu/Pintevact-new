import { cn } from "@/lib/utils";

type Star = { x: number; y: number; r: number; lit?: boolean };

/** Deterministic pseudo-random generator so SSR and client markup match. */
export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function makeStars(count: number, seed = 7): Star[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => ({ x: rand() * 100, y: rand() * 100, r: 0.25 + rand() * 0.9 }));
}

/**
 * Decorative neural constellation. Connects each star to its nearest neighbour,
 * evoking synapses firing — the visual heart of the Pintevact brand.
 */
export function Constellation({
  count = 38,
  seed = 7,
  className,
  lineOpacity = 0.25,
}: {
  count?: number;
  seed?: number;
  className?: string;
  lineOpacity?: number;
}) {
  const stars = makeStars(count, seed);
  const lines: [Star, Star][] = [];
  stars.forEach((a, i) => {
    let best: Star | null = null;
    let bestD = Infinity;
    stars.forEach((b, j) => {
      if (i === j) return;
      const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    });
    if (best && bestD < 260) lines.push([a, best]);
  });
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("pointer-events-none", className)} aria-hidden>
      {lines.map(([a, b], i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeOpacity={lineOpacity} strokeWidth={0.12} vectorEffect="non-scaling-stroke" />
      ))}
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r * 0.35}
          fill={i % 7 === 0 ? "var(--color-lucid)" : i % 5 === 0 ? "var(--color-ember)" : "currentColor"}
          className="animate-twinkle"
          style={{ animationDelay: `${(i % 9) * 0.35}s` }}
        />
      ))}
    </svg>
  );
}
