"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { MEMBERSHIP, yearlySavingsPercent, type BillingInterval } from "@/lib/pricing";
import { cn, formatPrice } from "@/lib/utils";

export function PricingPlans({ signedIn, isMember, minCoursePrice }: { signedIn: boolean; isMember: boolean; minCoursePrice: number }) {
  const [interval, setInterval] = useState<BillingInterval>("year");
  const plan = MEMBERSHIP[interval];
  const perMonth = interval === "year" ? Math.round(plan.amountCents / 12) : plan.amountCents;

  return (
    <div data-reveal="list" className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col rounded-[2rem] bg-raised p-8 ring-1 ring-line sm:p-10">
        <h2 className="eyebrow text-muted">One course</h2>
        <p className="mt-3 text-sm text-muted">For when you know exactly what you want to work on.</p>
        <p className="mt-8 flex items-baseline gap-2">
          <span className="text-sm text-subtle">from</span>
          <span className="tabular text-[clamp(3rem,5vw,4.2rem)] font-semibold leading-none tracking-[-0.05em]">{formatPrice(minCoursePrice)}</span>
        </p>
        <p className="mt-1 text-sm text-subtle">One-time, yours to keep</p>
        <ul className="mt-8 flex-1 space-y-3 border-t border-line pt-7 text-[0.9375rem]">
          {["Lifetime access to that course", "Every lesson and checkpoint", "Certificate when you finish", "30-day money-back guarantee"].map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={16} className="mt-0.5 shrink-0 text-accent-ink" /> {f}
            </li>
          ))}
        </ul>
        <Link href="/courses" className="mt-9 flex h-[3.25rem] items-center justify-between rounded-[0.9rem] bg-fg px-5 text-[0.8125rem] font-semibold text-bg transition-colors hover:bg-fg/85">
          Browse courses <ArrowUpRight size={15} aria-hidden className="arrow-nudge" />
        </Link>
      </div>

      <div className="flex flex-col rounded-[2rem] bg-violet p-8 text-on-violet shadow-frame sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="eyebrow text-on-violet-muted">All-Access</h2>
            <p className="mt-3 text-sm text-on-violet-muted">Every course, including the ones we release next.</p>
          </div>
          <div role="radiogroup" aria-label="Billing interval" className="inline-flex rounded-full bg-black/25 p-1">
            {(["month", "year"] as const).map((i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={interval === i}
                onClick={() => setInterval(i)}
                className={cn("rounded-full px-4 py-1.5 text-[0.8125rem] font-semibold transition-colors", interval === i ? "bg-accent text-on-accent" : "text-on-violet-muted hover:text-on-violet")}
              >
                {MEMBERSHIP[i].label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-8 flex items-baseline gap-2">
          <span className="tabular text-[clamp(3rem,5vw,4.2rem)] font-semibold leading-none tracking-[-0.05em]">{formatPrice(perMonth)}</span>
          <span className="text-sm text-on-violet-muted">per month</span>
        </p>
        <p className="mt-1 text-sm text-on-violet-muted">
          {interval === "year" ? `Billed ${formatPrice(plan.amountCents)} yearly, save ${yearlySavingsPercent()}%` : "Billed monthly"}
        </p>
        <ul className="mt-8 flex-1 space-y-3 border-t border-on-violet/15 pt-7 text-[0.9375rem]">
          {["Every course, and every new one", "Early access to new courses", "Live workshops for members", "Cancel in one click, any time"].map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={16} className="mt-0.5 shrink-0 text-accent" /> {f}
            </li>
          ))}
        </ul>
        {isMember ? (
          <Link href="/account/billing" className={buttonClasses({ size: "lg", className: "mt-9 w-full rounded-[0.9rem]" })}>
            Manage membership
          </Link>
        ) : signedIn ? (
          <form action="/api/stripe/checkout" method="post" className="mt-9">
            <input type="hidden" name="mode" value="membership" />
            <input type="hidden" name="interval" value={interval} />
            <button type="submit" className={buttonClasses({ size: "lg", className: "w-full rounded-[0.9rem]" })}>
              Unlock All-Access
            </button>
          </form>
        ) : (
          <Link href={`/signup?next=${encodeURIComponent("/pricing")}`} className={buttonClasses({ size: "lg", className: "mt-9 w-full rounded-[0.9rem]" })}>
            Unlock All-Access
          </Link>
        )}
      </div>
    </div>
  );
}
