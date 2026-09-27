import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, accent = "text-lucid", hint }: { label: string; value: string | number; icon: LucideIcon; accent?: string; hint?: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-night-2 p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-mist">{label}</p>
        <Icon size={18} className={accent} />
      </div>
      <p className={cn("mt-3 font-display text-4xl", accent)}>{value}</p>
      {hint ? <p className="mt-1 text-sm text-mist">{hint}</p> : null}
    </div>
  );
}
