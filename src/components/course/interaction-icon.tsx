import { BarChart3, Brain, Lightbulb, PenLine, SlidersHorizontal, type IconType } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { InteractionType } from "@/lib/types";

export const interactionMeta: Record<InteractionType, { label: string; icon: IconType }> = {
  quiz: { label: "Checkpoint", icon: Brain },
  reflection: { label: "Reflection", icon: PenLine },
  poll: { label: "Poll", icon: BarChart3 },
  scale: { label: "Self-rating", icon: SlidersHorizontal },
  insight: { label: "Insight", icon: Lightbulb },
};

export function InteractionIcon({ type, size = 16, className }: { type: InteractionType; size?: number; className?: string }) {
  const meta = interactionMeta[type];
  return (
    <span title={meta.label} className={cn("inline-flex text-muted", className)}>
      <meta.icon size={size} aria-hidden />
      <span className="sr-only">{meta.label}</span>
    </span>
  );
}
