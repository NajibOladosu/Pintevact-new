import type { Metadata } from "next";
import { AdminNav } from "@/components/app/admin-nav";
import { AnnouncementComposer, NewsletterComposer } from "@/components/app/email-composers";
import { requireAdmin } from "@/lib/auth/session";
import { isEmailConfigured, isResendConfigured } from "@/lib/env";
import { emailAudience, listNewsletterIssues } from "@/lib/newsletter";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Emails" };

const automated = [
  ["Sign-up confirmation, magic link, password reset, email change, invite, reauthentication", "Supabase auth hook"],
  ["Welcome, receipts, membership started / ended, payment failed", "Sign-up and Stripe webhooks"],
  ["Course completed with certificate", "Last lesson finished"],
  ["Streak reminder, weekly digest", "Daily engagement cron"],
  ["Password changed, account deleted", "Account security"],
  ["Contact auto-reply and inbox copy, newsletter welcome", "Public forms"],
];

export default async function AdminEmailsPage() {
  await requireAdmin();
  const [audience, issues] = await Promise.all([emailAudience(), listNewsletterIssues()]);
  const provider = isResendConfigured() ? "Resend" : isEmailConfigured() ? "SMTP" : null;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <AdminNav active="emails" />
      {!provider ? (
        <p role="alert" className="rounded-[1.2rem] border border-danger/40 p-4 text-sm text-danger">
          Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM to send from Pintevact.
        </p>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[1.6rem] bg-raised p-6 ring-1 ring-line sm:p-8">
          <p className="text-sm text-muted">Newsletter · {audience.subscribers.toLocaleString()} active subscribers</p>
          <h2 className="mt-1 text-2xl tracking-tight">Write the Thursday letter</h2>
          <p className="mt-2 text-sm text-muted">One idea, one experiment, one question. Every subscriber gets a one-click unsubscribe link.</p>
          <div className="mt-6">
            <NewsletterComposer subscribers={audience.subscribers} />
          </div>
        </section>

        <aside className="space-y-10">
          <section>
            <h2 className="text-lg">Past issues</h2>
            <ul className="mt-3 border-t border-line">
              {issues.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-4 border-b border-line py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      <span className="tabular text-subtle">No. {i.number}</span> {i.subject}
                    </p>
                    <p className="text-xs text-subtle">
                      {formatDate(i.sentAt ?? i.createdAt)} · {i.recipients.toLocaleString()} sent
                    </p>
                  </div>
                  <span className={cn("shrink-0 text-xs", i.status === "failed" ? "text-danger" : "text-subtle")}>{i.status}</span>
                </li>
              ))}
              {!issues.length ? <li className="py-3 text-sm text-muted">No issues sent yet.</li> : null}
            </ul>
          </section>
          <section>
            <h2 className="text-lg">Sent automatically</h2>
            <p className="mt-1 text-xs text-subtle">Delivered through {provider ?? "nothing yet"}.</p>
            <ul className="mt-3 border-t border-line">
              {automated.map(([what, when]) => (
                <li key={when} className="border-b border-line py-3">
                  <p className="text-sm">{what}</p>
                  <p className="text-xs text-subtle">{when}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <section className="rounded-[1.6rem] bg-raised p-6 ring-1 ring-line sm:p-8">
        <p className="text-sm text-muted">Announcement · {audience.learners.toLocaleString()} learners with emails on</p>
        <h2 className="mt-1 text-2xl tracking-tight">Tell your learners something</h2>
        <p className="mt-2 text-sm text-muted">New courses, product updates, live sessions. Only learners who kept learning emails on receive it.</p>
        <div className="mt-6">
          <AnnouncementComposer learners={audience.learners} />
        </div>
      </section>
    </div>
  );
}
