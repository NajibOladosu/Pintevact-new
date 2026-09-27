import { cn, clamp } from "@/lib/utils";

/** A rounded orange progress bar. */
export function Progress({ value, className, label }: { value: number; className?: string; label?: string }) {
  const pct = clamp(Math.round(value), 0, 100);
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progress"} className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-fg/[0.08]", className)}>
      <div className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-700 ease-[var(--ease-out-expo)]" style={{ width: `${pct}%` }} />
    </div>
  );
}
