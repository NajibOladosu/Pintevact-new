import { attachFixtureVideos } from "../support/supabase";
import { local } from "../support/local-services";

/** Checks the local stack is reachable and points lessons at the HLS fixtures. */
export default async function globalSetup() {
  for (const [name, url] of [
    ["Supabase", `${local.supabaseUrl}/auth/v1/health`],
    ["Mailpit", `${local.mailpitUrl}/api/v1/info`],
    ["stripe-mock", `${local.stripeApiBase}/v1/charges`],
  ] as const) {
    const ok = await fetch(url, { headers: { apikey: local.anonKey, authorization: `Bearer ${local.stripeSecretKey}` } }).then((r) => r.status < 500).catch(() => false);
    if (!ok) throw new Error(`${name} is not reachable at ${url}. Start the local stack with \`npm run stack:up\`.`);
  }
  await attachFixtureVideos();
}
