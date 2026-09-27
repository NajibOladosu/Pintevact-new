import Link from "next/link";
import { cn } from "@/lib/utils";

export function AccountTabs({ active }: { active: "profile" | "billing" }) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-night-2 p-1">
      {[
        { id: "profile", href: "/account", label: "Profile & security" },
        { id: "billing", href: "/account/billing", label: "Billing" },
      ].map((t) => (
        <Link key={t.id} href={t.href} aria-current={active === t.id ? "page" : undefined} className={cn("rounded-full px-5 py-2 text-sm font-semibold transition", active === t.id ? "bg-lucid text-ink" : "text-mist hover:text-paper")}>
          {t.label}
        </Link>
      ))}
    </div>
  );
}
