import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/app/admin-nav";
import { requireAdmin } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { recentAudit } from "@/lib/admin/audit";
import { listUsers } from "@/lib/admin/users";
import {
  isBunnyConfigured,
  isBunnyLibraryConfigured,
  isEmailConfigured,
  isResendConfigured,
  isStripeConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import { buttonClasses } from "@/components/ui/button";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  await requireAdmin();
  const store = getStore();
  const [stats, newest, activity] = await Promise.all([
    store.adminStats(),
    listUsers({ page: 1 }),
    recentAudit(10),
  ]);
  const users = newest.rows;
  const integrations = [
    { name: "Supabase", ok: isSupabaseConfigured(), note: "Database and auth" },
    {
      name: "Stripe",
      ok: isStripeConfigured(),
      note: "Payments and memberships",
    },
    {
      name: "Email",
      ok: isEmailConfigured(),
      note: isResendConfigured() ? "Resend" : "SMTP",
    },
    { name: "Bunny Stream", ok: isBunnyConfigured(), note: "Video playback" },
    {
      name: "Bunny library",
      ok: isBunnyLibraryConfigured(),
      note: "Uploads and the video picker",
    },
  ];
  const figures = [
    ["Learners", stats.users.toLocaleString()],
    [
      "One-time revenue",
      stats.revenueCents ? formatPrice(stats.revenueCents) : "$0",
    ],
    ["Active members", stats.activeSubscriptions.toLocaleString()],
    ["Enrolments", stats.enrollments.toLocaleString()],
    ["Lessons completed", stats.lessonsCompleted.toLocaleString()],
    ["Reflections written", stats.reflections.toLocaleString()],
  ];
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <AdminNav
        active="overview"
        actions={
          <>
            <Link
              href="/admin/courses"
              className={buttonClasses({ size: "sm" })}
            >
              New course
            </Link>
            <Link
              href="/admin/videos"
              className={buttonClasses({ variant: "outline", size: "sm" })}
            >
              Upload a video
            </Link>
          </>
        }
      />
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.6rem] border border-line bg-line lg:grid-cols-3">
        {figures.map(([label, value]) => (
          <div key={label} className="bg-bg p-5">
            <dt className="text-sm text-subtle">{label}</dt>
            <dd className="tabular mt-1 text-2xl font-semibold tracking-[-0.035em]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg">Newest learners</h2>
            <Link
              href="/admin/users"
              className="text-sm text-muted hover:text-fg"
            >
              See all
            </Link>
          </div>
          <ul className="mt-3 border-t border-line">
            {users.slice(0, 6).map((u) => (
              <li key={u.id} className="border-b border-line">
                <Link
                  href={`/admin/users/${u.id}`}
                  className="flex items-center justify-between gap-4 py-3 hover:text-accent-ink"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {u.fullName ?? u.email}
                    </p>
                    <p className="truncate text-xs text-subtle">{u.email}</p>
                  </div>
                  <span className="tabular shrink-0 text-xs text-subtle">
                    {formatDate(u.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
            {!users.length ? (
              <li className="py-3 text-sm text-muted">No learners yet.</li>
            ) : null}
          </ul>
        </section>
        <section>
          <h2 className="text-lg">Integrations</h2>
          <ul className="mt-3 border-t border-line">
            {integrations.map((i) => (
              <li
                key={i.name}
                className="flex items-center justify-between gap-3 border-b border-line py-3"
              >
                <div>
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-subtle">{i.note}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs",
                    i.ok ? "text-fg" : "text-subtle",
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      i.ok ? "bg-accent" : "border border-line-strong",
                    )}
                  />
                  {i.ok ? "Connected" : "Not set"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section aria-labelledby="activity">
        <h2 id="activity" className="text-lg">
          Recent admin activity
        </h2>
        <ul className="mt-3 border-t border-line">
          {activity.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <p className="min-w-0 text-sm">
                <span className="font-medium">{a.actor}</span> {a.action}{" "}
                {a.targetType === "checkpoint"
                  ? "a checkpoint"
                  : `a ${a.targetType}`}
                {a.summary ? (
                  <span className="text-muted">: {a.summary}</span>
                ) : null}
              </p>
              <span className="tabular shrink-0 text-xs text-subtle">
                {formatDate(a.createdAt, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </li>
          ))}
          {!activity.length ? (
            <li className="py-3 text-sm text-muted">
              Nothing yet. Changes to courses, videos and learners show up here.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
