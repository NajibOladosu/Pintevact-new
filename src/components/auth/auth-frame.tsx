"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CaretLeft } from "@/components/icons";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

const quotes: Record<Mode, { text: string; caption: string }> = {
  signin: { text: "A small moment of reflection can change how you handle the next real one.", caption: "Learn by answering" },
  signup: { text: "You do not need to know every answer about yourself. You need a place to practise finding one.", caption: "Your pace. Your patterns." },
};

function Switcher({ mode, active }: { mode: Mode; active: boolean }) {
  const params = useSearchParams();
  const next = params.get("next");
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <nav aria-label="Account mode" className="relative grid h-[3.25rem] w-[13.5rem] grid-cols-2 gap-1 rounded-full bg-raised/85 p-1 shadow-pill ring-1 ring-line backdrop-blur-xl">
      {active ? (
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-1 left-1 w-[calc(50%-6px)] rounded-full bg-accent transition-transform duration-500 ease-[var(--ease-soft)]",
            mode === "signup" && "translate-x-[calc(100%+4px)]",
          )}
        />
      ) : null}
      {(["signin", "signup"] as const).map((m) => {
        const on = active && m === mode;
        return (
          <Link
            key={m}
            href={(m === "signin" ? "/login" : "/signup") + q}
            aria-current={on ? "page" : undefined}
            className={cn("relative z-10 inline-flex items-center justify-center rounded-full text-[0.9375rem] font-semibold transition-colors duration-200", on ? "text-on-accent" : "text-muted hover:text-fg")}
          >
            {m === "signin" ? "Sign in" : "Sign up"}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * The split auth frame from pintevact.com: a rounded panel holding the form on one side and a
 * papercut artwork on the other. Moving between sign in and sign up slides the art across.
 */
export function AuthFrame({ children, demoNote }: { children: React.ReactNode; demoNote?: React.ReactNode }) {
  const pathname = usePathname();
  const mode: Mode = pathname.startsWith("/signup") ? "signup" : "signin";
  const isSwitchPage = pathname.startsWith("/signup") || pathname.startsWith("/login");
  const quote = quotes[mode];

  const [lastMode, setLastMode] = useState(mode);
  const [swapping, setSwapping] = useState(false);
  if (mode !== lastMode) {
    setLastMode(mode);
    setSwapping(true);
  }
  useEffect(() => {
    if (!swapping) return;
    const t = setTimeout(() => setSwapping(false), 850);
    return () => clearTimeout(t);
  }, [swapping]);

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:place-items-center lg:p-[clamp(0.6rem,1.2vw,1.1rem)]">
      <div
        data-mode={mode}
        className="relative w-full lg:grid lg:min-h-[clamp(42rem,calc(100dvh-2.2rem),66rem)] lg:max-w-[100rem] lg:grid-cols-2 lg:rounded-[2.4rem] lg:border lg:border-line lg:bg-raised lg:shadow-frame"
      >
        {/* Artwork: full-bleed backdrop on phones, sliding panel on desktop. */}
        <aside
          aria-hidden
          className={cn(
            "fixed inset-0 overflow-hidden bg-frame transition-[left] duration-[820ms] ease-[cubic-bezier(0.76,0,0.24,1)]",
            "lg:absolute lg:inset-y-3 lg:right-auto lg:z-20 lg:w-[calc(50%-1.5rem)] lg:rounded-[2rem] lg:shadow-card",
            mode === "signup" ? "lg:left-3" : "lg:left-[calc(50%+0.75rem)]",
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-[url(/art/papercut.webp)] bg-cover transition-[background-position,transform] duration-[820ms] ease-[cubic-bezier(0.76,0,0.24,1)] lg:bg-auto lg:[background-size:auto_100%]",
              mode === "signup" ? "bg-[position:0%_50%]" : "bg-[position:100%_50%]",
              swapping && "scale-[1.06]",
            )}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(3_3_9/0.04)_0%,rgb(3_3_9/0.12)_38%,rgb(3_3_9/0.72)_100%)]" />
          <figure key={mode} className="absolute inset-x-10 bottom-10 hidden max-w-[30rem] animate-enter lg:block">
            <p className="text-[clamp(1.05rem,1.55vw,1.4rem)] leading-[1.45] tracking-[-0.01em] text-white [text-shadow:0_1px_16px_rgb(14_22_40/0.4)]">“{quote.text}”</p>
            <figcaption className="mt-5 flex items-center gap-3">
              <Image src="/art/approach.webp" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <span>
                <strong className="block text-sm font-semibold text-white">The Pintevact approach</strong>
                <span className="block text-[0.78rem] text-white/70">{quote.caption}</span>
              </span>
            </figcaption>
          </figure>
        </aside>

        {/* Top bar: wordmark and the sign in / sign up switch. */}
        <header className="relative z-30 flex h-24 items-center justify-between px-4 sm:px-6 lg:absolute lg:inset-x-0 lg:top-0 lg:px-[clamp(1.5rem,2.2vw,2.2rem)]">
          <Link
            href="/"
            className={cn(
              "wordmark inline-flex h-[3.25rem] items-center rounded-full bg-raised px-4 text-[1.5rem] leading-none text-fg shadow-pill transition-opacity hover:opacity-85",
              mode === "signin" && "lg:bg-transparent lg:px-1 lg:shadow-none",
            )}
          >
            Pintevact
          </Link>
          <Suspense fallback={<div className="h-[3.25rem] w-[13.5rem]" />}>
            <Switcher mode={mode} active={isSwitchPage} />
          </Suspense>
        </header>

        {/* Form column. */}
        <section className={cn("relative z-10 flex min-w-0 flex-col px-4 pb-6 sm:px-6 lg:row-start-1 lg:px-[clamp(1.3rem,2.8vw,3rem)] lg:pb-8 lg:pt-24", mode === "signup" ? "lg:col-start-2" : "lg:col-start-1")}>
          <main
            id="main"
            className="mx-auto my-auto w-full max-w-[26rem] rounded-[2rem] bg-raised/80 px-5 py-8 ring-1 ring-white/40 backdrop-blur-2xl sm:px-8 lg:max-w-[25rem] lg:rounded-none lg:bg-transparent lg:px-0 lg:py-[clamp(2rem,4.5vh,3.2rem)] lg:ring-0 lg:backdrop-blur-none"
          >
            <div key={pathname} className="animate-enter">
              <Link href="/" className="-ml-2 mb-6 inline-flex items-center gap-1.5 rounded-full py-2 pl-2 pr-3 text-[0.8125rem] font-medium text-muted transition-colors hover:bg-fg/5 hover:text-fg lg:mb-8">
                <CaretLeft size={14} /> Back to site
              </Link>
              {children}
              {demoNote}
            </div>
          </main>
          <footer className="mx-auto mt-6 flex w-full max-w-[26rem] items-center justify-between rounded-full bg-raised/80 px-5 py-3 text-[0.8125rem] text-muted backdrop-blur-xl lg:mt-0 lg:max-w-none lg:rounded-none lg:border-t lg:border-line lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-6 lg:backdrop-blur-none">
            <span>© {new Date().getFullYear()} Pintevact</span>
            <span className="flex gap-5">
              <Link href="/contact" className="hover:text-fg">Help</Link>
              <Link href="/" className="hover:text-fg">Home</Link>
            </span>
          </footer>
        </section>
      </div>
    </div>
  );
}

/** Shared heading block for auth pages: orange eyebrow, big headline, short lead. */
export function AuthHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <span className="eyebrow mb-3.5 text-accent-ink">{eyebrow}</span>
      <h1 className="text-[clamp(2.1rem,3.2vw,3rem)] font-semibold leading-[1.02] tracking-[-0.04em]">{title}</h1>
      {lead ? <p className="mt-3.5 text-sm leading-relaxed text-muted">{lead}</p> : null}
    </div>
  );
}

export function AuthSwapLine({ children }: { children: React.ReactNode }) {
  return <p className="mt-7 text-center text-sm text-muted">{children}</p>;
}

export const swapLinkClass = "font-semibold text-fg underline decoration-fg/40 underline-offset-4 hover:decoration-fg";
