import Link from "next/link";
import { cn } from "@/lib/utils";

/** Wordmark: "Pintevact" set in Outfit semibold, as on pintevact.com. */
export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("wordmark inline-flex items-center text-[1.5rem] leading-none text-fg transition-opacity hover:opacity-80", className)} aria-label="Pintevact home">
      Pintevact
    </Link>
  );
}
