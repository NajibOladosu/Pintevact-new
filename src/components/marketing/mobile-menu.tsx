"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileMenu({ items, signedIn, overlay }: { items: { href: string; label: string }[]; signedIn: boolean; overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative z-50 inline-flex h-12 items-center gap-3 rounded-full py-1 pl-5 pr-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] ring-1 backdrop-blur-md transition-colors",
          overlay && !open ? "bg-frame/45 text-on-frame ring-on-frame/25" : "bg-raised text-fg ring-line",
        )}
      >
        {open ? "Close" : "Menu"}
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-on-accent">{open ? <X size={16} /> : <Menu size={16} />}</span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-40 flex animate-enter flex-col overflow-y-auto bg-bg px-5 pb-10 pt-28">
          <nav aria-label="Mobile" className="auth-stagger flex flex-col">
            {items.map((item, i) => (
              <Link key={item.href} href={item.href} className="flex items-baseline gap-4 border-b border-line py-4 text-[2rem] font-semibold tracking-[-0.04em]">
                <span className="text-xs font-semibold tracking-normal text-accent-ink">{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </Link>
            ))}
            <Link href="/contact" className="flex items-baseline gap-4 border-b border-line py-4 text-[2rem] font-semibold tracking-[-0.04em]">
              <span className="text-xs font-semibold tracking-normal text-accent-ink">{String(items.length + 1).padStart(2, "0")}</span>
              Contact
            </Link>
          </nav>
          <div className="mt-auto grid gap-3 pt-10">
            {signedIn ? (
              <Link href="/dashboard" className={buttonClasses({ variant: "violet", size: "lg" })}>
                Dashboard <ArrowUpRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/signup" className={buttonClasses({ variant: "primary", size: "lg" })}>
                  Sign up free <ArrowUpRight size={16} />
                </Link>
                <Link href="/signin" className={buttonClasses({ variant: "outline", size: "lg" })}>
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
