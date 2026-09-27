import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";

/** The orange closing band used at the bottom of most public pages. */
export function CtaBand({
  eyebrow = "Your next small step",
  title = "See what one honest answer can change.",
  lead = "Good things happen when you take part. Watch. Answer. Take it into your life.",
  href = "/signup?next=/learn/meet-your-mind",
  label = "Start the free course",
  note = "No card needed. Your own pace.",
}: {
  eyebrow?: string;
  title?: string;
  lead?: string;
  href?: string;
  label?: string;
  note?: string;
}) {
  return (
    <section className="shell mt-24 sm:mt-32">
      <div className="grid items-center gap-10 rounded-[2.4rem] bg-accent px-8 py-14 text-on-accent sm:px-16 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div>
          <span className="eyebrow text-on-accent/85">{eyebrow}</span>
          <h2 className="h-section mt-6 max-w-[14ch]">{title}</h2>
          <p className="mt-6 max-w-[42ch] leading-relaxed text-on-accent/85">{lead}</p>
        </div>
        <div>
          <Link href={href} className="flex h-14 items-center justify-between rounded-[0.9rem] bg-raised px-6 text-sm font-semibold text-accent-ink transition-colors hover:bg-bg">
            {label} <ArrowUpRight size={16} aria-hidden />
          </Link>
          {note ? <p className="mt-4 text-[0.8125rem] text-on-accent/80">{note}</p> : null}
        </div>
      </div>
    </section>
  );
}

/** Page opener used on inner public pages: orange eyebrow, big headline, lead. */
export function PageIntro({ eyebrow, title, lead, children, className }: { eyebrow: string; title: React.ReactNode; lead?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={className ?? "shell pt-10 sm:pt-16"}>
      <span className="eyebrow text-accent-ink">{eyebrow}</span>
      <h1 className="h-section mt-6 max-w-[16ch] sm:mt-7">{title}</h1>
      {lead ? <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">{lead}</p> : null}
      {children}
    </div>
  );
}
