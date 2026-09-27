import Link from "next/link";
import { Flame } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress";

export function XpChip({ xp, levelName, level, percent, streak }: { xp: number; levelName: string; level: number; percent: number; streak: number }) {
  return (
    <Link href="/achievements" className="flex items-center gap-3 rounded-full border border-white/10 bg-night-2 py-1 pl-1 pr-4 transition hover:border-lucid/50">
      <span className="relative flex h-9 w-9 items-center justify-center">
        <ProgressRing value={percent} size={36} stroke={3} className="absolute inset-0 text-paper" />
        <span className="font-mono text-xs font-semibold text-lucid">{level}</span>
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block text-sm font-semibold">{levelName}</span>
        <span className="block font-mono text-[0.68rem] text-mist">{xp.toLocaleString()} XP</span>
      </span>
      <span className="flex items-center gap-1 font-mono text-sm font-semibold text-ember" title={`${streak}-day streak`}>
        <Flame size={16} className={streak > 0 ? "fill-ember" : "opacity-50"} /> {streak}
      </span>
    </Link>
  );
}
