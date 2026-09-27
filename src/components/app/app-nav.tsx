"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
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
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ y: number; h: number } | null>(null);

  // The orange pill slides from the previous item to the new one.
  useLayoutEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    setPill(el ? { y: el.offsetTop, h: el.offsetHeight } : null);
  }, [pathname]);

  return (
    <nav ref={navRef} aria-label="App" className="relative flex flex-col gap-1">
      <span
        aria-hidden
        className={cn("absolute inset-x-0 top-0 rounded-full bg-accent shadow-[0_10px_24px_-10px_rgb(238_66_23/0.8)] transition-[transform,height,opacity] duration-500 ease-[var(--ease-out-expo)]", !pill && "opacity-0")}
        style={pill ? { transform: `translateY(${pill.y}px)`, height: pill.h } : undefined}
      />
      {all.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn("group relative flex items-center gap-3 rounded-full px-4 py-2.5 text-[0.9375rem] transition-colors duration-300", active ? "font-semibold text-on-accent" : "text-on-frame-muted hover:bg-on-frame/[0.07] hover:text-on-frame")}
          >
            <item.icon size={18} weight={active ? "fill" : "regular"} className="transition-transform duration-300 group-hover:scale-110" />
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
              <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-0.5 rounded-full py-2 text-[0.64rem] transition-[background-color,color,transform] duration-300 active:scale-95", active ? "bg-accent font-semibold text-on-accent" : "text-on-frame-muted")}>
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
