import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Award, CreditCard, Receipt } from "lucide-react";
import { AccountTabs } from "@/components/app/account-tabs";
import { Flash } from "@/components/app/flash";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth/session";
import { getCourses, getStore } from "@/lib/data";
import { hasActiveSubscription } from "@/lib/access";
import { MEMBERSHIP } from "@/lib/pricing";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const viewer = await requireViewer();
  const store = getStore();
  const [access, purchases, certificates, courses] = await Promise.all([store.getAccess(viewer.id), store.listPurchases(viewer.id), store.listCertificates(viewer.id), getCourses()]);
  const sub = access.subscription;
  const active = hasActiveSubscription(access);
  const courseById = new Map(courses.map((c) => [c.id, c]));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Suspense>
        <Flash />
      </Suspense>
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl sm:text-5xl">Billing</h1>
        <AccountTabs active="billing" />
      </header>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-night-2">
        <div className={active ? "bg-gradient-to-r from-iris/40 to-ember/30 p-6 sm:p-8" : "p-6 sm:p-8"}>
          <div className="flex items-center gap-3">
            <CreditCard className="text-lucid" />
            <p className="eyebrow text-mist">Membership</p>
          </div>
          {sub && active ? (
            <>
              <h2 className="mt-3 text-4xl">All-Access · {sub.interval === "year" ? "Yearly" : "Monthly"}</h2>
              <p className="mt-2 text-paper/85">
                {sub.cancelAtPeriodEnd ? "Cancels" : "Renews"} on {sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "—"}
                {sub.interval ? ` · ${formatPrice(MEMBERSHIP[sub.interval].amountCents)} / ${sub.interval}` : ""}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <form action="/api/stripe/portal" method="post">
                  <button type="submit" className={buttonClasses({ variant: "lucid" })}>
                    Manage membership
                  </button>
                </form>
                {sub.cancelAtPeriodEnd ? <Badge tone="ember">Cancellation scheduled</Badge> : <Badge tone="lucid">Active</Badge>}
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-4xl">{sub?.status === "past_due" ? "Payment needed" : "No active membership"}</h2>
              <p className="mt-2 max-w-xl text-mist">
                {sub?.status === "past_due"
                  ? "Your last payment didn't go through. Update your card to keep All-Access."
                  : "Unlock every current and future course with All-Access — from " + formatPrice(Math.round(MEMBERSHIP.year.amountCents / 12)) + "/month billed yearly."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {sub?.status === "past_due" ? (
                  <form action="/api/stripe/portal" method="post">
                    <button type="submit" className={buttonClasses({ variant: "primary" })}>
                      Update payment method
                    </button>
                  </form>
                ) : (
                  <Link href="/pricing" className={buttonClasses({ variant: "lucid" })}>
                    See All-Access
                  </Link>
                )}
                {viewer.profile.stripeCustomerId ? (
                  <form action="/api/stripe/portal" method="post">
                    <button type="submit" className={buttonClasses({ variant: "subtle" })}>
                      Invoices & payment methods
                    </button>
                  </form>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-night-2 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Receipt className="text-lucid" />
          <h2 className="text-2xl">Purchases</h2>
        </div>
        {purchases.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left">
              <thead className="eyebrow text-mist">
                <tr>
                  <th className="pb-3 font-normal">Course</th>
                  <th className="pb-3 font-normal">Date</th>
                  <th className="pb-3 font-normal">Status</th>
                  <th className="pb-3 text-right font-normal">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {purchases.map((p) => {
                  const c = courseById.get(p.courseId);
                  return (
                    <tr key={p.id}>
                      <td className="py-3.5 font-medium">{c ? <Link href={`/learn/${c.slug}`} className="hover:text-lucid">{c.title}</Link> : "Course"}</td>
                      <td className="py-3.5 text-mist">{formatDate(p.createdAt)}</td>
                      <td className="py-3.5">
                        <Badge tone={p.status === "paid" ? "lucid" : "outline"}>{p.status}</Badge>
                      </td>
                      <td className="py-3.5 text-right font-mono">{formatPrice(p.amountCents, p.currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-mist">No one-time purchases yet.</p>
        )}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-night-2 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Award className="text-lucid" />
          <h2 className="text-2xl">Certificates</h2>
        </div>
        {certificates.length ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {certificates.map((cert) => (
              <li key={cert.id}>
                <Link href={`/certificates/${cert.id}`} className="block rounded-2xl border border-white/10 p-4 transition hover:border-lucid/50">
                  <p className="font-semibold">{courseById.get(cert.courseId)?.title ?? "Course"}</p>
                  <p className="text-sm text-mist">Issued {formatDate(cert.issuedAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-mist">Finish a course to earn a shareable certificate.</p>
        )}
      </section>
    </div>
  );
}
