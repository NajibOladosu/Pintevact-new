import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink/10 bg-white/60 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-night-2",
        className,
      )}
      {...props}
    />
  );
}
