import { cn } from "@/lib/utils";

const COLORS = ["var(--accent)", "#f7a684", "var(--on-violet)", "#fbe6d6"];

/** A one-shot burst of paper flecks from the centre of its parent (which should be positioned). */
export function Sparks({ count = 14, radius = 90, className }: { count?: number; radius?: number; className?: string }) {
  return (
    <span aria-hidden className={cn("pointer-events-none absolute left-1/2 top-1/2 motion-reduce:hidden", className)}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1);
        const dist = radius * (0.65 + ((i * 37) % 10) / 25);
        return (
          <span
            key={i}
            className="spark absolute block rounded-[2px]"
            style={
              {
                width: i % 3 ? 6 : 9,
                height: i % 3 ? 6 : 4,
                background: COLORS[i % COLORS.length],
                animationDelay: `${(i % 4) * 25}ms`,
                "--sx": `${Math.cos(angle) * dist}px`,
                "--sy": `${Math.sin(angle) * dist}px`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </span>
  );
}
