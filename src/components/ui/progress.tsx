import { cn, clamp } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClassName,
  label,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const pct = clamp(Math.round(value), 0, 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-white/10", className)}
    >
      <div
        className={cn("h-full rounded-full bg-gradient-to-r from-iris via-ember to-lucid transition-[width] duration-700", barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProgressRing({ value, size = 56, stroke = 5, className }: { value: number; size?: number; stroke?: number; className?: string }) {
  const pct = clamp(value, 0, 100);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className={cn("-rotate-90", className)} role="img" aria-label={`${Math.round(pct)}% complete`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-lucid)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        className="transition-[stroke-dashoffset] duration-700"
      />
    </svg>
  );
}
