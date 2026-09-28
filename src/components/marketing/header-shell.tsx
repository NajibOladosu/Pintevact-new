"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { AccountPillLinks, accountPillFrame } from "@/components/brand/account-pill";
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

  // A soft pill glides to whichever link the pointer (or focus) is on.
  const navRef = useRef<HTMLElement>(null);
  const [glide, setGlide] = useState<{ x: number; w: number; on: boolean }>({ x: 0, w: 0, on: false });
  const moveGlide = (el: HTMLElement) => {
    const nav = navRef.current;
    if (!nav) return;
    const n = nav.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setGlide({ x: r.left - n.left, w: r.width, on: true });
  };

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled ? "border-b border-line bg-bg/80 backdrop-blur-xl" : "border-b border-transparent",
        // backdrop-filter makes the header the containing block for fixed children,
        // which would clip the mobile menu overlay to the header's height.
        "has-[[aria-expanded=true]]:transition-none has-[[aria-expanded=true]]:[backdrop-filter:none]",
      )}
    >
      <div className={cn("relative mx-auto flex max-w-[90rem] items-center justify-between px-[clamp(1.25rem,4.5vw,5rem)] transition-[height] duration-300", scrolled ? "h-[4.5rem]" : "h-24")}>
        <Logo className={cn("relative z-10", overlay && "text-on-frame [text-shadow:0_1px_14px_rgb(3_3_9/0.35)]")} />

        {/* Centre tab: hangs from the top edge at rest, flattens into the bar on scroll. */}
        <nav
          ref={navRef}
          aria-label="Main"
          onPointerLeave={() => setGlide((g) => ({ ...g, on: false }))}
          className={cn(
            "absolute left-1/2 top-0 hidden -translate-x-1/2 items-center gap-1 px-7 transition-[height,box-shadow,background-color] duration-300 lg:flex",
            scrolled ? "h-[4.5rem] [--notch-bg:transparent]" : cn("notch h-[4.6rem]", overlay ? "[--notch-bg:var(--bg)]" : "shadow-[0_18px_30px_-22px_rgb(3_2_12/0.35)]"),
          )}
        >
          <span
            aria-hidden
            className={cn("pointer-events-none absolute top-1/2 h-10 rounded-full bg-fg/[0.06] transition-[transform,width,opacity] duration-500 ease-[var(--ease-out-expo)]", glide.on ? "opacity-100" : "opacity-0")}
            style={{ width: glide.w, transform: `translate(${glide.x}px, -50%)`, left: 0 }}
          />
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onPointerEnter={(e) => moveGlide(e.currentTarget)}
                onFocus={(e) => moveGlide(e.currentTarget)}
                onBlur={() => setGlide((g) => ({ ...g, on: false }))}
                className={cn("relative rounded-full px-4 py-2 text-[0.9375rem] transition-colors", active ? "font-semibold text-fg" : "text-muted hover:text-fg")}
              >
                {item.label}
                {active ? <span aria-hidden className="absolute inset-x-4 -bottom-0.5 h-0.5 origin-left animate-[grow-x_0.6s_var(--ease-out-expo)_both] rounded-full bg-accent" /> : null}
              </Link>
            );
          })}
        </nav>

        {signedIn ? (
          <div className={cn(accountPillFrame, "hidden grid-cols-1 lg:grid")}>
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-violet text-[0.9375rem] font-semibold text-on-violet transition-colors hover:bg-[#46248a]">
              Dashboard
            </Link>
          </div>
        ) : (
          <AccountPillLinks className="hidden lg:grid" />
        )}

        <MobileMenu items={items} signedIn={signedIn} overlay={overlay} />
      </div>
    </header>
  );
}
