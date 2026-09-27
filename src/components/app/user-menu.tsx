"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CreditCard, LogOut, Shield, UserRound } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";

export function UserMenu({ name, email, isAdmin }: { name: string | null; email: string; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const item = "flex items-center gap-3 rounded-full px-3.5 py-2 text-sm text-muted hover:bg-fg/[0.05] hover:text-fg";
  return (
    <div className="relative" ref={ref}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="rounded-full">
        <Avatar name={name ?? email} size={40} />
        <span className="sr-only">Open user menu</span>
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-12 z-50 w-64 animate-enter rounded-[1.1rem] bg-raised ring-1 ring-line p-2 shadow-card">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{name ?? "Learner"}</p>
            <p className="truncate text-xs text-subtle">{email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <Link role="menuitem" href="/account" className={item} onClick={() => setOpen(false)}>
            <UserRound size={16} /> Account
          </Link>
          <Link role="menuitem" href="/account/billing" className={item} onClick={() => setOpen(false)}>
            <CreditCard size={16} /> Billing
          </Link>
          {isAdmin ? (
            <Link role="menuitem" href="/admin" className={item} onClick={() => setOpen(false)}>
              <Shield size={16} /> Admin
            </Link>
          ) : null}
          <form action="/auth/signout" method="post">
            <button role="menuitem" type="submit" className={`${item} w-full text-left`}>
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
