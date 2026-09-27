"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function MobileMenu({ items, signedIn }: { items: { href: string; label: string }[]; signedIn: boolean }) {
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
    <div className="flex items-center gap-1 lg:hidden">
      <ThemeToggle />
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 inline-flex h-10 w-10 items-center justify-center rounded-lg text-fg hover:bg-fg/5"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open ? (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex animate-enter flex-col overflow-y-auto border-t border-line bg-bg px-5 pb-10 pt-4">
          <nav aria-label="Mobile" className="flex flex-col">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="border-b border-line py-4 text-2xl font-semibold tracking-tight">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 grid gap-3">
            {signedIn ? (
              <Link href="/dashboard" className={buttonClasses({ variant: "secondary", size: "lg" })}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className={buttonClasses({ variant: "primary", size: "lg" })}>
                  Start free
                </Link>
                <Link href="/login" className={buttonClasses({ variant: "outline", size: "lg" })}>
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
