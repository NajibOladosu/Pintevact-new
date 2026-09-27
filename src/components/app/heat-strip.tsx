import { cn } from "@/lib/utils";

export function HeatStrip({ days }: { days: { date: string; xp: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.xp));
  return (
    <div>
      <div className="grid grid-cols-14 gap-1.5" style={{ gridTemplateColumns: `repeat(14, minmax(0, 1fr))` }}>
        {days.map((d) => {
          const level = d.xp === 0 ? 0 : Math.ceil((d.xp / max) * 4);
          return (
            <span
              key={d.date}
              title={`${d.date}: ${d.xp} XP`}
              className={cn(
                "aspect-square rounded-md",
                level === 0 && "bg-white/[0.06]",
                level === 1 && "bg-lucid/25",
                level === 2 && "bg-lucid/50",
                level === 3 && "bg-lucid/75",
                level === 4 && "bg-lucid",
              )}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[0.65rem] uppercase tracking-widest text-mist">
        <span>4 weeks ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
