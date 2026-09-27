"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BookOpen, LayoutDashboard, NotebookPen, Shield, UserRound } from "lucide-react";
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
    <nav aria-label="App" className="flex flex-col gap-1">
      {all.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition",
              active ? "bg-lucid text-ink" : "text-mist hover:bg-white/5 hover:text-paper",
            )}
          >
            <item.icon size={19} className={cn(!active && "transition group-hover:scale-110")} />
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
    <nav aria-label="App tabs" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-night/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-[0.68rem] font-medium", active ? "text-lucid" : "text-mist")}>
                <span className={cn("flex h-8 w-12 items-center justify-center rounded-full transition", active && "bg-lucid/15")}>
                  <item.icon size={20} />
                </span>
                {item.label.replace("My ", "")}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
