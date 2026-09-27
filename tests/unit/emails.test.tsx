import { describe, expect, it, vi } from "vitest";
import { render } from "@react-email/render";

vi.mock("server-only", () => ({}));

import ConfirmSignupEmail from "@/emails/confirm-signup";
import MagicLinkEmail from "@/emails/magic-link";
import ResetPasswordEmail from "@/emails/reset-password";
import EmailChangeEmail from "@/emails/email-change";
import InviteEmail from "@/emails/invite";
import ReauthenticationEmail from "@/emails/reauthentication";
import WelcomeEmail from "@/emails/welcome";
import PurchaseReceiptEmail from "@/emails/purchase-receipt";
import MembershipStartedEmail from "@/emails/membership-started";
import MembershipCanceledEmail from "@/emails/membership-canceled";
import PaymentFailedEmail from "@/emails/payment-failed";
import CourseCompletedEmail from "@/emails/course-completed";
import StreakReminderEmail from "@/emails/streak-reminder";
import WeeklyDigestEmail from "@/emails/weekly-digest";
import ContactNotificationEmail from "@/emails/contact-notification";
import ContactAutoReplyEmail from "@/emails/contact-auto-reply";
import NewsletterWelcomeEmail from "@/emails/newsletter-welcome";
import { buildAuthEmails, confirmUrl, type AuthHookPayload } from "@/lib/auth/email-hook";
import { renderEmail, sendEmail } from "@/lib/email";

/* eslint-disable @typescript-eslint/no-explicit-any */
const templates: [string, any][] = [
  ["confirm-signup", ConfirmSignupEmail],
  ["magic-link", MagicLinkEmail],
  ["reset-password", ResetPasswordEmail],
  ["email-change", EmailChangeEmail],
  ["invite", InviteEmail],
  ["reauthentication", ReauthenticationEmail],
  ["welcome", WelcomeEmail],
  ["purchase-receipt", PurchaseReceiptEmail],
  ["membership-started", MembershipStartedEmail],
  ["membership-canceled", MembershipCanceledEmail],
  ["payment-failed", PaymentFailedEmail],
  ["course-completed", CourseCompletedEmail],
  ["streak-reminder", StreakReminderEmail],
  ["weekly-digest", WeeklyDigestEmail],
  ["contact-notification", ContactNotificationEmail],
  ["contact-auto-reply", ContactAutoReplyEmail],
  ["newsletter-welcome", NewsletterWelcomeEmail],
];

describe("email templates", () => {
  it.each(templates)("%s renders branded HTML", async (_, Template) => {
    const html = await render(<Template {...(Template.PreviewProps ?? {})} />);
    expect(html).toContain("<!DOCTYPE html");
    expect(html).toContain("Pintevact");
    expect(html).not.toContain("undefined");
  });

  it("includes links and codes", async () => {
    const html = await render(<ConfirmSignupEmail confirmUrl="https://x.test/auth/confirm?a=1" token="123456" name="Ada" />);
    expect(html).toContain("https://x.test/auth/confirm?a=1");
    expect(html).toContain("123456");
    expect(html).toContain("Ada");
  });

  it("produces a plain-text alternative", async () => {
    const { text } = await renderEmail(<WelcomeEmail name="Ada" />);
    expect(text).toContain("Ada");
    expect(text).not.toContain("<");
  });

  it("skips delivery gracefully without an API key", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const res = await sendEmail({ to: "a@b.c", subject: "Hi", react: <WelcomeEmail /> });
    expect(res).toEqual({ ok: true, id: null, skipped: true });
    vi.unstubAllEnvs();
  });
});

describe("Supabase auth hook mapping", () => {
  const base = (type: string, extra: Partial<AuthHookPayload["email_data"]> = {}, user: Partial<AuthHookPayload["user"]> = {}): AuthHookPayload => ({
    user: { email: "ada@example.com", user_metadata: { full_name: "Ada" }, ...user },
    email_data: { token: "123456", token_hash: "hash", redirect_to: "https://app.test/learn", email_action_type: type, site_url: "https://app.test", ...extra },
  });

  it("builds confirm URLs that only redirect same-origin", () => {
    expect(confirmUrl("https://app.test", "h", "email", "https://app.test/learn?x=1")).toBe("https://app.test/auth/confirm?token_hash=h&type=email&next=%2Flearn%3Fx%3D1");
    expect(confirmUrl("https://app.test", "h", "email", "https://evil.test/steal")).toContain("next=%2Fdashboard");
  });

  it.each([
    ["signup", "Confirm your email"],
    ["magiclink", "sign-in link"],
    ["recovery", "Reset your password"],
    ["invite", "invited"],
    ["reauthentication", "verification code"],
  ])("maps %s", (type, subject) => {
    const emails = buildAuthEmails(base(type), "https://app.test");
    expect(emails).toHaveLength(1);
    expect(emails[0].to).toBe("ada@example.com");
    expect(emails[0].subject).toContain(subject);
  });

  it("recovery links land on the reset-password page", async () => {
    const [email] = buildAuthEmails(base("recovery"), "https://app.test");
    const html = await render(email.react);
    expect(html).toContain("type=recovery");
    expect(html).toContain("next=%2Freset-password");
  });

  it("sends email change confirmations to both addresses", () => {
    const emails = buildAuthEmails(base("email_change", { token_hash_new: "hash2" }, { new_email: "new@example.com" }), "https://app.test");
    expect(emails.map((e) => e.to)).toEqual(["new@example.com", "ada@example.com"]);
  });

  it("ignores unknown action types", () => expect(buildAuthEmails(base("mystery"), "https://app.test")).toEqual([]));
});
