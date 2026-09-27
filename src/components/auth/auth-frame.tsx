"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CaretLeft } from "@/components/icons";
import { Logo } from "@/components/brand/logo";
import { AccountSwitch, siteBarRow, type AccountMode } from "@/components/brand/account-pill";
import { cn } from "@/lib/utils";

const quotes: Record<AccountMode, { text: string; caption: string }> = {
  signin: { text: "A small moment of reflection can change how you handle the next real one.", caption: "Learn by answering" },
  signup: { text: "You do not need to know every answer about yourself. You need a place to practise finding one.", caption: "Your pace. Your patterns." },
};

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
  const quote = quotes[artSide === "left" ? "signup" : "signin"];
  const [swapKey, setSwapKey] = useState(0);
  const [lastSide, setLastSide] = useState(artSide);
  if (artSide !== lastSide) {
    setLastSide(artSide);
    setSwapKey((k) => k + 1);
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
            <div
              key={swapKey}
              className={cn(
                "absolute inset-0 bg-[url(/art/papercut.webp)] bg-cover transition-[background-position] duration-[820ms] lg:[background-size:auto_100%]",
                EASE,
                artSide === "left" ? "bg-[position:0%_50%]" : "bg-[position:100%_50%]",
                swapKey > 0 && "motion-safe:animate-[art-breathe_0.82s_cubic-bezier(0.76,0,0.24,1)]",
              )}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(3_3_9/0.04)_0%,rgb(3_3_9/0.12)_38%,rgb(3_3_9/0.72)_100%)]" />
            {swapKey > 0 ? <div key={`sheen-${swapKey}`} className="absolute inset-0 motion-safe:animate-[art-sheen_0.8s_ease-out_both] bg-[linear-gradient(100deg,transparent_18%,rgb(255_255_255/0.22)_48%,transparent_78%)] mix-blend-screen" /> : null}
            <figure key={`q-${artSide}`} className="absolute inset-x-10 bottom-10 hidden max-w-[30rem] animate-enter lg:block">
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
