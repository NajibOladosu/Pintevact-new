import Link from "next/link";
import { cn } from "@/lib/utils";

export function AccountTabs({ active }: { active: "profile" | "billing" }) {
  return (
    <div className="inline-flex self-start rounded-[10px] bg-sunken p-1">
      {[
        { id: "profile", href: "/account", label: "Profile and security" },
        { id: "billing", href: "/account/billing", label: "Billing" },
      ].map((t) => (
        <Link key={t.id} href={t.href} aria-current={active === t.id ? "page" : undefined} className={cn("rounded-lg px-3.5 py-1.5 text-sm transition-colors", active === t.id ? "bg-raised font-medium text-fg shadow-[0_1px_2px_rgb(17_16_28/0.12)]" : "text-muted hover:text-fg")}>
          {t.label}
        </Link>
      ))}
    </div>
  );
}
