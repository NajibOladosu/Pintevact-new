import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { handleStripeEvent, mapStripeSubscription, type CommerceRepo } from "@/lib/billing/webhook";
import { courseCheckoutParams, membershipCheckoutParams } from "@/lib/billing/checkout";
import type { Subscription } from "@/lib/types";

function fakeRepo() {
  const events = new Set<string>();
  const purchases = new Map<string, { courseId: string; status: string; pi: string | null }>();
  const subs = new Map<string, Subscription>();
  const enrollments: string[] = [];
  const customers = new Map<string, string>([["cus_known", "user_2"]]);
  const repo: CommerceRepo = {
    claimEvent: vi.fn(async (id) => (events.has(id) ? false : (events.add(id), true))),
    releaseEvent: vi.fn(async (id) => void events.delete(id)),
    findUserByCustomer: vi.fn(async (c) => customers.get(c) ?? null),
    getUser: vi.fn(async (id) => ({ email: `${id}@test.com`, name: "Test" })),
    setCustomer: vi.fn(async () => {}),
    getCourse: vi.fn(async (id) => (id === "course_1" ? { id, title: "Emotional Alchemy", slug: "emotional-alchemy" } : null)),
    recordPurchase: vi.fn(async (p) => {
      if (purchases.has(p.sessionId)) return false;
      purchases.set(p.sessionId, { courseId: p.courseId, status: "paid", pi: p.paymentIntentId });
      return true;
    }),
    refundPurchase: vi.fn(async (pi) => {
      for (const p of purchases.values()) if (p.pi === pi) p.status = "refunded";
    }),
    enroll: vi.fn(async (u, c) => void enrollments.push(`${u}:${c}`)),
    upsertSubscription: vi.fn(async (_u, s) => {
      const prev = subs.get(s.id) ?? null;
      subs.set(s.id, s);
      return prev;
    }),
  };
  return { repo, purchases, subs, enrollments };
}

const notify = {
  purchaseReceipt: vi.fn(async () => ({})),
  membershipStarted: vi.fn(async () => ({})),
  membershipCanceled: vi.fn(async () => ({})),
  paymentFailed: vi.fn(async () => ({})),
};

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

const event = (type: string, object: unknown, id = `evt_${Math.random()}`) => ({ id, type, data: { object } }) as unknown as Stripe.Event;

beforeEach(() => Object.values(notify).forEach((f) => f.mockClear()));

describe("handleStripeEvent", () => {
  it("records a course purchase, enrolls and sends one receipt", async () => {
    const { repo, purchases, enrollments } = fakeRepo();
    const session = { id: "cs_1", mode: "payment", payment_status: "paid", customer: "cus_1", payment_intent: "pi_1", amount_total: 7900, currency: "usd", metadata: { user_id: "user_1", course_id: "course_1" } };
    const deps = { repo, notify, retrieveSubscription: vi.fn() };
    expect(await handleStripeEvent(event("checkout.session.completed", session, "evt_a"), deps)).toBe("purchase recorded");
    expect(purchases.get("cs_1")?.courseId).toBe("course_1");
    expect(enrollments).toEqual(["user_1:course_1"]);
    expect(repo.setCustomer).toHaveBeenCalledWith("user_1", "cus_1");
    expect(notify.purchaseReceipt).toHaveBeenCalledTimes(1);

    // Same event redelivered → ignored
    expect(await handleStripeEvent(event("checkout.session.completed", session, "evt_a"), deps)).toBe("duplicate");
    // Different event id, same session → no second receipt
    await handleStripeEvent(event("checkout.session.completed", session, "evt_b"), deps);
    expect(notify.purchaseReceipt).toHaveBeenCalledTimes(1);
  });

  it("waits for async payments", async () => {
    const { repo } = fakeRepo();
    const session = { id: "cs_2", mode: "payment", payment_status: "unpaid", metadata: { user_id: "user_1", course_id: "course_1" } };
    expect(await handleStripeEvent(event("checkout.session.completed", session), { repo, notify, retrieveSubscription: vi.fn() })).toBe("awaiting async payment");
    expect(repo.recordPurchase).not.toHaveBeenCalled();
  });

  it("starts memberships from subscription checkouts", async () => {
    const { repo, subs } = fakeRepo();
    const retrieveSubscription = vi.fn(async () => stripeSub());
    const session = { id: "cs_3", mode: "subscription", payment_status: "paid", customer: "cus_1", subscription: "sub_1", amount_total: 24000, currency: "usd", metadata: { user_id: "user_1" } };
    expect(await handleStripeEvent(event("checkout.session.completed", session), { repo, notify, retrieveSubscription })).toBe("subscription started");
    expect(subs.get("sub_1")).toMatchObject({ status: "active", interval: "year", priceId: "price_y" });
    expect(notify.membershipStarted).toHaveBeenCalledTimes(1);
  });

  it("tracks cancellation and deletion", async () => {
    const { repo, subs } = fakeRepo();
    const deps = { repo, notify, retrieveSubscription: vi.fn() };
    await handleStripeEvent(event("customer.subscription.created", stripeSub()), deps);
    await handleStripeEvent(event("customer.subscription.updated", stripeSub({ cancel_at_period_end: true })), deps);
    expect(notify.membershipCanceled).toHaveBeenCalledTimes(1);
    await handleStripeEvent(event("customer.subscription.deleted", stripeSub({ status: "canceled" })), deps);
    expect(subs.get("sub_1")?.status).toBe("canceled");
    expect(notify.membershipCanceled).toHaveBeenCalledTimes(2);
  });

  it("resolves users by customer id when metadata is missing", async () => {
    const { repo } = fakeRepo();
    await handleStripeEvent(event("invoice.payment_failed", { customer: "cus_known", amount_due: 2900, currency: "usd" }), { repo, notify, retrieveSubscription: vi.fn() });
    expect(notify.paymentFailed).toHaveBeenCalledWith({ email: "user_2@test.com", name: "Test" }, 2900, "usd");
  });

  it("marks refunds", async () => {
    const { repo, purchases } = fakeRepo();
    const deps = { repo, notify, retrieveSubscription: vi.fn() };
    await handleStripeEvent(event("checkout.session.completed", { id: "cs_9", mode: "payment", payment_status: "paid", payment_intent: "pi_9", amount_total: 100, currency: "usd", metadata: { user_id: "u", course_id: "course_1" } }), deps);
    await handleStripeEvent(event("charge.refunded", { payment_intent: "pi_9", refunded: true }), deps);
    expect(purchases.get("cs_9")?.status).toBe("refunded");
  });

  it("releases the event on failure so Stripe can retry", async () => {
    const { repo } = fakeRepo();
    repo.getCourse = vi.fn(async () => {
      throw new Error("db down");
    });
    const e = event("checkout.session.completed", { id: "cs_x", mode: "payment", payment_status: "paid", metadata: { user_id: "u", course_id: "course_1" } }, "evt_fail");
    await expect(handleStripeEvent(e, { repo, notify, retrieveSubscription: vi.fn() })).rejects.toThrow("db down");
    expect(repo.releaseEvent).toHaveBeenCalledWith("evt_fail");
  });
});

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
