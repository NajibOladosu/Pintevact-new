import { cn, clamp } from "@/lib/utils";

/** A thin traveled line: the only progress visual in the system. */
export function Progress({ value, className, label }: { value: number; className?: string; label?: string }) {
  const pct = clamp(Math.round(value), 0, 100);
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progress"} className={cn("relative h-0.5 w-full bg-line-strong", className)}>
      <div className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-700 ease-[var(--ease-out-expo)]" style={{ width: `${pct}%` }} />
    </div>
  );
}
