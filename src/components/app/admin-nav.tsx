import Link from "next/link";
import { cn } from "@/lib/utils";

export type AdminSection = "overview" | "courses" | "videos" | "users" | "emails";

const items: { id: AdminSection; href: string; label: string }[] = [
  { id: "overview", href: "/admin", label: "Overview" },
  { id: "courses", href: "/admin/courses", label: "Courses" },
  { id: "videos", href: "/admin/videos", label: "Videos" },
  { id: "users", href: "/admin/users", label: "Learners" },
  { id: "emails", href: "/admin/emails", label: "Emails" },
];

export function AdminNav({ active, title = "Admin", actions }: { active: AdminSection; title?: string; actions?: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <nav aria-label="Admin" className="scrollbar-none -mx-1 flex overflow-x-auto px-1">
        <div className="inline-flex rounded-[0.85rem] bg-sunken p-1">
          {items.map((i) => (
            <Link
              key={i.id}
              href={i.href}
              aria-current={active === i.id ? "page" : undefined}
              className={cn("whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm transition-colors", active === i.id ? "bg-raised font-medium text-fg shadow-[0_1px_2px_rgb(17_16_28/0.12)]" : "text-muted hover:text-fg")}
            >
              {i.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h1 className="text-3xl tracking-tight sm:text-4xl">{title}</h1>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
