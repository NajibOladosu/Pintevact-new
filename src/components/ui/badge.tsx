import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const tones = {
  neutral: "border border-line text-muted bg-raised",
  accent: "bg-accent text-on-accent",
  violet: "bg-violet text-on-violet",
  soft: "bg-violet-soft text-fg",
  success: "bg-fg text-bg",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]", tones[tone], className)} {...props} />;
}
