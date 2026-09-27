import Link from "next/link";
import { cn } from "@/lib/utils";

/** The Pintevact mark: an eye-like iris orbit — "see yourself". */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden>
      <circle cx="20" cy="20" r="18" fill="var(--color-ink)" />
      <path d="M6 20c4-7 9-10 14-10s10 3 14 10c-4 7-9 10-14 10S10 27 6 20Z" fill="var(--color-paper)" />
      <circle cx="20" cy="20" r="6.5" fill="var(--color-ember)" />
      <circle cx="20" cy="20" r="2.6" fill="var(--color-ink)" />
      <circle cx="22.4" cy="17.6" r="1.3" fill="var(--color-lucid)" />
    </svg>
  );
}

export function Logo({ href = "/", className, tone = "ink" }: { href?: string; className?: string; tone?: "ink" | "paper" }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Pintevact home">
      <LogoMark className="transition-transform duration-500 group-hover:rotate-[20deg]" />
      <span
        className={cn(
          "font-display text-[1.45rem] font-semibold leading-none tracking-tight",
          tone === "paper" ? "text-paper" : "text-ink",
        )}
      >
        Pintevact
      </span>
    </Link>
  );
}
