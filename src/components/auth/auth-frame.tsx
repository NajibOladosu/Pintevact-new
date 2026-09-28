"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CaretLeft } from "@/components/icons";
import { Logo } from "@/components/brand/logo";
import { AccountSwitch, siteBarRow, type AccountMode } from "@/components/brand/account-pill";
import { cn } from "@/lib/utils";

const EASE = "ease-[cubic-bezier(0.76,0,0.24,1)]";

export function authHrefs(next?: string | null): Record<AccountMode, string> {
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return { signin: `/signin${q}`, signup: `/signup${q}` };
}

/**
 * The auth screen: the same header row as the site (wordmark left, account switch right) above one
 * rounded frame. The papercut art covers one half of the frame and slides across when the mode changes.
 */
export function AuthShell({
  mode,
  artSide,
  onSwitch,
  next,
  children,
}: {
  /** Which side of the switch is lit. Null on recovery pages. */
  mode: AccountMode | null;
  /** Which half the art covers on desktop. */
  artSide: "left" | "right";
  onSwitch?: (m: AccountMode) => void;
  next?: string | null;
  children: React.ReactNode;
}) {
  const [swapCount, setSwapCount] = useState(0);
  const [lastSide, setLastSide] = useState(artSide);
  if (artSide !== lastSide) {
    setLastSide(artSide);
    setSwapCount((n) => n + 1);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className={siteBarRow}>
        <Logo />
        <AccountSwitch mode={mode} onSwitch={onSwitch} hrefs={authHrefs(next)} />
      </header>

      <div className="flex flex-1 px-2 pb-2 sm:px-4 sm:pb-4">
        <main id="main" className="relative isolate grid w-full overflow-hidden rounded-[2rem] bg-frame lg:grid-cols-2 lg:overflow-visible lg:rounded-[2.4rem] lg:border lg:border-line lg:bg-raised lg:shadow-frame">
          {/* Art: full backdrop on phones, sliding half-panel on desktop. */}
          <aside
            aria-hidden
            className={cn(
              "absolute inset-0 -z-10 overflow-hidden transition-[left] duration-[820ms] lg:inset-y-3 lg:right-auto lg:z-20 lg:w-[calc(50%-1.5rem)] lg:rounded-[2rem] lg:shadow-card",
              EASE,
              artSide === "left" ? "lg:left-3" : "lg:left-[calc(50%+0.75rem)]",
            )}
          >
            {/*
              On desktop the art is sized to the whole frame and counter-slides against the panel with the
              same timing, so the picture holds still while the panel pans across it like a window.
              Panel width is 50% - 1.5rem of the frame, so the frame is 200% + 3rem of the panel.
            */}
            <div
              className={cn(
                "absolute inset-0 bg-[url(/art/papercut.webp)] bg-cover bg-center transition-[left] duration-[820ms] lg:-inset-y-3 lg:right-auto lg:w-[calc(200%+3rem)]",
                EASE,
                artSide === "left" ? "lg:-left-3" : "lg:left-[calc(-100%-2.25rem)]",
                swapCount > 0 &&
                  (swapCount % 2
                    ? "motion-safe:animate-[art-breathe_0.82s_cubic-bezier(0.76,0,0.24,1)]"
                    : "motion-safe:animate-[art-breathe-alt_0.82s_cubic-bezier(0.76,0,0.24,1)]"),
              )}
            />
          </aside>
          {children}
        </main>
      </div>
    </div>
  );
}

/** One side of the frame. Inactive panels stay mounted on desktop (under the art) and are hidden on phones. */
export function AuthPanel({ side, active = true, label, children }: { side: "left" | "right"; active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <section
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
      className={cn(
        "relative flex min-w-0 flex-col p-3 sm:p-6 lg:row-start-1 lg:p-[clamp(1.3rem,2.8vw,3rem)]",
        side === "left" ? "lg:col-start-1" : "lg:col-start-2",
        !active && "max-lg:hidden",
      )}
    >
      <div
        className="mx-auto my-auto w-full max-w-[26rem] rounded-[1.6rem] bg-raised/85 px-5 py-8 ring-1 ring-white/40 backdrop-blur-2xl sm:px-8 lg:max-w-[25rem] lg:rounded-none lg:bg-transparent lg:px-0 lg:py-[clamp(1.5rem,4vh,3rem)] lg:ring-0 lg:backdrop-blur-none"
      >
        <div className={cn(active ? "auth-stagger" : "opacity-0 transition-opacity duration-300")}>
          <Link href="/" className="-ml-2 mb-6 inline-flex items-center gap-1.5 rounded-full py-2 pl-2 pr-3 text-[0.8125rem] font-medium text-muted transition-colors hover:bg-fg/5 hover:text-fg">
            <CaretLeft size={14} /> Back to site
          </Link>
          {children}
        </div>
      </div>
      <footer className="mx-auto mt-3 flex w-full max-w-[26rem] items-center justify-between rounded-full bg-raised/85 px-5 py-3 text-[0.8125rem] text-muted backdrop-blur-xl lg:mt-0 lg:max-w-none lg:rounded-none lg:border-t lg:border-line lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-6 lg:backdrop-blur-none">
        <span>© {new Date().getFullYear()} Pintevact</span>
        <span className="flex gap-5">
          <Link href="/contact" className="hover:text-fg">Help</Link>
          <Link href="/" className="hover:text-fg">Home</Link>
        </span>
      </footer>
    </section>
  );
}

/** Keeps the tab title in step when the mode switches without a navigation. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

/** Shared heading block for auth pages: orange eyebrow, big headline, short lead. */
export function AuthHeading({ eyebrow, title, lead, as: H = "h1" }: { eyebrow: string; title: string; lead?: React.ReactNode; as?: "h1" | "h2" }) {
  return (
    <div className="mb-8">
      <span className="eyebrow mb-3.5 text-accent-ink">{eyebrow}</span>
      <H className="text-[clamp(2.1rem,3.2vw,3rem)] font-semibold leading-[1.02] tracking-[-0.04em]">{title}</H>
      {lead ? <p className="mt-3.5 text-sm leading-relaxed text-muted">{lead}</p> : null}
    </div>
  );
}

export function AuthSwapLine({ children }: { children: React.ReactNode }) {
  return <p className="mt-7 text-center text-sm text-muted">{children}</p>;
}

export const swapLinkClass = "font-semibold text-fg underline decoration-fg/40 underline-offset-4 hover:decoration-fg";

/** Recovery pages (forgot, reset, verify): the same frame with one form and the art on the right. */
export function AuthSingle({ children }: { children: React.ReactNode }) {
  return (
    <AuthShell mode={null} artSide="right">
      <AuthPanel side="left" label="Account recovery">
        {children}
      </AuthPanel>
    </AuthShell>
  );
}
