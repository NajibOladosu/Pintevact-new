import Link from "next/link";
import { seeded } from "@/components/brand/constellation";
import { flattenLessons } from "@/lib/course";
import type { EnrolledCourse } from "@/lib/learner";

const themeColor: Record<string, string> = {
  ember: "var(--color-ember)",
  iris: "var(--color-iris)",
  lucid: "var(--color-lucid)",
  tide: "var(--color-tide)",
  sun: "var(--color-sun)",
  blush: "var(--color-blush)",
};

/**
 * The learner's personal star map: each enrolled course is a cluster, each lesson a star.
 * Completed lessons glow; the next lesson pulses.
 */
export function MindConstellation({ enrolled, completedIds }: { enrolled: EnrolledCourse[]; completedIds: Set<string> }) {
  const W = 800;
  const clusters = enrolled.slice(0, 6);
  const H = clusters.length > 3 ? 380 : 300;
  if (clusters.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/15 text-center">
        <p className="font-display text-2xl italic">Your sky is waiting.</p>
        <p className="mt-2 text-mist">Enrol in a course and every lesson will light a star here.</p>
        <Link href="/courses" className="mt-4 font-semibold text-lucid underline underline-offset-4">
          Find your first course
        </Link>
      </div>
    );
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Constellation of your learning progress">
      <defs>
        <radialGradient id="glow">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      {clusters.map((e, ci) => {
        const rand = seeded(ci * 97 + 13);
        const cols = Math.min(clusters.length, 3);
        const cx = (W / cols) * ((ci % cols) + 0.5);
        const cy = clusters.length > 3 ? (ci < 3 ? H * 0.26 : H * 0.7) : H * 0.44;
        const lessons = flattenLessons(e.course);
        const radius = clusters.length > 3 ? 72 : clusters.length === 1 ? 150 : 115;
        const pts = lessons.map((l, i) => {
          const angle = (i / lessons.length) * Math.PI * 2 + rand() * 0.6;
          const r = radius * (0.35 + rand() * 0.65);
          return { l, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r * 0.75 };
        });
        const color = themeColor[e.course.theme];
        const nextId = e.resume?.id;
        return (
          <g key={e.course.id}>
            {pts.slice(1).map((p, i) => {
              const a = pts[i];
              const lit = completedIds.has(a.l.id) && completedIds.has(p.l.id);
              return <line key={p.l.id} x1={a.x} y1={a.y} x2={p.x} y2={p.y} stroke={lit ? color : "white"} strokeOpacity={lit ? 0.8 : 0.12} strokeWidth={lit ? 1.6 : 1} />;
            })}
            {pts.map((p) => {
              const done = completedIds.has(p.l.id);
              const isNext = p.l.id === nextId;
              return (
                <a key={p.l.id} href={`/learn/${e.course.slug}/${p.l.slug}`}>
                  <title>{`${p.l.title}${done ? " — completed" : isNext ? " — up next" : ""}`}</title>
                  {done ? <circle cx={p.x} cy={p.y} r={16} fill="url(#glow)" opacity={0.35} /> : null}
                  {isNext ? <circle cx={p.x} cy={p.y} r={10} fill="none" stroke={color} strokeWidth={2} className="origin-center animate-pulse" /> : null}
                  <circle cx={p.x} cy={p.y} r={done ? 6 : 4} fill={done ? color : "var(--color-night-4)"} stroke={done ? "white" : color} strokeWidth={done ? 1.5 : 1} strokeOpacity={done ? 0.9 : 0.6} />
                </a>
              );
            })}
            <text x={cx} y={Math.min(H - 8, cy + radius * 0.75 + 30)} textAnchor="middle" className="fill-mist font-mono text-[11px] uppercase tracking-widest">
              {e.course.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
