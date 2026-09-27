import { BarChart3, Brain, Lightbulb, PenLine, SlidersHorizontal } from "lucide-react";
import type { InteractionType } from "@/lib/types";

export const interactionMeta: Record<InteractionType, { label: string; icon: typeof Brain; color: string }> = {
  quiz: { label: "Checkpoint", icon: Brain, color: "bg-lucid" },
  reflection: { label: "Reflection", icon: PenLine, color: "bg-ember" },
  poll: { label: "Poll", icon: BarChart3, color: "bg-iris" },
  scale: { label: "Self-rating", icon: SlidersHorizontal, color: "bg-tide" },
  insight: { label: "Insight", icon: Lightbulb, color: "bg-sun" },
};

export function InteractionIcon({ type, size = 14 }: { type: InteractionType; size?: number }) {
  const meta = interactionMeta[type];
  return (
    <span title={meta.label} className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-ink text-ink ${meta.color}`}>
      <meta.icon size={size} aria-hidden />
      <span className="sr-only">{meta.label}</span>
    </span>
  );
}
