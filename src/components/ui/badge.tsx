import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const tones = {
  ink: "bg-ink text-paper",
  ember: "bg-ember text-ink",
  lucid: "bg-lucid text-ink",
  iris: "bg-iris text-white",
  tide: "bg-tide text-ink",
  sun: "bg-sun text-ink",
  blush: "bg-blush text-ink",
  outline: "border border-current bg-transparent",
  glass: "bg-white/10 text-paper backdrop-blur border border-white/15",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "ink", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[0.68rem] font-medium uppercase tracking-wider",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
