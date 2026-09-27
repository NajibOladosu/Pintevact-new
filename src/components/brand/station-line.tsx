import Link from "next/link";
import { cn } from "@/lib/utils";

export type Station = {
  id: string;
  label?: string;
  state: "done" | "current" | "ahead";
  href?: string;
  title?: string;
};

/**
 * The Pintevact line: stations on a 2px rail. Traveled rail and finished
 * stations are orange; the current station is ringed; stations ahead are hollow.
 */
export function StationLine({ stations, className, size = "md", showLabels = false }: { stations: Station[]; className?: string; size?: "sm" | "md"; showLabels?: boolean }) {
  if (!stations.length) return null;
  const lastDone = stations.map((s) => s.state).lastIndexOf("done");
  const currentIdx = stations.findIndex((s) => s.state === "current");
  const reach = Math.max(lastDone, currentIdx);
  const traveled = stations.length > 1 && reach > 0 ? (reach / (stations.length - 1)) * 100 : 0;
  const dot = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  return (
    <div className={cn("relative", className)}>
      <div className={cn("relative flex items-center justify-between", size === "sm" ? "h-3" : "h-4")}>
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-line-strong" />
        <span aria-hidden className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-accent transition-[width] duration-700 ease-[var(--ease-out-expo)]" style={{ width: `${traveled}%` }} />
        {stations.map((s) => {
          const marker = (
            <span
              className={cn(
                "relative block rounded-full border-2 transition-colors",
                dot,
                s.state === "done" && "border-accent bg-accent",
                s.state === "current" && "border-accent bg-bg ring-4 ring-accent/20",
                s.state === "ahead" && "border-line-strong bg-bg",
              )}
            />
          );
          return s.href ? (
            <Link key={s.id} href={s.href} title={s.title} aria-label={s.title} className="relative rounded-full">
              {marker}
            </Link>
          ) : (
            <span key={s.id} title={s.title} className="relative">
              {marker}
            </span>
          );
        })}
      </div>
      {showLabels ? (
        <div className="mt-3 flex justify-between gap-2 text-xs text-subtle">
          {stations.map((s, i) => (
            <span key={s.id} className={cn("tabular", i === 0 ? "text-left" : i === stations.length - 1 ? "text-right" : "text-center")}>
              {s.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** A course's line bullet, like a transit line badge. */
export function LineBullet({ code, className, tone = "outline" }: { code: string; className?: string; tone?: "outline" | "solid" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-[0.72rem] font-medium tracking-tight",
        tone === "solid" ? "bg-fg text-bg" : "border-2 border-fg text-fg",
        className,
      )}
    >
      {code}
    </span>
  );
}
