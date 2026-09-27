"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BookOpen, LayoutDashboard, NotebookPen, Shield, UserRound } from "@/components/icons";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "My courses", icon: BookOpen },
  { href: "/reflections", label: "Reflections", icon: NotebookPen },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/account", label: "Account", icon: UserRound },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const all = isAdmin ? [...items, { href: "/admin", label: "Admin", icon: Shield }] : items;
  return (
    <nav aria-label="App" className="flex flex-col gap-0.5">
      {all.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", active ? "bg-fg/[0.06] font-medium text-fg" : "text-muted hover:bg-fg/[0.04] hover:text-fg")}
          >
            <item.icon size={18} weight={active ? "fill" : "regular"} className={active ? "text-accent-ink" : undefined} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="App tabs" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-[0.68rem]", active ? "font-medium text-fg" : "text-subtle")}>
                <item.icon size={20} weight={active ? "fill" : "regular"} className={active ? "text-accent-ink" : undefined} />
                {item.label.replace("My ", "")}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
