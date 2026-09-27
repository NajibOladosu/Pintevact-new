import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/app/admin-nav";
import { requireAdmin } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { isBunnyConfigured, isEmailConfigured, isResendConfigured, isStripeConfigured, isSupabaseConfigured } from "@/lib/env";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  await requireAdmin();
  const store = getStore();
  const [stats, users] = await Promise.all([store.adminStats(), store.adminListUsers()]);
  const integrations = [
    { name: "Supabase", ok: isSupabaseConfigured(), note: "Database and auth" },
    { name: "Stripe", ok: isStripeConfigured(), note: "Payments and memberships" },
    { name: "Email", ok: isEmailConfigured(), note: isResendConfigured() ? "Resend" : "SMTP" },
    { name: "Bunny Stream", ok: isBunnyConfigured(), note: "Video streaming" },
  ];
  const figures = [
    ["Learners", stats.users.toLocaleString()],
    ["One-time revenue", stats.revenueCents ? formatPrice(stats.revenueCents) : "$0"],
    ["Active members", stats.activeSubscriptions.toLocaleString()],
    ["Enrolments", stats.enrollments.toLocaleString()],
    ["Lessons completed", stats.lessonsCompleted.toLocaleString()],
    ["Reflections written", stats.reflections.toLocaleString()],
  ];
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <AdminNav active="overview" />
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.6rem] border border-line bg-line lg:grid-cols-3">
        {figures.map(([label, value]) => (
          <div key={label} className="bg-bg p-5">
            <dt className="text-sm text-subtle">{label}</dt>
            <dd className="tabular mt-1 text-2xl font-semibold tracking-[-0.035em]">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg">Newest learners</h2>
            <Link href="/admin/users" className="text-sm text-muted hover:text-fg">
              See all
            </Link>
          </div>
          <ul className="mt-3 border-t border-line">
            {users.slice(0, 6).map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-4 border-b border-line py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.fullName ?? u.email}</p>
                  <p className="truncate text-xs text-subtle">{u.email}</p>
                </div>
                <span className="tabular shrink-0 text-xs text-subtle">{formatDate(u.createdAt)}</span>
              </li>
            ))}
            {!users.length ? <li className="py-3 text-sm text-muted">No learners yet.</li> : null}
          </ul>
        </section>
        <section>
          <h2 className="text-lg">Integrations</h2>
          <ul className="mt-3 border-t border-line">
            {integrations.map((i) => (
              <li key={i.name} className="flex items-center justify-between gap-3 border-b border-line py-3">
                <div>
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-subtle">{i.note}</p>
                </div>
                <span className={cn("inline-flex items-center gap-1.5 text-xs", i.ok ? "text-fg" : "text-subtle")}>
                  <span className={cn("h-2 w-2 rounded-full", i.ok ? "bg-accent" : "border border-line-strong")} />
                  {i.ok ? "Connected" : "Not set"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
