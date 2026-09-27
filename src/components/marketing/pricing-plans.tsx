"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { MEMBERSHIP, yearlySavingsPercent, type BillingInterval } from "@/lib/pricing";
import { cn, formatPrice } from "@/lib/utils";

export function PricingPlans({ signedIn, isMember, minCoursePrice }: { signedIn: boolean; isMember: boolean; minCoursePrice: number }) {
  const [interval, setInterval] = useState<BillingInterval>("year");
  const plan = MEMBERSHIP[interval];
  const perMonth = interval === "year" ? Math.round(plan.amountCents / 12) : plan.amountCents;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="flex flex-col rounded-2xl border border-line p-7 sm:p-8">
        <h2 className="text-lg font-semibold">One course</h2>
        <p className="mt-1 text-sm text-muted">For when you know exactly what you want to work on.</p>
        <p className="mt-8 flex items-baseline gap-2">
          <span className="text-sm text-subtle">from</span>
          <span className="tabular text-4xl font-semibold tracking-tight">{formatPrice(minCoursePrice)}</span>
        </p>
        <p className="mt-1 text-sm text-subtle">One-time, yours to keep</p>
        <ul className="mt-8 flex-1 space-y-3 text-sm">
          {["Lifetime access to that course", "Every lesson and checkpoint", "Certificate when you finish", "30-day money-back guarantee"].map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={16} className="mt-0.5 shrink-0 text-accent-ink" /> {f}
            </li>
          ))}
        </ul>
        <Link href="/courses" className={buttonClasses({ variant: "outline", className: "mt-8 w-full" })}>
          Browse courses
        </Link>
      </div>

      <div className="flex flex-col rounded-2xl bg-violet p-7 text-on-violet sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">All-Access</h2>
            <p className="mt-1 text-sm text-on-violet-muted">Every course, including the ones we release next.</p>
          </div>
          <div role="radiogroup" aria-label="Billing interval" className="inline-flex rounded-lg bg-black/20 p-1">
            {(["month", "year"] as const).map((i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={interval === i}
                onClick={() => setInterval(i)}
                className={cn("rounded-md px-3 py-1 text-sm transition-colors", interval === i ? "bg-on-violet text-violet" : "text-on-violet-muted hover:text-on-violet")}
              >
                {MEMBERSHIP[i].label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-8 flex items-baseline gap-2">
          <span className="tabular text-4xl font-semibold tracking-tight">{formatPrice(perMonth)}</span>
          <span className="text-sm text-on-violet-muted">per month</span>
        </p>
        <p className="mt-1 text-sm text-on-violet-muted">
          {interval === "year" ? `Billed ${formatPrice(plan.amountCents)} yearly, save ${yearlySavingsPercent()}%` : "Billed monthly"}
        </p>
        <ul className="mt-8 flex-1 space-y-3 text-sm">
          {["All seven courses, and every new one", "Early access to new courses", "Live workshops for members", "Cancel in one click, any time"].map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={16} className="mt-0.5 shrink-0 text-accent" /> {f}
            </li>
          ))}
        </ul>
        {isMember ? (
          <Link href="/account/billing" className={buttonClasses({ className: "mt-8 w-full" })}>
            Manage membership
          </Link>
        ) : signedIn ? (
          <form action="/api/stripe/checkout" method="post" className="mt-8">
            <input type="hidden" name="mode" value="membership" />
            <input type="hidden" name="interval" value={interval} />
            <button type="submit" className={buttonClasses({ className: "w-full" })}>
              Unlock All-Access
            </button>
          </form>
        ) : (
          <Link href={`/signup?next=${encodeURIComponent("/pricing")}`} className={buttonClasses({ className: "mt-8 w-full" })}>
            Unlock All-Access
          </Link>
        )}
      </div>
    </div>
  );
}
