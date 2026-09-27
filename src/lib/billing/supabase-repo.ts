import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSubscription } from "@/lib/data/supabase-store";
import type { CommerceRepo } from "./webhook";

/** Service-role implementation of the commerce repository used by the Stripe webhook. */
export function createSupabaseCommerceRepo(): CommerceRepo {
  const db = createAdminClient();
  return {
    async claimEvent(id, type) {
      const { error } = await db.from("stripe_events").insert({ id, type });
      if (error?.code === "23505") return false;
      if (error) throw new Error(error.message);
      return true;
    },
    async releaseEvent(id) {
      await db.from("stripe_events").delete().eq("id", id);
    },
    async findUserByCustomer(customerId) {
      const { data } = await db.from("profiles").select("id").eq("stripe_customer_id", customerId).maybeSingle();
      return data?.id ?? null;
    },
    async getUser(userId) {
      const { data } = await db.from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
      return data ? { email: data.email, name: data.full_name } : null;
    },
    async setCustomer(userId, customerId) {
      await db.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId).is("stripe_customer_id", null);
    },
    async getCourse(courseId) {
      const { data } = await db.from("courses").select("id, title, slug").eq("id", courseId).maybeSingle();
      return data ?? null;
    },
    async recordPurchase(p) {
      const { data: existing } = await db.from("purchases").select("id").eq("stripe_checkout_session_id", p.sessionId).maybeSingle();
      if (existing) return false;
      const { error } = await db.from("purchases").insert({
        user_id: p.userId,
        course_id: p.courseId,
        stripe_checkout_session_id: p.sessionId,
        stripe_payment_intent_id: p.paymentIntentId,
        amount_cents: p.amountCents,
        currency: p.currency,
        status: "paid",
      });
      if (error?.code === "23505") return false;
      if (error) throw new Error(error.message);
      return true;
    },
    async refundPurchase(paymentIntentId) {
      await db.from("purchases").update({ status: "refunded" }).eq("stripe_payment_intent_id", paymentIntentId);
    },
    async enroll(userId, courseId, source) {
      const { error } = await db.from("enrollments").upsert({ user_id: userId, course_id: courseId, source }, { onConflict: "user_id,course_id", ignoreDuplicates: true });
      if (error) throw new Error(error.message);
    },
    async upsertSubscription(userId, sub) {
      const { data: previous } = await db.from("subscriptions").select("*").eq("id", sub.id).maybeSingle();
      const { error } = await db.from("subscriptions").upsert({
        id: sub.id,
        user_id: userId,
        status: sub.status,
        price_id: sub.priceId,
        interval: sub.interval,
        current_period_end: sub.currentPeriodEnd,
        cancel_at_period_end: sub.cancelAtPeriodEnd,
      });
      if (error) throw new Error(error.message);
      return previous ? mapSubscription(previous) : null;
    },
  };
}
