import { interactionMeta } from "@/components/course/interaction-icon";
import { formatDuration } from "@/lib/utils";
import type { Lesson } from "@/lib/types";

/** A real lesson as a numbered path: each checkpoint in order, with its time and kind. */
export function LessonLine({ lesson }: { lesson: Lesson }) {
  const stops = [
    ...lesson.interactions.map((i) => ({ key: i.id, at: i.atSeconds, icon: interactionMeta[i.type].icon, label: interactionMeta[i.type].label, text: i.prompt })),
    { key: "end", at: lesson.durationSeconds, icon: null, label: "Complete", text: "Earn 50 XP and keep what you noticed." },
  ];
  return (
    <ol className="border-t border-line">
      {stops.map((s, i) => (
        <li key={s.key} className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-line py-6 sm:grid-cols-[3.5rem_1fr_auto] sm:gap-x-6">
          <span className="text-lg font-semibold text-accent-ink tabular">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <p className="font-semibold tracking-[-0.01em]">{s.label}</p>
            <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-muted">{s.text}</p>
          </div>
          <span className="col-start-2 inline-flex items-center gap-2 text-[0.8125rem] text-muted sm:col-start-auto">
            {s.icon ? <s.icon size={15} className="text-accent-ink" aria-hidden /> : null}
            at {formatDuration(s.at)}
          </span>
        </li>
      ))}
    </ol>
  );
}
