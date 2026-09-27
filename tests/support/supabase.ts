import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { local } from "./local-services";

let adminClient: SupabaseClient | null = null;

/** Service-role client for arranging test data. */
export function admin() {
  adminClient ??= createClient(local.supabaseUrl, local.serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return adminClient;
}

let counter = 0;
export function uniqueEmail(prefix = "learner") {
  return `${prefix}.${Date.now()}.${process.pid}.${counter++}@example.test`;
}

export const TEST_PASSWORD = "mindful-123";

/** Creates a confirmed user (the profile row is created by the database trigger). */
export async function createUser(opts: { email?: string; name?: string; role?: "student" | "admin" } = {}) {
  const email = opts.email ?? uniqueEmail();
  const { data, error } = await admin().auth.admin.createUser({ email, password: TEST_PASSWORD, email_confirm: true, user_metadata: { full_name: opts.name ?? "Test Learner" } });
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message}`);
  if (opts.role === "admin") {
    const res = await admin().from("profiles").update({ role: "admin" }).eq("id", data.user.id);
    if (res.error) throw new Error(res.error.message);
  }
  return { id: data.user.id, email, password: TEST_PASSWORD };
}

/** A client signed in as the given user, so row-level security applies exactly as in the app. */
export async function signedInClient(email: string, password = TEST_PASSWORD) {
  const client = createClient(local.supabaseUrl, local.anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign in failed: ${error.message}`);
  return client;
}

/** Points every lesson at the local HLS fixture that matches its length. */
export async function attachFixtureVideos() {
  const { data, error } = await admin().from("lessons").select("id, duration_seconds");
  if (error) throw new Error(error.message);
  const available = new Set([420, 480, 540]);
  for (const row of data ?? []) {
    const d = Number(row.duration_seconds);
    const id = available.has(d) ? `e2e-${d}` : null;
    const res = await admin().from("lessons").update({ bunny_video_id: id }).eq("id", row.id);
    if (res.error) throw new Error(res.error.message);
  }
}
