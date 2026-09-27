"use client";

import { useEffect, useRef, useState } from "react";
import { Faders, X } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

/** Floating settings button (bottom left) that opens a small tray with the theme switch. */
export function SettingsDock({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("fixed bottom-4 left-4 z-50 flex flex-col-reverse items-center gap-2 sm:bottom-5 sm:left-5", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Hide settings" : "Show settings"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-raised text-fg shadow-card ring-1 ring-line transition-transform hover:scale-[1.04]"
      >
        {open ? <X size={18} /> : <Faders size={18} />}
      </button>
      <div
        inert={!open}
        className={cn(
          "flex flex-col items-center gap-1 rounded-full bg-raised p-1.5 shadow-card ring-1 ring-line transition-[opacity,transform] duration-300 ease-[var(--ease-soft)]",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <ThemeToggle className="h-11 w-11 rounded-full" />
      </div>
    </div>
  );
}
