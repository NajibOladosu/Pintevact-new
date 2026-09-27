import type { Metadata } from "next";
import Link from "next/link";
import { Award, CreditCard, Receipt } from "@/components/icons";
import { AccountTabs } from "@/components/app/account-tabs";
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
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl tracking-tight sm:text-4xl">Billing</h1>
        <AccountTabs active="billing" />
      </header>

      <section className="overflow-hidden rounded-[1.6rem] bg-raised ring-1 ring-line">
        <div className={active ? "bg-violet p-6 text-on-violet sm:p-8" : "p-6 sm:p-8"}>
          <div className="flex items-center gap-3">
            <CreditCard size={18} />
            <p className="text-sm">Membership</p>
          </div>
          {sub && active ? (
            <>
              <h2 className="mt-3 text-3xl tracking-tight">All-Access, {sub.interval === "year" ? "Yearly" : "Monthly"}</h2>
              <p className="tabular mt-2 text-on-violet-muted">
                {sub.cancelAtPeriodEnd ? "Cancels" : "Renews"} on {sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "-"}
                {sub.interval ? `, ${formatPrice(MEMBERSHIP[sub.interval].amountCents)} / ${sub.interval}` : ""}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <form action="/api/stripe/portal" method="post">
                  <button type="submit" className={buttonClasses({ variant: "primary" })}>
                    Manage membership
                  </button>
                </form>
                {sub.cancelAtPeriodEnd ? <span className="self-center text-sm text-on-violet-muted">Cancellation scheduled</span> : null}
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-3xl tracking-tight">{sub?.status === "past_due" ? "Payment needed" : "No active membership"}</h2>
              <p className="mt-2 max-w-xl text-muted">
                {sub?.status === "past_due"
                  ? "Your last payment didn't go through. Update your card to keep All-Access."
                  : "Unlock every current and future course with All-Access, from " + formatPrice(Math.round(MEMBERSHIP.year.amountCents / 12)) + "/month billed yearly."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {sub?.status === "past_due" ? (
                  <form action="/api/stripe/portal" method="post">
                    <button type="submit" className={buttonClasses({ variant: "primary" })}>
                      Update payment method
                    </button>
                  </form>
                ) : (
                  <Link href="/pricing" className={buttonClasses({ variant: "primary" })}>
                    See All-Access
                  </Link>
                )}
                {viewer.profile.stripeCustomerId ? (
                  <form action="/api/stripe/portal" method="post">
                    <button type="submit" className={buttonClasses({ variant: "outline" })}>
                      Invoices & payment methods
                    </button>
                  </form>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-[1.6rem] bg-raised ring-1 ring-line p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Receipt className="text-accent-ink" />
          <h2 className="text-lg">Purchases</h2>
        </div>
        {purchases.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left">
              <thead className="text-sm text-muted">
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
                      <td className="py-3.5 font-medium">{c ? <Link href={`/learn/${c.slug}`} className="hover:text-accent-ink">{c.title}</Link> : "Course"}</td>
                      <td className="py-3.5 text-muted">{formatDate(p.createdAt)}</td>
                      <td className="py-3.5">
                        <Badge tone={p.status === "paid" ? "success" : "neutral"}>{p.status}</Badge>
                      </td>
                      <td className="py-3.5 text-right font-mono">{formatPrice(p.amountCents, p.currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-muted">No one-time purchases yet.</p>
        )}
      </section>

      <section className="rounded-[1.6rem] bg-raised ring-1 ring-line p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Award className="text-accent-ink" />
          <h2 className="text-lg">Certificates</h2>
        </div>
        {certificates.length ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {certificates.map((cert) => (
              <li key={cert.id}>
                <Link href={`/certificates/${cert.id}`} className="block rounded-[1.6rem] border border-line p-4 transition hover:border-line-strong">
                  <p className="font-semibold">{courseById.get(cert.courseId)?.title ?? "Course"}</p>
                  <p className="text-sm text-muted">Issued {formatDate(cert.issuedAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-muted">Finish a course to earn a shareable certificate.</p>
        )}
      </section>
    </div>
  );
}
