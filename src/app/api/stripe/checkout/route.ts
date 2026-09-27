import { NextResponse, type NextRequest } from "next/server";
import { getCourse, getStore, getViewer } from "@/lib/data";
import { canAccessCourse, hasActiveSubscription } from "@/lib/access";
import { env, isDemoMode, isStripeConfigured } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { courseCheckoutParams, membershipCheckoutParams } from "@/lib/billing/checkout";
import { createAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notifications";
import { MEMBERSHIP, type BillingInterval } from "@/lib/pricing";

const redirect = (request: NextRequest, path: string) => NextResponse.redirect(new URL(path, request.url), { status: 303 });

async function ensureCustomer(userId: string, email: string, name: string | null, existing: string | null) {
  if (existing) return existing;
  const customer = await getStripe().customers.create({ email, name: name ?? undefined, metadata: { user_id: userId } });
  await createAdminClient().from("profiles").update({ stripe_customer_id: customer.id }).eq("id", userId);
  return customer.id;
}

/** Starts Stripe Checkout for a course purchase or the All-Access membership. */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const mode = String(form.get("mode") ?? "");
  const courseSlug = String(form.get("courseSlug") ?? "");
  const interval: BillingInterval = form.get("interval") === "month" ? "month" : "year";
  const backTo = mode === "course" ? `/courses/${courseSlug}` : "/pricing";

  const viewer = await getViewer();
  if (!viewer) return redirect(request, `/login?next=${encodeURIComponent(backTo)}`);
  const store = getStore();
  const access = await store.getAccess(viewer.id);

  if (mode === "course") {
    const course = await getCourse(courseSlug);
    if (!course) return redirect(request, "/courses");
    if (canAccessCourse(course, access)) return redirect(request, `/learn/${course.slug}`);

    // Local demo: simulate a successful payment.
    if (isDemoMode() || (!isStripeConfigured() && process.env.NODE_ENV !== "production")) {
      await store.recordPurchase(viewer.id, course.id, course.priceCents, course.currency, `demo_${crypto.randomUUID()}`);
      await store.enroll(viewer.id, course.id, "purchase");
      await notify.purchaseReceipt({ email: viewer.email, name: viewer.profile.fullName }, { courseTitle: course.title, courseSlug: course.slug, amountCents: course.priceCents, currency: course.currency, orderId: "DEMO" });
      return redirect(request, `/learn/${course.slug}?purchased=1`);
    }
    if (!isStripeConfigured()) return redirect(request, `${backTo}?error=payments-unavailable`);

    const customerId = await ensureCustomer(viewer.id, viewer.email, viewer.profile.fullName, viewer.profile.stripeCustomerId);
    const session = await getStripe().checkout.sessions.create(courseCheckoutParams(course, { siteUrl: env.siteUrl(), userId: viewer.id, customerId }));
    return redirect(request, session.url!);
  }

  if (mode === "membership") {
    if (hasActiveSubscription(access)) return redirect(request, "/account/billing");

    if (isDemoMode() || (!isStripeConfigured() && process.env.NODE_ENV !== "production")) {
      const periodEnd = new Date(Date.now() + (interval === "year" ? 365 : 30) * 86_400_000).toISOString();
      await store.upsertSubscription(viewer.id, { id: `demo_sub_${viewer.id}`, status: "active", priceId: null, interval, currentPeriodEnd: periodEnd, cancelAtPeriodEnd: false });
      await notify.membershipStarted({ email: viewer.email, name: viewer.profile.fullName }, { interval, amountCents: MEMBERSHIP[interval].amountCents, currency: "usd", renewsOn: periodEnd });
      return redirect(request, "/dashboard?membership=1");
    }
    if (!isStripeConfigured()) return redirect(request, "/pricing?error=payments-unavailable");

    const customerId = await ensureCustomer(viewer.id, viewer.email, viewer.profile.fullName, viewer.profile.stripeCustomerId);
    const priceId = interval === "month" ? env.stripePriceMonthly() : env.stripePriceYearly();
    const session = await getStripe().checkout.sessions.create(membershipCheckoutParams(interval, priceId || undefined, { siteUrl: env.siteUrl(), userId: viewer.id, customerId }));
    return redirect(request, session.url!);
  }

  return redirect(request, "/pricing");
}
