import "server-only";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { sendBatch, sendEmail, type BatchResult, type SendEmailInput } from "@/lib/email";
import { notify } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { newsletterUnsubscribeToken, unsubscribeLinks } from "@/lib/unsubscribe";
import NewsletterIssueEmail, { type NewsletterIssueEmailProps } from "@/emails/newsletter-issue";
import type { NotificationEmailProps } from "@/emails/notification";

export type IssueContent = Omit<NewsletterIssueEmailProps, "issueNumber" | "unsubscribeUrl">;
export type AnnouncementContent = Omit<NotificationEmailProps, "name" | "unsubscribeUrl">;

export type NewsletterIssue = {
  id: string;
  number: number;
  subject: string;
  status: "draft" | "sending" | "sent" | "failed";
  recipients: number;
  sentAt: string | null;
  createdAt: string;
};

const tags = [{ name: "category", value: "newsletter" }];

/** How many people each composer would reach right now. */
export async function emailAudience() {
  const db = createAdminClient();
  const [subscribers, learners] = await Promise.all([
    db.from("newsletter_subscribers").select("email", { count: "exact", head: true }).is("unsubscribed_at", null),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("email_opt_in", true),
  ]);
  if (subscribers.error || learners.error) throw new Error(`Could not count email audience: ${(subscribers.error ?? learners.error)?.message}`);
  return { subscribers: subscribers.count ?? 0, learners: learners.count ?? 0 };
}

export async function listNewsletterIssues(limit = 20): Promise<NewsletterIssue[]> {
  const { data, error } = await createAdminClient()
    .from("newsletter_issues")
    .select("id, number, subject, status, recipients, sent_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, number: r.number, subject: r.subject, status: r.status, recipients: r.recipients, sentAt: r.sent_at, createdAt: r.created_at }));
}

/** Send one copy of an issue to an admin before it goes out. The unsubscribe link is a dummy. */
export function sendNewsletterTest(to: string, subject: string, content: IssueContent) {
  return sendEmail({ to, subject: `[Test] ${subject}`, react: createElement(NewsletterIssueEmail, { ...content }), tags });
}

/**
 * Record an issue, then send it to every active subscriber through Resend batches. Each subscriber
 * gets their own unsubscribe link plus one-click List-Unsubscribe headers. The issue id is the
 * idempotency key, so a retried send never delivers twice.
 */
export async function sendNewsletterIssue(subject: string, content: IssueContent, adminId: string | null): Promise<BatchResult & { issue: number }> {
  const db = createAdminClient();
  const { data: issue, error } = await db
    .from("newsletter_issues")
    .insert({ subject, content, status: "sending", created_by: adminId })
    .select("id, number")
    .single();
  if (error || !issue) throw error ?? new Error("Could not create the issue");

  const { data: subscribers, error: subError } = await db.from("newsletter_subscribers").select("email, unsubscribe_token").is("unsubscribed_at", null);
  if (subError) {
    await db.from("newsletter_issues").update({ status: "failed" }).eq("id", issue.id);
    throw subError;
  }

  const messages = (subscribers ?? []).map((s): SendEmailInput => {
    const links = unsubscribeLinks(newsletterUnsubscribeToken(s.unsubscribe_token));
    return {
      to: s.email,
      subject,
      react: createElement(NewsletterIssueEmail, { ...content, issueNumber: issue.number, unsubscribeUrl: links.url }),
      headers: links.headers,
      tags,
    };
  });
  const result = await sendBatch(messages, { idempotencyKey: `newsletter/${issue.id}` });
  const status = result.failed && !result.sent ? "failed" : "sent";
  await db.from("newsletter_issues").update({ status, recipients: result.sent, sent_at: new Date().toISOString() }).eq("id", issue.id);
  return { ...result, issue: issue.number };
}

/** Email every learner who has product emails turned on. */
export async function sendAnnouncement(subject: string, content: AnnouncementContent): Promise<BatchResult> {
  const { data, error } = await createAdminClient().from("profiles").select("id, email, full_name").eq("email_opt_in", true);
  if (error) throw error;
  const learners = (data ?? []).map((p) => ({ id: p.id, email: p.email, name: p.full_name }));
  // The same announcement submitted twice on one day (a double click, a retry) is only delivered once.
  const fingerprint = createHash("sha256").update(JSON.stringify([subject, content, new Date().toISOString().slice(0, 10)])).digest("hex").slice(0, 24);
  return notify.announcement(learners, content, { subject, idempotencyKey: `announcement/${fingerprint}` });
}
