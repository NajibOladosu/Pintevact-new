import Link from "next/link";
import { cn } from "@/lib/utils";

/** Wordmark: PINTEVACT in Outfit caps, with an orange station dot. */
export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2 text-fg", className)} aria-label="Pintevact home">
      <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125" />
      <span className="wordmark text-[1.05rem] leading-none">Pintevact</span>
    </Link>
  );
}
