import { cn } from "@/lib/utils";
import { themeClasses } from "@/lib/course";
import type { CourseTheme } from "@/lib/types";

/** Generative course artwork: themed field, orbit rings and an oversized glyph. */
export function CourseCover({ theme, glyph, className, size = "md" }: { theme: CourseTheme; glyph: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const t = themeClasses[theme];
  return (
    <div className={cn("relative isolate overflow-hidden", t.bg, className)} aria-hidden>
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full text-ink">
        {[18, 34, 52, 72, 94].map((r, i) => (
          <circle key={r} cx="150" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity={0.18 - i * 0.02} strokeWidth="0.8" strokeDasharray={i % 2 ? "2 3" : undefined} />
        ))}
        <circle cx="150" cy="60" r="6" fill="var(--color-ink)" />
        <circle cx={150 + 52 * Math.cos(0.9)} cy={60 + 52 * Math.sin(0.9)} r="3.2" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1" />
        <circle cx={150 + 94 * Math.cos(3.6)} cy={60 + 94 * Math.sin(3.6)} r="2.4" fill="var(--color-ink)" />
      </svg>
      <span
        className={cn(
          "absolute bottom-[-0.12em] left-[0.1em] font-display leading-none text-ink/90 mix-blend-multiply",
          size === "sm" && "text-[5rem]",
          size === "md" && "text-[8rem]",
          size === "lg" && "text-[12rem]",
        )}
      >
        {glyph}
      </span>
      <div className="grain absolute inset-0" />
    </div>
  );
}
