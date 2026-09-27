import Link from "next/link";
import { Flame } from "@/components/icons";

export function XpChip({ xp, levelName, level, streak }: { xp: number; levelName: string; level: number; streak: number }) {
  return (
    <Link href="/achievements" className="tabular flex h-10 items-center gap-3 rounded-full px-4 text-[0.8125rem] text-muted transition-colors hover:bg-fg/[0.05] hover:text-fg">
      <span className="hidden sm:inline">
        <span className="font-medium text-fg">{levelName}</span> · Level {level} · {xp.toLocaleString()} XP
      </span>
      <span className="sm:hidden">{xp.toLocaleString()} XP</span>
      <span className="flex items-center gap-1" title={`${streak}-day streak`}>
        <Flame size={16} weight={streak > 0 ? "fill" : "regular"} className={streak > 0 ? "text-accent-ink" : undefined} /> {streak}
        <span className="sr-only">day streak</span>
      </span>
    </Link>
  );
}
