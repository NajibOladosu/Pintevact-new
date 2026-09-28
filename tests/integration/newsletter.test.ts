import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { NextRequest } from "next/server";
import { sendBatch } from "@/lib/email";
import { notify } from "@/lib/notifications";
import { sendAnnouncement, sendNewsletterIssue } from "@/lib/newsletter";
import { learnerUnsubscribeToken } from "@/lib/unsubscribe";
import { getStore } from "@/lib/data";
import { POST as unsubscribe } from "@/app/api/unsubscribe/route";
import WelcomeEmail from "@/emails/welcome";
import { headersOf, linkIn, waitForEmail } from "../support/mailpit";
import { admin, createUser, uniqueEmail } from "../support/supabase";

const oneClick = (url: string) => unsubscribe(new NextRequest(url.replace("/unsubscribe?", "/api/unsubscribe?"), { method: "POST", body: "List-Unsubscribe=One-Click" }));

async function subscriber(email: string) {
  const { data, error } = await admin().from("newsletter_subscribers").select("unsubscribe_token, unsubscribed_at").eq("email", email).single();
  if (error) throw new Error(error.message);
  return data;
}

describe("newsletter", () => {
  it("welcomes new subscribers once, with a one-click unsubscribe header", async () => {
    const email = uniqueEmail("letter");
    const first = await getStore().subscribeNewsletter(email);
    expect(first.isNew).toBe(true);
    await notify.newsletterWelcome(email, first.token);
    const again = await getStore().subscribeNewsletter(email);
    expect(again).toEqual({ token: first.token, isNew: false });

    const mail = await waitForEmail(email, /on the list/);
    const headers = await headersOf(mail);
    expect(headers["List-Unsubscribe"]?.[0]).toContain(`/api/unsubscribe?t=n.${first.token}`);
    expect(headers["List-Unsubscribe-Post"]?.[0]).toBe("List-Unsubscribe=One-Click");

    const res = await oneClick(linkIn(mail, /\/unsubscribe\?t=/));
    expect(res.status).toBe(204);
    expect((await subscriber(email)).unsubscribed_at).not.toBeNull();

    // Subscribing again reactivates the same row and counts as a fresh welcome.
    expect(await getStore().subscribeNewsletter(email)).toEqual({ token: first.token, isNew: true });
    expect((await subscriber(email)).unsubscribed_at).toBeNull();
  });

  it("sends an issue to active subscribers only and records it", async () => {
    const active = uniqueEmail("issue");
    const gone = uniqueEmail("issue-gone");
    await getStore().subscribeNewsletter(active);
    const left = await getStore().subscribeNewsletter(gone);
    await oneClick(`http://localhost/unsubscribe?t=n.${left.token}`);

    const subject = `Issue ${Date.now()}`;
    const result = await sendNewsletterIssue(subject, { title: "Notice the pause", idea: ["First paragraph.", "Second paragraph."], experiment: "Take one breath before replying." }, null);
    expect(result.failed).toBe(0);
    expect(result.sent).toBeGreaterThanOrEqual(1);

    const mail = await waitForEmail(active, new RegExp(subject));
    expect(mail.HTML).toContain("Notice the pause");
    expect(mail.HTML).toContain(`No. ${result.issue}`);
    expect(linkIn(mail, /\/unsubscribe\?t=n\./)).toContain((await subscriber(active)).unsubscribe_token);
    await expect(waitForEmail(gone, new RegExp(subject), 1500)).rejects.toThrow();

    const { data: row } = await admin().from("newsletter_issues").select("status, recipients, sent_at").eq("number", result.issue).single();
    expect(row).toMatchObject({ status: "sent", recipients: result.sent });
    expect(row?.sent_at).not.toBeNull();
  });

  it("rejects forged or unknown unsubscribe tokens", async () => {
    expect((await unsubscribe(new NextRequest("http://localhost/api/unsubscribe?t=u.00000000-0000-4000-8000-000000000000.forged", { method: "POST" }))).status).toBe(400);
    expect((await unsubscribe(new NextRequest("http://localhost/api/unsubscribe?t=n.00000000-0000-4000-8000-000000000000", { method: "POST" }))).status).toBe(400);
  });
});

describe("learner emails", () => {
  it("announces to opted-in learners, each with their own unsubscribe link", async () => {
    const on = await createUser({ name: "Ada" });
    const off = await createUser({ name: "Grace" });
    await admin().from("profiles").update({ email_opt_in: true }).eq("id", on.id);
    await admin().from("profiles").update({ email_opt_in: false }).eq("id", off.id);

    const subject = `A new course ${Date.now()}`;
    const result = await sendAnnouncement(subject, { eyebrow: "New course", title: "Calm under pressure", body: ["It's open today."], cta: { label: "Take a look", href: "/courses" } });
    expect(result.failed).toBe(0);

    const mail = await waitForEmail(on.email, new RegExp(subject));
    expect(mail.Text).toContain("Hi Ada");
    expect(linkIn(mail, /\/courses/)).toMatch(/^http/);
    expect((await headersOf(mail))["List-Unsubscribe"]?.[0]).toContain(encodeURIComponent(learnerUnsubscribeToken(on.id)));
    await expect(waitForEmail(off.email, new RegExp(subject), 1500)).rejects.toThrow();

    // One-click unsubscribe turns learning emails off.
    expect((await oneClick(linkIn(mail, /\/unsubscribe\?t=u\./))).status).toBe(204);
    const { data } = await admin().from("profiles").select("email_opt_in").eq("id", on.id).single();
    expect(data?.email_opt_in).toBe(false);
  });

  it("delivers every message in a batch over SMTP", async () => {
    const recipients = [uniqueEmail("batch"), uniqueEmail("batch")];
    const result = await sendBatch(recipients.map((to) => ({ to, subject: "Batch hello", react: createElement(WelcomeEmail, { name: "Batch" }) })), { idempotencyKey: `test/${Date.now()}` });
    expect(result).toEqual({ sent: 2, failed: 0, errors: [] });
    for (const to of recipients) {
      const mail = await waitForEmail(to, /Batch hello/);
      expect((await headersOf(mail))["X-Pintevact-Idempotency-Key"]?.[0]).toMatch(/^test\/\d+\/0\//);
    }
  });

  it("warns learners when their password changes", async () => {
    const to = uniqueEmail("security");
    expect((await notify.passwordChanged({ email: to, name: "Ada" })).ok).toBe(true);
    const mail = await waitForEmail(to, /password was changed/);
    expect(mail.HTML).toContain("Ada");
    expect(mail.HTML).not.toContain("/unsubscribe");
  });
});
