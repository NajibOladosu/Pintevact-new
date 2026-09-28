import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Unsubscribe tokens.
 *   u.<userId>.<signature>  a learner turning off reminders, digests and announcements (profiles.email_opt_in)
 *   n.<token>               a Thursday-letter subscriber (newsletter_subscribers.unsubscribe_token)
 * Learner tokens are HMAC-signed so they can't be forged for someone else's account.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sign(userId: string) {
  const secret = env.emailUnsubscribeSecret();
  if (!secret) throw new Error("EMAIL_UNSUBSCRIBE_SECRET (or SUPABASE_SERVICE_ROLE_KEY) is required to sign unsubscribe links");
  return createHmac("sha256", secret).update(`unsubscribe:${userId}`).digest("base64url").slice(0, 32);
}

export function learnerUnsubscribeToken(userId: string) {
  return `u.${userId}.${sign(userId)}`;
}

export function newsletterUnsubscribeToken(subscriberToken: string) {
  return `n.${subscriberToken}`;
}

export type ParsedToken = { kind: "learner"; userId: string } | { kind: "newsletter"; token: string };

export function parseUnsubscribeToken(raw: string | null | undefined): ParsedToken | null {
  if (!raw) return null;
  const [kind, id, sig] = raw.split(".");
  if (kind === "n" && id && UUID.test(id) && sig === undefined) return { kind: "newsletter", token: id };
  if (kind === "u" && id && UUID.test(id) && sig) {
    const expected = Buffer.from(sign(id));
    const given = Buffer.from(sig);
    if (expected.length === given.length && timingSafeEqual(expected, given)) return { kind: "learner", userId: id };
  }
  return null;
}

/**
 * The visible link goes to a confirmation page (so link scanners can't unsubscribe anyone), while the
 * List-Unsubscribe header points at an endpoint that honours RFC 8058 one-click POSTs from Gmail and Apple Mail.
 */
export function unsubscribeLinks(token: string) {
  const site = env.siteUrl();
  const t = encodeURIComponent(token);
  return {
    url: `${site}/unsubscribe?t=${t}`,
    headers: {
      "List-Unsubscribe": `<${site}/api/unsubscribe?t=${t}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

/** Applies an unsubscribe. Returns what was turned off, or null for an invalid token. */
export async function applyUnsubscribe(raw: string | null | undefined): Promise<"learner" | "newsletter" | null> {
  const parsed = parseUnsubscribeToken(raw);
  if (!parsed) return null;
  const db = createAdminClient();
  if (parsed.kind === "learner") {
    const { error } = await db.from("profiles").update({ email_opt_in: false }).eq("id", parsed.userId);
    if (error) throw new Error(error.message);
    return "learner";
  }
  const { data, error } = await db.from("newsletter_subscribers").update({ unsubscribed_at: new Date().toISOString() }).eq("unsubscribe_token", parsed.token).select("email");
  if (error) throw new Error(error.message);
  return data?.length ? "newsletter" : null;
}
