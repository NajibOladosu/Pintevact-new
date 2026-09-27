import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminNav({ active }: { active: "overview" | "courses" | "users" }) {
  const items = [
    { id: "overview", href: "/admin", label: "Overview" },
    { id: "courses", href: "/admin/courses", label: "Courses" },
    { id: "users", href: "/admin/users", label: "Learners" },
  ] as const;
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <h1 className="text-3xl tracking-tight sm:text-4xl">Admin</h1>
      <nav className="inline-flex self-start rounded-[10px] bg-sunken p-1 sm:self-auto">
        {items.map((i) => (
          <Link key={i.id} href={i.href} aria-current={active === i.id ? "page" : undefined} className={cn("rounded-lg px-3.5 py-1.5 text-sm transition-colors", active === i.id ? "bg-raised font-medium text-fg shadow-[0_1px_2px_rgb(17_16_28/0.12)]" : "text-muted hover:text-fg")}>
            {i.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
