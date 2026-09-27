"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { MEMBERSHIP, yearlySavingsPercent, type BillingInterval } from "@/lib/pricing";
import { cn, formatPrice } from "@/lib/utils";

export function PricingPlans({ signedIn, isMember, minCoursePrice }: { signedIn: boolean; isMember: boolean; minCoursePrice: number }) {
  const [interval, setInterval] = useState<BillingInterval>("year");
  const plan = MEMBERSHIP[interval];
  const perMonth = interval === "year" ? Math.round(plan.amountCents / 12) : plan.amountCents;

  return (
    <div>
      <div className="flex justify-center">
        <div role="radiogroup" aria-label="Billing interval" className="inline-flex rounded-full border-2 border-ink bg-paper p-1">
          {(["month", "year"] as const).map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={interval === i}
              onClick={() => setInterval(i)}
              className={cn("rounded-full px-5 py-2 text-sm font-semibold transition", interval === i ? "bg-ink text-paper" : "hover:bg-ink/5")}
            >
              {MEMBERSHIP[i].label}
              {i === "year" ? <span className={cn("ml-2 rounded-full px-2 py-0.5 text-xs", interval === i ? "bg-lucid text-ink" : "bg-lucid/60")}>Save {yearlySavingsPercent()}%</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
        <Plan
          name="Explorer"
          price="Free"
          caption="forever"
          description="Meet your mind with our free interactive starter course."
          features={["Meet Your Mind course", "Preview lessons from every course", "Reflection Vault", "XP, streaks & badges"]}
          cta={
            <Link href={signedIn ? "/learn/meet-your-mind" : "/signup"} className={buttonClasses({ variant: "outline", className: "w-full" })}>
              {signedIn ? "Go to free course" : "Start free"}
            </Link>
          }
        />
        <Plan
          name="Single course"
          price={`from ${formatPrice(minCoursePrice)}`}
          caption="one-time"
          description="Own one course for life. Perfect if you know exactly what you want to work on."
          features={["Lifetime access to one course", "All interactive lessons", "Certificate of completion", "30-day money-back guarantee"]}
          cta={
            <Link href="/courses" className={buttonClasses({ variant: "ink", className: "w-full" })}>
              Browse courses
            </Link>
          }
        />
        <Plan
          highlight
          name="All-Access"
          price={formatPrice(perMonth)}
          caption={interval === "year" ? `/ month · billed ${formatPrice(plan.amountCents)} yearly` : "/ month"}
          description="Every course, every new release, every tool. The complete Pintevact experience."
          features={["Every current & future course", "Member-only live workshops", "Priority new-course access", "Cancel anytime in one click"]}
          cta={
            isMember ? (
              <Link href="/account/billing" className={buttonClasses({ variant: "ink", className: "w-full" })}>
                Manage membership
              </Link>
            ) : signedIn ? (
              <form action="/api/stripe/checkout" method="post">
                <input type="hidden" name="mode" value="membership" />
                <input type="hidden" name="interval" value={interval} />
                <button type="submit" className={buttonClasses({ variant: "ink", className: "w-full" })}>
                  Unlock All-Access
                </button>
              </form>
            ) : (
              <Link href={`/signup?next=${encodeURIComponent("/pricing")}`} className={buttonClasses({ variant: "ink", className: "w-full" })}>
                Unlock All-Access
              </Link>
            )
          }
        />
      </div>
    </div>
  );
}

function Plan({
  name,
  price,
  caption,
  description,
  features,
  cta,
  highlight,
}: {
  name: string;
  price: string;
  caption: string;
  description: string;
  features: string[];
  cta: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={cn("relative flex flex-col rounded-[2rem] border-2 border-ink p-7 sm:p-8", highlight ? "bg-ember shadow-hard-lg lg:-translate-y-4" : "bg-paper")}>
      {highlight ? (
        <span className="absolute -top-4 right-6 rotate-3 rounded-full border-2 border-ink bg-lucid px-3 py-1 font-mono text-xs font-semibold uppercase">Most loved</span>
      ) : null}
      <p className="eyebrow">{name}</p>
      <p className="mt-4 font-display text-5xl">{price}</p>
      <p className="mt-1 text-sm opacity-80">{caption}</p>
      <p className="mt-5 opacity-90">{description}</p>
      <ul className="mt-6 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper">
              <Check size={12} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-8">{cta}</div>
    </div>
  );
}
