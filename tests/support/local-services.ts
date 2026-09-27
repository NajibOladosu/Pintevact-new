/**
 * Endpoints of the local test stack (see README "Testing"): `supabase start` provides Postgres, Auth,
 * PostgREST and the Mailpit inbox; stripe/stripe-mock serves the Stripe API; the video fixture server
 * streams real HLS. The Supabase keys are the fixed development keys the Supabase CLI ships with.
 */
export const local = {
  siteUrl: process.env.E2E_SITE_URL ?? "http://localhost:3100",
  supabaseUrl: process.env.TEST_SUPABASE_URL ?? "http://127.0.0.1:54321",
  anonKey:
    process.env.TEST_SUPABASE_ANON_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
  serviceRoleKey:
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
  mailpitUrl: process.env.TEST_MAILPIT_URL ?? "http://127.0.0.1:54324",
  smtpUrl: process.env.TEST_SMTP_URL ?? "smtp://127.0.0.1:54325",
  stripeApiBase: process.env.TEST_STRIPE_API_BASE ?? "http://localhost:12111",
  // stripe-mock accepts any well-formed test key; this one is local-only and not a real account.
  stripeSecretKey: ["sk", "test", "pintevactLocalStripeMock"].join("_"),
  stripeWebhookSecret: "whsec_pintevact_local_webhook_secret",
  authHookSecret: `v1,whsec_${Buffer.from("pintevact-local-auth-hook-secret").toString("base64")}`,
  videoOrigin: process.env.TEST_VIDEO_ORIGIN ?? "http://127.0.0.1:4010",
  cronSecret: "pintevact-local-cron-secret",
};

/** Environment for the app under test, pointing every integration at the local stack. */
export function appEnv(): Record<string, string> {
  return {
    NEXT_PUBLIC_SITE_URL: local.siteUrl,
    NEXT_PUBLIC_SUPABASE_URL: local.supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: local.anonKey,
    SUPABASE_SERVICE_ROLE_KEY: local.serviceRoleKey,
    SUPABASE_AUTH_HOOK_SECRET: local.authHookSecret,
    SMTP_URL: local.smtpUrl,
    RESEND_API_KEY: "",
    EMAIL_FROM: "Pintevact <hello@pintevact.com>",
    CONTACT_INBOX: "team@pintevact.com",
    STRIPE_SECRET_KEY: local.stripeSecretKey,
    STRIPE_WEBHOOK_SECRET: local.stripeWebhookSecret,
    STRIPE_API_BASE: local.stripeApiBase,
    STRIPE_PRICE_MEMBERSHIP_MONTHLY: "",
    STRIPE_PRICE_MEMBERSHIP_YEARLY: "",
    BUNNY_STREAM_CDN_HOSTNAME: local.videoOrigin,
    BUNNY_STREAM_TOKEN_KEY: "",
    BUNNY_STREAM_LIBRARY_ID: "",
    BUNNY_STREAM_API_KEY: "",
    CRON_SECRET: local.cronSecret,
  };
}
