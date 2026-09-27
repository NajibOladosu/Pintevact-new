"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CreditCard, LogOut, Shield, UserRound } from "lucide-react";
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
  return (
    <div className="relative" ref={ref}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="rounded-full ring-offset-2 ring-offset-night focus-visible:ring-2">
        <Avatar name={name ?? email} size={40} />
        <span className="sr-only">Open user menu</span>
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-12 z-50 w-64 animate-rise overflow-hidden rounded-3xl border border-white/10 bg-night-2 p-2 text-paper shadow-glow">
          <div className="px-3 py-2">
            <p className="truncate font-semibold">{name ?? "Learner"}</p>
            <p className="truncate text-sm text-mist">{email}</p>
          </div>
          <div className="my-1 h-px bg-white/10" />
          <Link role="menuitem" href="/account" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-white/5" onClick={() => setOpen(false)}>
            <UserRound size={17} /> Account
          </Link>
          <Link role="menuitem" href="/account/billing" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-white/5" onClick={() => setOpen(false)}>
            <CreditCard size={17} /> Billing
          </Link>
          {isAdmin ? (
            <Link role="menuitem" href="/admin" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-white/5" onClick={() => setOpen(false)}>
              <Shield size={17} /> Admin
            </Link>
          ) : null}
          <form action="/auth/signout" method="post">
            <button role="menuitem" type="submit" className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-ember-2 hover:bg-white/5">
              <LogOut size={17} /> Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
