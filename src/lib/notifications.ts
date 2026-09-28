import "server-only";
import { createElement } from "react";
import { sendBatch, sendEmail, type SendEmailInput } from "@/lib/email";
import { env } from "@/lib/env";
import { formatDate, formatPrice } from "@/lib/utils";
import { learnerUnsubscribeToken, newsletterUnsubscribeToken, unsubscribeLinks } from "@/lib/unsubscribe";
import WelcomeEmail from "@/emails/welcome";
import PurchaseReceiptEmail from "@/emails/purchase-receipt";
import MembershipStartedEmail from "@/emails/membership-started";
import MembershipCanceledEmail from "@/emails/membership-canceled";
import PaymentFailedEmail from "@/emails/payment-failed";
import CourseCompletedEmail from "@/emails/course-completed";
import ContactNotificationEmail from "@/emails/contact-notification";
import ContactAutoReplyEmail from "@/emails/contact-auto-reply";
import NewsletterWelcomeEmail from "@/emails/newsletter-welcome";
import StreakReminderEmail from "@/emails/streak-reminder";
import WeeklyDigestEmail from "@/emails/weekly-digest";
import PasswordChangedEmail from "@/emails/password-changed";
import AccountDeletedEmail from "@/emails/account-deleted";
import NotificationEmail, { type NotificationEmailProps } from "@/emails/notification";

type Recipient = { email: string; name?: string | null };
type Learner = Recipient & { id: string };

const tag = (value: string) => [{ name: "category", value }];
const today = () => new Date().toISOString().slice(0, 10);

/** Unsubscribe link + one-click headers for a learner's reminders, digests and announcements. */
function learnerOptOut(userId: string) {
  const links = unsubscribeLinks(learnerUnsubscribeToken(userId));
  return { unsubscribeUrl: links.url, headers: links.headers };
}

/**
 * Every automated email Pintevact sends. Auth emails (confirm, magic link, reset, email change,
 * invite, reauthentication) go through the Supabase Send Email hook in src/lib/auth/email-hook.ts.
 */
