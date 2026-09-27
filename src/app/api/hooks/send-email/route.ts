import { Webhook } from "standardwebhooks";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { buildAuthEmails, type AuthHookPayload } from "@/lib/auth/email-hook";

/**
 * Supabase Auth "Send Email" hook → branded React Email templates via Resend.
 * Configure in Supabase: Authentication → Hooks → Send Email → HTTPS → {SITE_URL}/api/hooks/send-email
 */
export async function POST(request: Request) {
  const secret = env.supabaseAuthHookSecret();
  if (!secret) return Response.json({ error: { http_code: 500, message: "Auth hook secret not configured" } }, { status: 500 });

  const raw = await request.text();
  let payload: AuthHookPayload;
  try {
    const wh = new Webhook(secret.replace(/^v1,whsec_/, ""));
    payload = wh.verify(raw, Object.fromEntries(request.headers)) as AuthHookPayload;
  } catch {
    return Response.json({ error: { http_code: 401, message: "Invalid signature" } }, { status: 401 });
  }

  const emails = buildAuthEmails(payload, env.siteUrl());
  for (const email of emails) {
    const result = await sendEmail({ ...email, tags: [{ name: "category", value: `auth_${payload.email_data.email_action_type}` }] });
    if (!result.ok) return Response.json({ error: { http_code: 502, message: result.error } }, { status: 502 });
  }
  return Response.json({});
}
