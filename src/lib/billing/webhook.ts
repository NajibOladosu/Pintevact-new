import type Stripe from "stripe";
import type { Subscription } from "@/lib/types";

/** Persistence the webhook needs, implemented with the Supabase service role in production. */
export interface CommerceRepo {
  claimEvent(id: string, type: string): Promise<boolean>;
  releaseEvent(id: string): Promise<void>;
  findUserByCustomer(customerId: string): Promise<string | null>;
  getUser(userId: string): Promise<{ email: string; name: string | null } | null>;
  setCustomer(userId: string, customerId: string): Promise<void>;
  getCourse(courseId: string): Promise<{ id: string; title: string; slug: string } | null>;
  recordPurchase(p: { userId: string; courseId: string; sessionId: string; paymentIntentId: string | null; amountCents: number; currency: string }): Promise<boolean>;
  refundPurchase(paymentIntentId: string): Promise<void>;
  enroll(userId: string, courseId: string, source: "purchase" | "subscription"): Promise<void>;
  upsertSubscription(userId: string, sub: Subscription): Promise<Subscription | null>;
}

export interface BillingNotifier {
  purchaseReceipt(to: { email: string; name: string | null }, p: { courseTitle: string; courseSlug: string; amountCents: number; currency: string; orderId: string; ref?: string }): Promise<unknown>;
  membershipStarted(to: { email: string; name: string | null }, p: { interval: "month" | "year"; amountCents: number; currency: string; renewsOn: string | null; ref?: string }): Promise<unknown>;
  membershipCanceled(to: { email: string; name: string | null }, accessUntil: string | null, ref?: string): Promise<unknown>;
  paymentFailed(to: { email: string; name: string | null }, amountCents: number, currency: string, ref?: string): Promise<unknown>;
}

export type WebhookDeps = {
  repo: CommerceRepo;
  notify: BillingNotifier;
  retrieveSubscription: (id: string) => Promise<Stripe.Subscription>;
};

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : (v?.id ?? null));

export function mapStripeSubscription(sub: Stripe.Subscription): Subscription {
  const item = sub.items?.data?.[0];
  const periodEnd = item?.current_period_end ?? null;
  const interval: string | undefined = item?.price?.recurring?.interval;
  return {
    id: sub.id,
    status: sub.status as Subscription["status"],
    priceId: item?.price?.id ?? null,
    interval: interval === "month" ? "month" : interval === "year" ? "year" : null,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
  };
}

async function resolveUser(repo: CommerceRepo, metadataUserId: string | undefined | null, customerId: string | null) {
  if (metadataUserId) return metadataUserId;
  if (customerId) return repo.findUserByCustomer(customerId);
  return null;
}

/** Idempotently apply a verified Stripe event. Returns a short description for logs. */
export async function handleStripeEvent(event: Stripe.Event, deps: WebhookDeps): Promise<string> {
  const { repo, notify } = deps;
  if (!(await repo.claimEvent(event.id, event.type))) return "duplicate";

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (event.type === "checkout.session.completed" && session.payment_status === "unpaid") return "awaiting async payment";
        const customerId = idOf(session.customer);
        const userId = await resolveUser(repo, session.metadata?.user_id ?? session.client_reference_id, customerId);
        if (!userId) return "no user";
        if (customerId) await repo.setCustomer(userId, customerId);
        const user = await repo.getUser(userId);

        if (session.mode === "payment" && session.metadata?.course_id) {
          const course = await repo.getCourse(session.metadata.course_id);
          if (!course) return "unknown course";
          const created = await repo.recordPurchase({
            userId,
            courseId: course.id,
            sessionId: session.id,
            paymentIntentId: idOf(session.payment_intent),
            amountCents: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
          });
          await repo.enroll(userId, course.id, "purchase");
          if (created && user) {
            await notify.purchaseReceipt(user, { courseTitle: course.title, courseSlug: course.slug, amountCents: session.amount_total ?? 0, currency: session.currency ?? "usd", orderId: session.id.slice(-12), ref: session.id });
          }
          return "purchase recorded";
        }

        if (session.mode === "subscription") {
          const subId = idOf(session.subscription);
          if (!subId) return "no subscription";
          const sub = mapStripeSubscription(await deps.retrieveSubscription(subId));
          const previous = await repo.upsertSubscription(userId, sub);
          if (user && (!previous || (previous.status !== "active" && previous.status !== "trialing"))) {
            await notify.membershipStarted(user, { interval: sub.interval ?? "month", amountCents: session.amount_total ?? 0, currency: session.currency ?? "usd", renewsOn: sub.currentPeriodEnd, ref: sub.id });
          }
          return "subscription started";
        }
        return "ignored session";
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = await resolveUser(repo, stripeSub.metadata?.user_id, idOf(stripeSub.customer));
        if (!userId) return "no user";
        const sub = mapStripeSubscription(stripeSub);
        if (event.type === "customer.subscription.deleted") sub.status = "canceled";
        const previous = await repo.upsertSubscription(userId, sub);
        const user = await repo.getUser(userId);
        if (user && event.type === "customer.subscription.deleted") {
          await notify.membershipCanceled(user, null, event.id);
        } else if (user && sub.cancelAtPeriodEnd && previous && !previous.cancelAtPeriodEnd) {
          await notify.membershipCanceled(user, sub.currentPeriodEnd, event.id);
        }
        return `subscription ${sub.status}`;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = await resolveUser(repo, null, idOf(invoice.customer));
        const user = userId ? await repo.getUser(userId) : null;
        if (user) await notify.paymentFailed(user, invoice.amount_due ?? 0, invoice.currency ?? "usd", event.id);
        return "payment failed notice";
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi = idOf(charge.payment_intent);
        if (pi && charge.refunded) await repo.refundPurchase(pi);
        return "refund recorded";
      }

      default:
        return "ignored";
    }
  } catch (err) {
    // Let Stripe retry: un-claim so the next delivery is processed.
    await repo.releaseEvent(event.id);
    throw err;
  }
}
