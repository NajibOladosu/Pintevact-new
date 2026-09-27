"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@/components/icons";
import { cn } from "@/lib/utils";

export const THEME_KEY = "pv-theme";

/** Runs before paint (inlined in <head>) so the first frame already has the right theme. */
export const themeInitScript = `(function(){try{var s=localStorage.getItem('${THEME_KEY}');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

function apply(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Sync with the class the init script applied, then follow the OS until the visitor chooses.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const read = () => setDark(document.documentElement.classList.contains("dark"));
    read();
    const onChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(THEME_KEY)) return;
      apply(e.matches);
      read();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    apply(next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      /* storage blocked: the choice lasts for this page only */
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-fg/5 hover:text-fg", className)}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
