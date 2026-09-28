/**
 * Central environment access. Supabase is required; Stripe, Resend and Bunny
 * report whether they are configured so the admin health panel can show it.
 */

export const env = {
  siteUrl: () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseAuthHookSecret: () => process.env.SUPABASE_AUTH_HOOK_SECRET ?? "",
  resendApiKey: () => process.env.RESEND_API_KEY ?? "",
  /** Optional SMTP delivery, e.g. smtp://127.0.0.1:54325 for the local Mailpit inbox. Resend's API wins when both are set. */
  smtpUrl: () => process.env.SMTP_URL ?? "",
  emailFrom: () => process.env.EMAIL_FROM ?? "Pintevact <hello@pintevact.com>",
  contactInbox: () => process.env.CONTACT_INBOX ?? "team@pintevact.com",
  stripeSecretKey: () => process.env.STRIPE_SECRET_KEY ?? "",
  /** Optional API origin override, e.g. http://localhost:12111 for Stripe's official stripe-mock server in tests. */
  stripeApiBase: () => process.env.STRIPE_API_BASE ?? "",
  stripeWebhookSecret: () => process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceMonthly: () => process.env.STRIPE_PRICE_MEMBERSHIP_MONTHLY ?? "",
  stripePriceYearly: () => process.env.STRIPE_PRICE_MEMBERSHIP_YEARLY ?? "",
  bunnyLibraryId: () => process.env.BUNNY_STREAM_LIBRARY_ID ?? "",
  bunnyApiKey: () => process.env.BUNNY_STREAM_API_KEY ?? "",
  bunnyCdnHostname: () => process.env.BUNNY_STREAM_CDN_HOSTNAME ?? "",
  bunnyTokenKey: () => process.env.BUNNY_STREAM_TOKEN_KEY ?? "",
  bunnyTokenTtl: () => Number(process.env.BUNNY_STREAM_TOKEN_TTL ?? 14400) || 14400,
  cronSecret: () => process.env.CRON_SECRET ?? "",
  /** Signs learner unsubscribe links. Falls back to the service-role key so links always verify server-side. */
  emailUnsubscribeSecret: () => process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl() && env.supabaseAnonKey());
}

export function isStripeConfigured() {
  return Boolean(env.stripeSecretKey());
}

export function isResendConfigured() {
  return Boolean(env.resendApiKey());
}

export function isEmailConfigured() {
  return Boolean(env.resendApiKey() || env.smtpUrl());
}

export function isBunnyConfigured() {
  return Boolean(env.bunnyCdnHostname());
}
