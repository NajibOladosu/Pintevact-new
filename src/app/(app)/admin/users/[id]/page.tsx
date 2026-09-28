import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/app/admin-nav";
import { GrantCourse, RevokeCourse, UserAccountActions, UserProfileForm } from "@/components/admin/user-manager";
import { ArrowLeft } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { requireAdmin } from "@/lib/auth/session";
import { getUserDetail } from "@/lib/admin/users";
import { getStore } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Learner" };

const sourceLabel = { free: "Free course", purchase: "Bought", subscription: "Membership", admin: "Granted by admin" } as const;

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [user, courses] = await Promise.all([getUserDetail(id), getStore().listCourses({ includeUnpublished: true })]);
  if (!user) notFound();
  const enrolled = new Set(user.courses.map((c) => c.courseId));
  const activeSub = user.subscriptions.find((s) => ["active", "trialing", "past_due"].includes(s.status));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminNav active="users" title={user.fullName ?? user.email} />
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft size={14} aria-hidden /> All learners
      </Link>

      <section className="flex flex-col gap-6 rounded-[1.6rem] bg-raised p-6 ring-1 ring-line sm:flex-row sm:items-center sm:p-8">
        <Avatar name={user.fullName ?? user.email} src={user.avatarUrl} size={72} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xl font-semibold tracking-[-0.02em]">{user.fullName ?? "No name yet"}</p>
            {user.role === "admin" ? <Badge tone="violet">Admin</Badge> : null}
            {user.suspendedUntil ? <Badge className="bg-danger text-bg">Suspended</Badge> : null}
            {!user.emailConfirmedAt ? <Badge>Email not confirmed</Badge> : null}
          </div>
          <p className="mt-1 truncate text-muted">{user.email}</p>
          <p className="tabular mt-2 text-sm text-subtle">
            Joined {formatDate(user.createdAt)} · Last sign-in {user.lastSignInAt ? formatDate(user.lastSignInAt) : "never"}
            {user.providers.length ? ` · ${user.providers.map((p) => (p === "email" ? "Email" : p[0].toUpperCase() + p.slice(1))).join(", ")}` : ""}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-6 text-center">
          {[
            ["XP", user.xp.toLocaleString()],
            ["Lessons", user.lessonsCompleted.toLocaleString()],
            ["Reflections", user.reflections.toLocaleString()],
          ].map(([k, v]) => (
            <div key={k}>
              <dd className="tabular text-2xl font-semibold tracking-[-0.03em]">{v}</dd>
              <dt className="text-xs text-subtle">{k}</dt>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section aria-labelledby="courses" className="rounded-[1.6rem] bg-raised p-6 ring-1 ring-line sm:p-8">
            <h2 id="courses" className="text-xl">
              Courses
            </h2>
            <ul className="mt-4 divide-y divide-line">
              {user.courses.map((c) => (
                <li key={c.courseId} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/courses/${c.slug}`} className="font-medium hover:text-accent-ink">
                      {c.title}
                    </Link>
                    <p className="tabular mt-0.5 text-xs text-subtle">
                      {sourceLabel[c.source]} · since {formatDate(c.enrolledAt)}
                      {c.completedAt ? ` · finished ${formatDate(c.completedAt)}` : ""}
                    </p>
                    <Progress value={c.lessonsTotal ? (c.lessonsDone / c.lessonsTotal) * 100 : 0} label={`${c.title} progress`} className="mt-2 max-w-xs" />
                  </div>
                  <span className="tabular text-sm text-muted">
                    {c.lessonsDone} of {c.lessonsTotal}
                  </span>
                  {c.source === "admin" ? <RevokeCourse userId={user.id} courseId={c.courseId} title={c.title} /> : null}
                </li>
              ))}
              {!user.courses.length ? <li className="py-4 text-sm text-muted">Not enrolled in anything yet.</li> : null}
            </ul>
            <div className="mt-4 border-t border-line pt-4">
              <p className="mb-2 text-sm font-medium">Give free access to a course</p>
              <GrantCourse userId={user.id} courses={courses.filter((c) => !enrolled.has(c.id)).map((c) => ({ id: c.id, title: c.title }))} />
            </div>
          </section>

          <section aria-labelledby="profile" className="rounded-[1.6rem] bg-raised p-6 ring-1 ring-line sm:p-8">
            <h2 id="profile" className="text-xl">
              Profile
            </h2>
            <div className="mt-5">
              <UserProfileForm user={user} />
            </div>
          </section>

          <section aria-labelledby="billing" className="rounded-[1.6rem] bg-raised p-6 ring-1 ring-line sm:p-8">
            <h2 id="billing" className="text-xl">
              Billing
            </h2>
            <p className="mt-2 text-sm text-muted">
              {activeSub ? `All-Access ${activeSub.interval === "year" ? "yearly" : "monthly"}, ${activeSub.status}${activeSub.cancelAtPeriodEnd ? ", ends" : ", renews"} ${activeSub.currentPeriodEnd ? formatDate(activeSub.currentPeriodEnd) : ""}` : "No membership."}
              {user.stripeCustomerId ? (
                <>
                  {" "}
                  Stripe customer <code className="font-mono text-xs text-fg">{user.stripeCustomerId}</code>.
                </>
              ) : null}
            </p>
            {user.purchases.length ? (
              <ul className="mt-4 divide-y divide-line text-sm">
                {user.purchases.map((p) => (
                  <li key={p.id} className="flex justify-between gap-4 py-2.5">
                    <span>{p.courseTitle}</span>
                    <span className="tabular text-muted">
                      {formatPrice(p.amountCents, p.currency)} · {p.status} · {formatDate(p.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {user.certificates.length ? (
              <p className="mt-4 text-sm">
                Certificates:{" "}
                {user.certificates.map((c, i) => (
                  <span key={c.id}>
                    {i ? ", " : ""}
                    <Link href={`/certificates/${c.id}`} className="text-accent-ink hover:underline">
                      {c.courseTitle}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
          </section>
        </div>

        <aside aria-labelledby="account" className="rounded-[1.6rem] bg-raised p-6 ring-1 ring-line lg:sticky lg:top-24">
          <h2 id="account" className="text-lg">
            Account
          </h2>
          <p className="mt-1 text-sm text-muted">Every change here is recorded in the admin activity log.</p>
          <div className="mt-5">
            <UserAccountActions user={user} isSelf={user.id === admin.id} />
          </div>
        </aside>
      </div>
    </div>
  );
}
