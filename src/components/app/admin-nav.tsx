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
      <div>
        <p className="eyebrow text-ember">Admin</p>
        <h1 className="mt-2 text-5xl">Mission control</h1>
      </div>
      <nav className="inline-flex rounded-full border border-white/10 bg-night-2 p-1">
        {items.map((i) => (
          <Link key={i.id} href={i.href} aria-current={active === i.id ? "page" : undefined} className={cn("rounded-full px-4 py-2 text-sm font-semibold", active === i.id ? "bg-ember text-ink" : "text-mist hover:text-paper")}>
            {i.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