export const notify = {
  welcome: (to: Recipient) =>
    sendEmail({ to: to.email, subject: "Welcome to Pintevact", react: createElement(WelcomeEmail, { name: to.name }), tags: tag("welcome"), idempotencyKey: `welcome/${to.email.toLowerCase()}` }),

  purchaseReceipt: (to: Recipient, p: { courseTitle: string; courseSlug: string; amountCents: number; currency: string; orderId: string; ref?: string }) =>
    sendEmail({
      to: to.email,
      subject: `Your receipt: ${p.courseTitle}`,
      react: createElement(PurchaseReceiptEmail, {
        name: to.name,
        courseTitle: p.courseTitle,
        courseSlug: p.courseSlug,
        amount: formatPrice(p.amountCents, p.currency),
        orderId: p.orderId,
        date: formatDate(new Date()),
      }),
      tags: tag("receipt"),
      idempotencyKey: `receipt/${p.ref ?? p.orderId}`,
    }),

  membershipStarted: (to: Recipient, p: { interval: "month" | "year"; amountCents: number; currency: string; renewsOn: string | null; ref?: string }) =>
    sendEmail({
      to: to.email,
      subject: "All-Access unlocked",
      react: createElement(MembershipStartedEmail, {
        name: to.name,
        plan: p.interval === "year" ? "yearly" : "monthly",
        amount: `${formatPrice(p.amountCents, p.currency)} / ${p.interval}`,
        renewsOn: p.renewsOn ? formatDate(p.renewsOn) : "-",
      }),
      tags: tag("membership"),
      idempotencyKey: p.ref ? `membership-started/${p.ref}` : undefined,
    }),

  membershipCanceled: (to: Recipient, accessUntil: string | null, ref?: string) =>
    sendEmail({
      to: to.email,
      subject: accessUntil ? "Your All-Access membership will end" : "Your All-Access membership has ended",
      react: createElement(MembershipCanceledEmail, { name: to.name, accessUntil: accessUntil ? formatDate(accessUntil) : null }),
      tags: tag("membership"),
      idempotencyKey: ref ? `membership-canceled/${ref}` : undefined,
    }),

  paymentFailed: (to: Recipient, amountCents: number, currency: string, ref?: string) =>
    sendEmail({
      to: to.email,
      subject: "Action needed: your payment didn't go through",
      react: createElement(PaymentFailedEmail, { name: to.name, amount: formatPrice(amountCents, currency) }),
      tags: tag("billing"),
      idempotencyKey: ref ? `payment-failed/${ref}` : undefined,
    }),

  courseCompleted: (to: Recipient, p: { courseTitle: string; certificateId: string; xpEarned: number }) =>
    sendEmail({
      to: to.email,
      subject: `You completed ${p.courseTitle}`,
      react: createElement(CourseCompletedEmail, { name: to.name, ...p }),
      tags: tag("completion"),
      idempotencyKey: `certificate/${p.certificateId}`,
    }),

  streakReminder: (to: Learner, p: { streak: number; nextLessonTitle: string; nextLessonUrl: string }) => {
    const optOut = learnerOptOut(to.id);
    return sendEmail({
      to: to.email,
      subject: `Your ${p.streak}-day streak ends tonight`,
      react: createElement(StreakReminderEmail, { name: to.name, ...p, unsubscribeUrl: optOut.unsubscribeUrl }),
      headers: optOut.headers,
      tags: tag("streak"),
      idempotencyKey: `streak/${to.id}/${today()}`,
    });
  },

  weeklyDigest: (to: Learner, p: { xp: number; lessons: number; reflections: number; levelName: string; insight: string }) => {
    const optOut = learnerOptOut(to.id);
    return sendEmail({
      to: to.email,
      subject: "Your week in the mirror",
      react: createElement(WeeklyDigestEmail, { name: to.name, ...p, unsubscribeUrl: optOut.unsubscribeUrl }),
      headers: optOut.headers,
      tags: tag("digest"),
      idempotencyKey: `digest/${to.id}/${today()}`,
    });
  },

  passwordChanged: (to: Recipient) =>
    sendEmail({
      to: to.email,
      subject: "Your Pintevact password was changed",
      react: createElement(PasswordChangedEmail, { name: to.name, changedAt: new Date().toUTCString().replace(" GMT", " UTC") }),
      tags: tag("security"),
    }),

  accountDeleted: (to: Recipient) =>
    sendEmail({ to: to.email, subject: "Your Pintevact account has been deleted", react: createElement(AccountDeletedEmail, { name: to.name }), tags: tag("security") }),

  /** One announcement to many learners, each with their own unsubscribe link, sent through Resend batches. */
  announcement: (learners: Learner[], content: Omit<NotificationEmailProps, "name" | "unsubscribeUrl">, opts: { subject: string; idempotencyKey?: string }) =>
    sendBatch(
      learners.map((l): SendEmailInput => {
        const optOut = learnerOptOut(l.id);
        return {
          to: l.email,
          subject: opts.subject,
          react: createElement(NotificationEmail, { ...content, name: l.name, unsubscribeUrl: optOut.unsubscribeUrl }),
          headers: optOut.headers,
          tags: tag("announcement"),
        };
      }),
      { idempotencyKey: opts.idempotencyKey },
    ),

  contact: async (m: { name: string; email: string; topic: string; message: string }) => {
    const internal = await sendEmail({
      to: env.contactInbox(),
      subject: `[Contact · ${m.topic}] ${m.name}`,
      replyTo: m.email,
      react: createElement(ContactNotificationEmail, m),
      tags: tag("contact"),
    });
    await sendEmail({ to: m.email, subject: "We got your message", react: createElement(ContactAutoReplyEmail, { name: m.name }), tags: tag("contact-reply") });
    return internal;
  },

  newsletterWelcome: (email: string, subscriberToken: string) => {
    const links = unsubscribeLinks(newsletterUnsubscribeToken(subscriberToken));
    return sendEmail({
      to: email,
      subject: "You're on the list",
      react: createElement(NewsletterWelcomeEmail, { unsubscribeUrl: links.url }),
      headers: links.headers,
      tags: tag("newsletter"),
      idempotencyKey: `newsletter-welcome/${email.toLowerCase()}`,
    });
  },
};
