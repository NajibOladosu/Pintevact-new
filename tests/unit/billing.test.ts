import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { mapStripeSubscription } from "@/lib/billing/webhook";
import { courseCheckoutParams, membershipCheckoutParams } from "@/lib/billing/checkout";

const stripeSub = (overrides: Partial<Stripe.Subscription> = {}) =>
  ({
    id: "sub_1",
    status: "active",
    customer: "cus_1",
    cancel_at_period_end: false,
    metadata: { user_id: "user_1" },
    items: { data: [{ current_period_end: 1_900_000_000, price: { id: "price_y", recurring: { interval: "year" } } }] },
    ...overrides,
  }) as unknown as Stripe.Subscription;

describe("mapStripeSubscription", () => {
  it("reads period end from the subscription item", () => {
    expect(mapStripeSubscription(stripeSub()).currentPeriodEnd).toBe(new Date(1_900_000_000_000).toISOString());
  });
});

describe("checkout params", () => {
  const base = { siteUrl: "https://app.test", userId: "u1", customerId: "cus_1" };
  it("builds inline course pricing when no Stripe price is set", () => {
    const p = courseCheckoutParams({ id: "c1", slug: "x", title: "X", subtitle: "sub", priceCents: 7900, currency: "usd", stripePriceId: null }, base);
    expect(p.mode).toBe("payment");
    expect(p.line_items?.[0].price_data?.unit_amount).toBe(7900);
    expect(p.metadata).toMatchObject({ user_id: "u1", course_id: "c1" });
    expect(p.success_url).toContain("/learn/x?purchased=1");
  });
  it("uses configured Stripe prices", () => {
    const p = courseCheckoutParams({ id: "c1", slug: "x", title: "X", subtitle: "", priceCents: 1, currency: "usd", stripePriceId: "price_123" }, base);
    expect(p.line_items?.[0]).toEqual({ price: "price_123", quantity: 1 });
  });
  it("builds recurring membership checkout", () => {
    const p = membershipCheckoutParams("month", undefined, base);
    expect(p.mode).toBe("subscription");
    expect(p.line_items?.[0].price_data?.recurring?.interval).toBe("month");
    expect(p.subscription_data?.metadata?.user_id).toBe("u1");
    expect(membershipCheckoutParams("year", "price_y", base).line_items?.[0]).toEqual({ price: "price_y", quantity: 1 });
  });
});
