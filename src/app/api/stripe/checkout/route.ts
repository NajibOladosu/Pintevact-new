import { NextResponse, type NextRequest } from "next/server";
import { getCourse, getStore, getViewer } from "@/lib/data";
import { canAccessCourse, hasActiveSubscription } from "@/lib/access";
import { env, isStripeConfigured } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { courseCheckoutParams, membershipCheckoutParams } from "@/lib/billing/checkout";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BillingInterval } from "@/lib/pricing";

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
  if (!viewer) return redirect(request, `/signin?next=${encodeURIComponent(backTo)}`);
  const store = getStore();
  const access = await store.getAccess(viewer.id);

  if (mode === "course") {
    const course = await getCourse(courseSlug);
    if (!course) return redirect(request, "/courses");
    if (canAccessCourse(course, access)) return redirect(request, `/learn/${course.slug}`);

    if (!isStripeConfigured()) return redirect(request, `${backTo}?error=payments-unavailable`);

    const customerId = await ensureCustomer(viewer.id, viewer.email, viewer.profile.fullName, viewer.profile.stripeCustomerId);
    const session = await getStripe().checkout.sessions.create(courseCheckoutParams(course, { siteUrl: env.siteUrl(), userId: viewer.id, customerId }));
    return redirect(request, session.url!);
  }

  if (mode === "membership") {
    if (hasActiveSubscription(access)) return redirect(request, "/account/billing");

    if (!isStripeConfigured()) return redirect(request, "/pricing?error=payments-unavailable");

    const customerId = await ensureCustomer(viewer.id, viewer.email, viewer.profile.fullName, viewer.profile.stripeCustomerId);
    const priceId = interval === "month" ? env.stripePriceMonthly() : env.stripePriceYearly();
    const session = await getStripe().checkout.sessions.create(membershipCheckoutParams(interval, priceId || undefined, { siteUrl: env.siteUrl(), userId: viewer.id, customerId }));
    return redirect(request, session.url!);
  }

  return redirect(request, "/pricing");
}
