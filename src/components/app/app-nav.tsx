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
    <nav aria-label="App" className="flex flex-col gap-1">
      {all.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-full px-4 py-2.5 text-[0.9375rem] transition-colors", active ? "bg-accent font-semibold text-on-accent" : "text-on-frame-muted hover:bg-on-frame/[0.07] hover:text-on-frame")}
          >
            <item.icon size={18} weight={active ? "fill" : "regular"} />
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
    <nav aria-label="App tabs" className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-full bg-frame p-1.5 text-on-frame shadow-frame lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-0.5 rounded-full py-2 text-[0.64rem]", active ? "bg-accent font-semibold text-on-accent" : "text-on-frame-muted")}>
                <item.icon size={19} weight={active ? "fill" : "regular"} />
                {item.label.replace("My ", "")}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
