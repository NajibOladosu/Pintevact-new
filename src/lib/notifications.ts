import "server-only";
import { createElement } from "react";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { formatDate, formatPrice } from "@/lib/utils";
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

type Recipient = { email: string; name?: string | null };

export const notify = {
  welcome: (to: Recipient) =>
    sendEmail({ to: to.email, subject: "Welcome to Pintevact", react: createElement(WelcomeEmail, { name: to.name }), tags: [{ name: "category", value: "welcome" }] }),

  purchaseReceipt: (to: Recipient, p: { courseTitle: string; courseSlug: string; amountCents: number; currency: string; orderId: string }) =>
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
      tags: [{ name: "category", value: "receipt" }],
    }),

  membershipStarted: (to: Recipient, p: { interval: "month" | "year"; amountCents: number; currency: string; renewsOn: string | null }) =>
    sendEmail({
      to: to.email,
      subject: "All-Access unlocked",
      react: createElement(MembershipStartedEmail, {
        name: to.name,
        plan: p.interval === "year" ? "yearly" : "monthly",
        amount: `${formatPrice(p.amountCents, p.currency)} / ${p.interval}`,
        renewsOn: p.renewsOn ? formatDate(p.renewsOn) : "-",
      }),
      tags: [{ name: "category", value: "membership" }],
    }),

  membershipCanceled: (to: Recipient, accessUntil: string | null) =>
    sendEmail({
      to: to.email,
      subject: "Your All-Access membership was canceled",
      react: createElement(MembershipCanceledEmail, { name: to.name, accessUntil: accessUntil ? formatDate(accessUntil) : null }),
      tags: [{ name: "category", value: "membership" }],
    }),

  paymentFailed: (to: Recipient, amountCents: number, currency: string) =>
    sendEmail({
      to: to.email,
      subject: "Action needed: payment failed",
      react: createElement(PaymentFailedEmail, { name: to.name, amount: formatPrice(amountCents, currency) }),
      tags: [{ name: "category", value: "billing" }],
    }),

  courseCompleted: (to: Recipient, p: { courseTitle: string; certificateId: string; xpEarned: number }) =>
    sendEmail({
      to: to.email,
      subject: `You completed ${p.courseTitle} 🎓`,
      react: createElement(CourseCompletedEmail, { name: to.name, ...p }),
      tags: [{ name: "category", value: "completion" }],
    }),

  streakReminder: (to: Recipient, p: { streak: number; nextLessonTitle: string; nextLessonUrl: string }) =>
    sendEmail({
      to: to.email,
      subject: `Your ${p.streak}-day streak ends tonight`,
      react: createElement(StreakReminderEmail, { name: to.name, ...p }),
      tags: [{ name: "category", value: "engagement" }],
    }),

  weeklyDigest: (to: Recipient, p: { xp: number; lessons: number; reflections: number; levelName: string; insight: string }) =>
    sendEmail({
      to: to.email,
      subject: "Your week in the mirror",
      react: createElement(WeeklyDigestEmail, { name: to.name, ...p }),
      tags: [{ name: "category", value: "digest" }],
    }),

  contact: async (m: { name: string; email: string; topic: string; message: string }) => {
    const internal = await sendEmail({
      to: env.contactInbox(),
      subject: `[Contact · ${m.topic}] ${m.name}`,
      replyTo: m.email,
      react: createElement(ContactNotificationEmail, m),
      tags: [{ name: "category", value: "contact" }],
    });
    await sendEmail({ to: m.email, subject: "We got your message", react: createElement(ContactAutoReplyEmail, { name: m.name }) });
    return internal;
  },

  newsletterWelcome: (email: string) =>
    sendEmail({ to: email, subject: "You're on the list", react: createElement(NewsletterWelcomeEmail), tags: [{ name: "category", value: "newsletter" }] }),
};
