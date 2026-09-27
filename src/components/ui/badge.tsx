import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const tones = {
  neutral: "border border-line-strong text-muted",
  accent: "bg-accent text-on-accent",
  violet: "bg-violet text-on-violet",
  soft: "bg-violet-soft text-fg",
  success: "bg-fg text-bg",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", tones[tone], className)} {...props} />;
}
