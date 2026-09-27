import type Stripe from "stripe";
import { MEMBERSHIP, type BillingInterval } from "@/lib/pricing";
import type { Course } from "@/lib/types";

type Base = { siteUrl: string; userId: string; customerId: string };

/** Checkout Session params for a one-time course purchase. */
export function courseCheckoutParams(course: Pick<Course, "id" | "slug" | "title" | "subtitle" | "priceCents" | "currency" | "stripePriceId">, { siteUrl, userId, customerId }: Base): Stripe.Checkout.SessionCreateParams {
  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = course.stripePriceId
    ? { price: course.stripePriceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: course.currency,
          unit_amount: course.priceCents,
          product_data: { name: course.title, description: course.subtitle, metadata: { course_id: course.id } },
        },
      };
  return {
    mode: "payment",
    customer: customerId,
    client_reference_id: userId,
    line_items: [lineItem],
    allow_promotion_codes: true,
    metadata: { user_id: userId, course_id: course.id, kind: "course" },
    payment_intent_data: { metadata: { user_id: userId, course_id: course.id } },
    success_url: `${siteUrl}/learn/${course.slug}?purchased=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/courses/${course.slug}?canceled=1`,
  };
}

/** Checkout Session params for the All-Access membership. */
export function membershipCheckoutParams(interval: BillingInterval, priceId: string | undefined, { siteUrl, userId, customerId }: Base): Stripe.Checkout.SessionCreateParams {
  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: MEMBERSHIP[interval].amountCents,
          recurring: { interval },
          product_data: { name: "Pintevact All-Access", description: "Every course, every new release." },
        },
      };
  return {
    mode: "subscription",
    customer: customerId,
    client_reference_id: userId,
    line_items: [lineItem],
    allow_promotion_codes: true,
    metadata: { user_id: userId, kind: "membership" },
    subscription_data: { metadata: { user_id: userId } },
    success_url: `${siteUrl}/dashboard?membership=1`,
    cancel_url: `${siteUrl}/pricing?canceled=1`,
  };
}
