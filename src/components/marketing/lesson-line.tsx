import { CheckCircle2 } from "@/components/icons";
import { interactionMeta } from "@/components/course/interaction-icon";
import { formatDuration } from "@/lib/utils";
import type { Lesson } from "@/lib/types";

/**
 * A real lesson drawn to scale: its checkpoints sit on the line at their actual timestamps,
 * and the segment before the first checkpoint is shown as already traveled.
 */
export function LessonLine({ lesson }: { lesson: Lesson }) {
  const pct = (t: number) => `${(t / lesson.durationSeconds) * 100}%`;
  const first = lesson.interactions[0];
  const stops = [
    ...lesson.interactions.map((i) => ({ key: i.id, at: i.atSeconds, icon: interactionMeta[i.type].icon, label: interactionMeta[i.type].label, text: i.prompt })),
    { key: "end", at: lesson.durationSeconds, icon: CheckCircle2, label: "Complete", text: "Earn 50 XP and fill the station." },
  ];
  return (
    <div>
      {/* Desktop: horizontal, to scale */}
      <div className="relative hidden md:block">
        <div className="relative mx-2 h-4">
          <span aria-hidden className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-line-strong" />
          {first ? <span aria-hidden className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-accent" style={{ width: pct(first.atSeconds) }} /> : null}
          <span aria-hidden className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-accent" />
          {stops.map((s, i) => (
            <span
              key={s.key}
              aria-hidden
              className={i === 0 ? "absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-bg ring-4 ring-accent/20" : "absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-fg bg-bg"}
              style={{ left: pct(s.at) }}
            />
          ))}
        </div>
        <ol className="relative mx-2 mt-5 h-36">
          {stops.map((s, i) => {
            const last = i === stops.length - 1;
            return (
              <li key={s.key} className={last ? "absolute right-0 w-40 translate-x-2 text-right" : "absolute w-44 -translate-x-3"} style={last ? undefined : { left: pct(s.at) }}>
                <p className={last ? "flex items-center justify-end gap-2 text-sm font-medium" : "flex items-center gap-2 text-sm font-medium"}>
                  <s.icon size={16} className="text-accent-ink" aria-hidden />
                  {s.label} <span className="tabular font-normal text-subtle">{formatDuration(s.at)}</span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile: vertical */}
      <ol className="relative ml-2 space-y-7 border-l-2 border-line-strong pl-6 md:hidden">
        {stops.map((s) => (
          <li key={s.key} className="relative">
            <span aria-hidden className="absolute -left-[1.95rem] top-1 h-3.5 w-3.5 rounded-full border-2 border-fg bg-bg" />
            <p className="flex items-center gap-2 text-sm font-medium">
              <s.icon size={16} className="text-accent-ink" aria-hidden />
              {s.label} <span className="tabular font-normal text-subtle">{formatDuration(s.at)}</span>
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
