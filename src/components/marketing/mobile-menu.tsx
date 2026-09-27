"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Constellation } from "@/components/brand/constellation";

export function MobileMenu({ items, signedIn }: { items: { href: string; label: string }[]; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when navigating.
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
        className="relative z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-paper"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-night px-6 pb-10 pt-24 text-paper">
          <Constellation className="absolute inset-0 h-full w-full text-mist" count={30} seed={3} />
          <nav aria-label="Mobile" className="relative flex flex-col gap-1">
            {items.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="animate-rise border-b border-white/10 py-4 font-display text-4xl italic"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="relative mt-10 flex flex-col gap-3">
            {signedIn ? (
              <Link href="/dashboard" className={buttonClasses({ variant: "primary", size: "lg" })}>
                My dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className={buttonClasses({ variant: "primary", size: "lg" })}>
                  Start free
                </Link>
                <Link href="/login" className={buttonClasses({ variant: "outline", size: "lg", className: "text-paper" })}>
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
