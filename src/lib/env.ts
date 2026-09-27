/**
 * Central environment access. Integrations degrade gracefully when their
 * variables are missing so the site runs locally before keys are provided.
 */

export const env = {
  siteUrl: () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseAuthHookSecret: () => process.env.SUPABASE_AUTH_HOOK_SECRET ?? "",
  resendApiKey: () => process.env.RESEND_API_KEY ?? "",
  emailFrom: () => process.env.EMAIL_FROM ?? "Pintevact <hello@pintevact.com>",
  contactInbox: () => process.env.CONTACT_INBOX ?? "team@pintevact.com",
  stripeSecretKey: () => process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: () => process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceMonthly: () => process.env.STRIPE_PRICE_MEMBERSHIP_MONTHLY ?? "",
  stripePriceYearly: () => process.env.STRIPE_PRICE_MEMBERSHIP_YEARLY ?? "",
  bunnyLibraryId: () => process.env.BUNNY_STREAM_LIBRARY_ID ?? "",
  bunnyApiKey: () => process.env.BUNNY_STREAM_API_KEY ?? "",
  bunnyCdnHostname: () => process.env.BUNNY_STREAM_CDN_HOSTNAME ?? "",
  bunnyTokenKey: () => process.env.BUNNY_STREAM_TOKEN_KEY ?? "",
  bunnyTokenTtl: () => Number(process.env.BUNNY_STREAM_TOKEN_TTL ?? 14400) || 14400,
  cronSecret: () => process.env.CRON_SECRET ?? "",
};

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl() && env.supabaseAnonKey());
}

/**
 * Demo mode runs the whole product on an in-memory store. It is enabled
 * explicitly with PINTEVACT_DEMO_MODE=true, or automatically outside
 * production when Supabase has not been configured yet.
 */
export function isDemoMode() {
  const flag = process.env.PINTEVACT_DEMO_MODE;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return !isSupabaseConfigured() && process.env.NODE_ENV !== "production";
}

export function isStripeConfigured() {
  return Boolean(env.stripeSecretKey());
}

export function isResendConfigured() {
  return Boolean(env.resendApiKey());
}

export function isBunnyConfigured() {
  return Boolean(env.bunnyCdnHostname());
}
