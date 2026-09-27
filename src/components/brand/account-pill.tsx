"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type AccountMode = "signin" | "signup";

/** Shared geometry so the pill sits in exactly the same place on the site header and the auth page. */
export const accountPillFrame = "relative z-10 grid h-[3.25rem] w-[13.5rem] grid-cols-2 gap-1 rounded-full bg-raised p-1 shadow-pill ring-1 ring-line";
const cell = "relative z-10 inline-flex items-center justify-center rounded-full text-[0.9375rem] transition-colors duration-200";

/** Header version: two links, with Sign up filled violet. */
export function AccountPillLinks({ className }: { className?: string }) {
  return (
    <div className={cn(accountPillFrame, className)}>
      <Link href="/signin" className={cn(cell, "text-muted hover:bg-fg/5 hover:text-fg")}>
        Sign in
      </Link>
      <Link href="/signup" className={cn(cell, "bg-violet font-semibold text-on-violet hover:bg-[#46248a]")}>
        Sign up
      </Link>
    </div>
  );
}

/** Auth version: a switch with an orange indicator that slides to the active side. */
export function AccountSwitch({ mode, onSwitch, hrefs, className }: { mode: AccountMode | null; onSwitch?: (m: AccountMode) => void; hrefs: Record<AccountMode, string>; className?: string }) {
  return (
    <nav aria-label="Account" className={cn(accountPillFrame, "backdrop-blur-xl", className)}>
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-1 left-1 w-[calc(50%-6px)] rounded-full bg-accent shadow-[0_6px_16px_-6px_rgb(238_66_23/0.7)] transition-[transform,opacity] duration-500 ease-[var(--ease-soft)]",
          mode === "signup" && "translate-x-[calc(100%+4px)]",
          !mode && "opacity-0",
        )}
      />
      {(["signin", "signup"] as const).map((m) => {
        const on = m === mode;
        return (
          <Link
            key={m}
            href={hrefs[m]}
            aria-current={on ? "page" : undefined}
            onClick={(e) => {
              if (!onSwitch || e.metaKey || e.ctrlKey || e.shiftKey) return;
              e.preventDefault();
              onSwitch(m);
            }}
            className={cn(cell, "font-semibold", on ? "text-on-accent" : "text-muted hover:text-fg")}
          >
            {m === "signin" ? "Sign in" : "Sign up"}
          </Link>
        );
      })}
    </nav>
  );
}

/** The header row geometry shared by the site header and the auth page. */
export const siteBarRow = "relative mx-auto flex h-24 w-full max-w-[90rem] items-center justify-between px-[clamp(1.25rem,4.5vw,5rem)]";
