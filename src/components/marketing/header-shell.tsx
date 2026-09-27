"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./mobile-menu";

type NavItem = { href: string; label: string };

/** Pages whose first section is a full-bleed image frame that the header sits on. */
const overlayPaths = new Set(["/"]);

export function HeaderShell({ items, signedIn }: { items: NavItem[]; signedIn: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlay = overlayPaths.has(pathname) && !scrolled;

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled ? "border-b border-line bg-bg/80 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className={cn("relative mx-auto flex max-w-[90rem] items-center justify-between px-[clamp(1.25rem,4.5vw,5rem)] transition-[height] duration-300", scrolled ? "h-[4.5rem]" : "h-24")}>
        <Logo className={cn("relative z-10", overlay && "text-on-frame [text-shadow:0_1px_14px_rgb(3_3_9/0.35)]")} />

        {/* Centre tab: hangs from the top edge at rest, flattens into the bar on scroll. */}
        <nav
          aria-label="Main"
          className={cn(
            "absolute left-1/2 top-0 hidden -translate-x-1/2 items-center gap-1 px-7 transition-[height,box-shadow,background-color] duration-300 lg:flex",
            scrolled ? "h-[4.5rem] [--notch-bg:transparent]" : cn("notch h-[4.6rem]", overlay ? "[--notch-bg:var(--bg)]" : "shadow-[0_18px_30px_-22px_rgb(3_2_12/0.35)]"),
          )}
        >
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("rounded-full px-4 py-2 text-[0.9375rem] transition-colors", active ? "font-semibold text-fg" : "text-muted hover:text-fg")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 hidden items-center gap-1 rounded-full bg-raised p-1 shadow-pill ring-1 ring-line lg:flex">
          {signedIn ? (
            <Link href="/dashboard" className="inline-flex h-11 items-center rounded-full bg-violet px-5 text-[0.9375rem] font-semibold text-on-violet transition-colors hover:bg-[#46248a]">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="inline-flex h-11 items-center rounded-full px-5 text-[0.9375rem] text-muted transition-colors hover:bg-fg/5 hover:text-fg">
                Sign in
              </Link>
              <Link href="/signup" className="inline-flex h-11 items-center rounded-full bg-violet px-5 text-[0.9375rem] font-semibold text-on-violet transition-colors hover:bg-[#46248a]">
                Sign up
              </Link>
            </>
          )}
        </div>

        <MobileMenu items={items} signedIn={signedIn} overlay={overlay} />
      </div>
    </header>
  );
}
