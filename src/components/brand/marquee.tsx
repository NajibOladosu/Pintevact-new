import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Marquee({ items, className, separator = "✺" }: { items: ReactNode[]; className?: string; separator?: ReactNode }) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-8">
          <span>{item}</span>
          <span className="text-ember">{separator}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("flex overflow-hidden whitespace-nowrap", className)}>
      <div className="flex animate-marquee">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
