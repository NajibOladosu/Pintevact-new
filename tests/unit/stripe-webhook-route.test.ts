import { beforeEach, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";

vi.mock("server-only", () => ({}));
const { handle } = vi.hoisted(() => ({ handle: vi.fn(async () => "ok") }));
vi.mock("@/lib/billing/webhook", () => ({ handleStripeEvent: handle }));
vi.mock("@/lib/billing/supabase-repo", () => ({ createSupabaseCommerceRepo: () => ({}) }));
vi.mock("@/lib/notifications", () => ({ notify: {} }));

import { POST } from "@/app/api/stripe/webhook/route";

const secret = "whsec_test_secret";
const stripe = new Stripe("sk_test_123");

function req(body: string, signature?: string) {
  return new Request("http://localhost/api/stripe/webhook", { method: "POST", body, headers: signature ? { "stripe-signature": signature } : {} });
}

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    handle.mockClear();
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", secret);
  });

  it("accepts correctly signed events", async () => {
    const payload = JSON.stringify({ id: "evt_1", object: "event", type: "customer.subscription.updated", data: { object: {} } });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    const res = await POST(req(payload, header));
    expect(res.status).toBe(200);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it("rejects bad signatures", async () => {
    const payload = JSON.stringify({ id: "evt_1", type: "x" });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_wrong" });
    expect((await POST(req(payload, header))).status).toBe(400);
    expect((await POST(req(payload))).status).toBe(400);
    expect(handle).not.toHaveBeenCalled();
  });

  it("returns 500 so Stripe retries when handling fails", async () => {
    handle.mockRejectedValueOnce(new Error("boom"));
    const payload = JSON.stringify({ id: "evt_2", object: "event", type: "x", data: { object: {} } });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await POST(req(payload, header))).status).toBe(500);
  });
});
