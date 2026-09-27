import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import { POST } from "@/app/api/stripe/webhook/route";
import { catalog } from "@/content/catalog";
import { admin, createUser } from "../support/supabase";
import { local } from "../support/local-services";
import { waitForEmail } from "../support/mailpit";

const stripe = new Stripe(local.stripeSecretKey);
const course = catalog.find((c) => c.priceCents > 0)!;

let n = 0;
function eventOf(type: string, object: object, id = `evt_test_${Date.now()}_${n++}`) {
  return { id, object: "event", type, api_version: "2025-01-01", created: Math.floor(Date.now() / 1000), data: { object } };
}

/** Delivers an event to the real route exactly as Stripe would: raw body plus a valid signature header. */
async function deliver(event: object, secret = local.stripeWebhookSecret) {
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
  return POST(new Request("http://localhost/api/stripe/webhook", { method: "POST", body: payload, headers: { "stripe-signature": signature, "content-type": "application/json" } }));
}

const subscription = (userId: string, customer: string, overrides: Record<string, unknown> = {}) => ({
  id: `sub_${userId.slice(0, 8)}`,
  object: "subscription",
  status: "active",
  customer,
  cancel_at_period_end: false,
  metadata: { user_id: userId },
  items: { data: [{ current_period_end: 1_900_000_000, price: { id: "price_yearly", recurring: { interval: "year" } } }] },
  ...overrides,
});

describe("POST /api/stripe/webhook", () => {
  it("rejects requests that were not signed with the endpoint secret", async () => {
    const res = await deliver(eventOf("checkout.session.completed", {}), "whsec_not_the_real_one");
    expect(res.status).toBe(400);
  });

  it("records a course purchase once, enrols the learner and emails one receipt", async () => {
    const user = await createUser({ name: "Buyer" });
    const session = {
      id: `cs_test_${Date.now()}`,
      object: "checkout.session",
      mode: "payment",
      payment_status: "paid",
      customer: `cus_${user.id.slice(0, 8)}`,
      payment_intent: `pi_${user.id.slice(0, 8)}`,
      amount_total: course.priceCents,
      currency: "usd",
      metadata: { user_id: user.id, course_id: course.id },
    };
    const first = eventOf("checkout.session.completed", session);
    const res = await deliver(first);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ result: "purchase recorded" });

    // Redelivery of the same event and a second event for the same session change nothing.
    expect(await (await deliver(first)).json()).toMatchObject({ result: "duplicate" });
    await deliver(eventOf("checkout.session.completed", session));

    const { data: purchases } = await admin().from("purchases").select("*").eq("user_id", user.id);
    expect(purchases).toHaveLength(1);
    expect(purchases![0]).toMatchObject({ course_id: course.id, status: "paid", amount_cents: course.priceCents });
    const { data: enrolments } = await admin().from("enrollments").select("course_id, source").eq("user_id", user.id);
    expect(enrolments).toEqual([{ course_id: course.id, source: "purchase" }]);
    const { data: profile } = await admin().from("profiles").select("stripe_customer_id").eq("id", user.id).single();
    expect(profile!.stripe_customer_id).toBe(session.customer);

    const receipt = await waitForEmail(user.email, /Your receipt/);
    expect(receipt.Subject).toContain(course.title);

    // A refund flips the purchase.
    await deliver(eventOf("charge.refunded", { object: "charge", payment_intent: session.payment_intent, refunded: true }));
    const { data: after } = await admin().from("purchases").select("status").eq("user_id", user.id).single();
    expect(after!.status).toBe("refunded");
  });

  it("waits for asynchronous payments before granting access", async () => {
    const user = await createUser();
    const res = await deliver(eventOf("checkout.session.completed", { id: `cs_async_${Date.now()}`, object: "checkout.session", mode: "payment", payment_status: "unpaid", metadata: { user_id: user.id, course_id: course.id } }));
    expect(await res.json()).toMatchObject({ result: "awaiting async payment" });
    const { data } = await admin().from("purchases").select("id").eq("user_id", user.id);
    expect(data).toEqual([]);
  });

  it("tracks a membership from creation to cancellation", async () => {
    const user = await createUser({ name: "Member" });
    const customer = `cus_m_${user.id.slice(0, 8)}`;
    await admin().from("profiles").update({ stripe_customer_id: customer }).eq("id", user.id);

    expect(await (await deliver(eventOf("customer.subscription.created", subscription(user.id, customer)))).json()).toMatchObject({ result: "subscription active" });
    const { data: sub } = await admin().from("subscriptions").select("*").eq("user_id", user.id).single();
    expect(sub).toMatchObject({ status: "active", interval: "year", price_id: "price_yearly", cancel_at_period_end: false });

    await deliver(eventOf("customer.subscription.updated", subscription(user.id, customer, { cancel_at_period_end: true })));
    await waitForEmail(user.email, /membership was canceled/);

    await deliver(eventOf("customer.subscription.deleted", subscription(user.id, customer, { status: "canceled" })));
    const { data: ended } = await admin().from("subscriptions").select("status").eq("user_id", user.id).single();
    expect(ended!.status).toBe("canceled");
  });

  it("finds the learner by Stripe customer when an invoice fails", async () => {
    const user = await createUser({ name: "Late Payer" });
    const customer = `cus_f_${user.id.slice(0, 8)}`;
    await admin().from("profiles").update({ stripe_customer_id: customer }).eq("id", user.id);
    await deliver(eventOf("invoice.payment_failed", { object: "invoice", customer, amount_due: 2900, currency: "usd" }));
    const mail = await waitForEmail(user.email, /payment failed/);
    expect(mail.Text).toContain("29");
  });
});
