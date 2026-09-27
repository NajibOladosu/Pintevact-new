import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { Webhook } from "standardwebhooks";
import { sendEmail } from "@/lib/email";
import WelcomeEmail from "@/emails/welcome";
import { POST as authHook } from "@/app/api/hooks/send-email/route";
import { local } from "../support/local-services";
import { linkIn, waitForEmail } from "../support/mailpit";
import { uniqueEmail } from "../support/supabase";

describe("email delivery", () => {
  it("delivers a rendered template over SMTP", async () => {
    const to = uniqueEmail("smtp");
    const res = await sendEmail({ to, subject: "Welcome to Pintevact", react: createElement(WelcomeEmail, { name: "Ada" }) });
    expect(res.ok).toBe(true);
    const mail = await waitForEmail(to, /Welcome to Pintevact/);
    expect(mail.From.Address).toBe("hello@pintevact.com");
    expect(mail.HTML).toContain("Ada");
    expect(mail.Text.length).toBeGreaterThan(50);
  });
});

describe("Supabase Send Email hook", () => {
  const secret = local.authHookSecret.replace(/^v1,whsec_/, "");

  function signed(body: object, key = secret) {
    const payload = JSON.stringify(body);
    const ts = new Date();
    const signature = new Webhook(key).sign("msg_test", ts, payload);
    return new Request("http://localhost/api/hooks/send-email", {
      method: "POST",
      body: payload,
      headers: { "webhook-id": "msg_test", "webhook-timestamp": String(Math.floor(ts.getTime() / 1000)), "webhook-signature": signature },
    });
  }

  it("sends the branded confirmation email with a same-origin confirm link", async () => {
    const to = uniqueEmail("hook");
    const res = await authHook(
      signed({
        user: { email: to, user_metadata: { full_name: "Grace" } },
        email_data: { token: "123456", token_hash: "pkce_hash", redirect_to: `${local.siteUrl}/auth/callback?next=%2Flearn`, email_action_type: "signup", site_url: local.siteUrl },
      }),
    );
    expect(res.status).toBe(200);
    const mail = await waitForEmail(to, /Confirm your email/);
    const link = linkIn(mail, /\/auth\/confirm/);
    const url = new URL(link);
    expect(url.origin).toBe(local.siteUrl);
    expect(url.searchParams.get("token_hash")).toBe("pkce_hash");
    expect(url.searchParams.get("type")).toBe("email");
    expect(mail.Text).toContain("123456");
  });

  it("rejects payloads signed with another key", async () => {
    const res = await authHook(signed({ user: { email: "x@example.test" }, email_data: { email_action_type: "signup" } }, Buffer.from("some-other-secret-value-000").toString("base64")));
    expect(res.status).toBe(401);
  });
});
