import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, CreditCard, DollarSign, GraduationCap, NotebookPen, Users } from "lucide-react";
import { AdminNav } from "@/components/app/admin-nav";
import { StatCard } from "@/components/app/stat-card";
import { requireAdmin } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { isBunnyConfigured, isDemoMode, isResendConfigured, isStripeConfigured, isSupabaseConfigured } from "@/lib/env";
import { formatDate, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  await requireAdmin();
  const store = getStore();
  const [stats, users] = await Promise.all([store.adminStats(), store.adminListUsers()]);
  const integrations = [
    { name: "Supabase", ok: isSupabaseConfigured(), note: isDemoMode() ? "Demo mode (in-memory)" : "Database & auth" },
    { name: "Stripe", ok: isStripeConfigured(), note: "Payments & memberships" },
    { name: "Resend", ok: isResendConfigured(), note: "Transactional email" },
    { name: "Bunny Stream", ok: isBunnyConfigured(), note: "Video streaming" },
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <AdminNav active="overview" />
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Learners" value={stats.users} icon={Users} />
        <StatCard label="Revenue (one-time)" value={formatPrice(stats.revenueCents) === "Free" ? "$0" : formatPrice(stats.revenueCents)} icon={DollarSign} accent="text-ember" />
        <StatCard label="Active members" value={stats.activeSubscriptions} icon={CreditCard} accent="text-iris-2" />
        <StatCard label="Enrolments" value={stats.enrollments} icon={GraduationCap} accent="text-tide" />
        <StatCard label="Lessons completed" value={stats.lessonsCompleted} icon={BookOpenCheck} />
        <StatCard label="Reflections written" value={stats.reflections} icon={NotebookPen} accent="text-sun" />
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-night-2 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Newest learners</h2>
            <Link href="/admin/users" className="text-sm font-semibold text-lucid">
              All →
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-white/10">
            {users.slice(0, 6).map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{u.fullName ?? u.email}</p>
                  <p className="truncate text-sm text-mist">{u.email}</p>
                </div>
                <span className="shrink-0 text-sm text-mist">{formatDate(u.createdAt)}</span>
              </li>
            ))}
            {!users.length ? <li className="py-3 text-mist">No learners yet.</li> : null}
          </ul>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-night-2 p-6">
          <h2 className="text-2xl">Integrations</h2>
          <ul className="mt-4 space-y-3">
            {integrations.map((i) => (
              <li key={i.name} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 p-3">
                <div>
                  <p className="font-semibold">{i.name}</p>
                  <p className="text-sm text-mist">{i.note}</p>
                </div>
                <span className={cn("rounded-full px-3 py-1 font-mono text-xs font-semibold", i.ok ? "bg-lucid text-ink" : "bg-white/10 text-mist")}>{i.ok ? "Connected" : "Not set"}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
