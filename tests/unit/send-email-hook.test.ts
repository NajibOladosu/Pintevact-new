import { beforeEach, describe, expect, it, vi } from "vitest";
import { Webhook } from "standardwebhooks";

vi.mock("server-only", () => ({}));
const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn(async () => ({ ok: true as const, id: "e_1" })) }));
vi.mock("@/lib/email", () => ({ sendEmail }));

import { POST } from "@/app/api/hooks/send-email/route";

const secretB64 = Buffer.from("super-secret-signing-key-123456").toString("base64");

function signedRequest(body: object, secret = secretB64) {
  const payload = JSON.stringify(body);
  const id = "msg_1";
  const ts = new Date();
  const signature = new Webhook(secret).sign(id, ts, payload);
  return new Request("http://localhost/api/hooks/send-email", {
    method: "POST",
    body: payload,
    headers: { "webhook-id": id, "webhook-timestamp": String(Math.floor(ts.getTime() / 1000)), "webhook-signature": signature, "content-type": "application/json" },
  });
}

const payload = {
  user: { email: "ada@example.com", user_metadata: {} },
  email_data: { token: "1", token_hash: "h", redirect_to: "", email_action_type: "signup", site_url: "" },
};

describe("POST /api/hooks/send-email", () => {
  beforeEach(() => {
    sendEmail.mockClear();
    vi.stubEnv("SUPABASE_AUTH_HOOK_SECRET", `v1,whsec_${secretB64}`);
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.test");
  });

  it("sends the templated email for a valid signature", async () => {
    const res = await POST(signedRequest(payload));
    expect(res.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail.mock.calls[0]).toBeDefined();
  });

  it("rejects bad signatures", async () => {
    const res = await POST(signedRequest(payload, Buffer.from("another-secret-entirely-000000").toString("base64")));
    expect(res.status).toBe(401);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("fails closed when the secret is missing", async () => {
    vi.stubEnv("SUPABASE_AUTH_HOOK_SECRET", "");
    const res = await POST(signedRequest(payload));
    expect(res.status).toBe(500);
  });
});
