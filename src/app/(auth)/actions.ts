"use server";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";
import { safeRedirect } from "@/lib/utils";
import { emailSchema, fieldErrors, forgotSchema, loginSchema, resetSchema, signupSchema, type FormState } from "@/lib/validation";

/** Every email link returns through /auth/callback, which completes PKCE when needed. */
const callbackTo = (next: string) => `${env.siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;

function friendlyAuthError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match. Try again or reset your password.";
  if (m.includes("email not confirmed")) return "Please confirm your email first, check your inbox for the link.";
  if (m.includes("already registered") || m.includes("already been registered")) return "An account with this email already exists. Try signing in.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Take a breath and try again in a minute.";
  if (m.includes("same_password") || m.includes("different from the old")) return "Your new password must be different from the old one.";
  return message;
}

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: { email: raw.email ?? "" } };
  const next = safeRedirect(parsed.data.next);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return { message: friendlyAuthError(error.message), values: { email: parsed.data.email } };
  redirect(next);
}

export async function sendMagicLink(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { errors: { email: parsed.error.issues[0].message } };
  const next = safeRedirect(String(formData.get("next") ?? ""));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { shouldCreateUser: false, emailRedirectTo: callbackTo(next) },
  });
  if (error) return { message: friendlyAuthError(error.message), values: { email: parsed.data } };
  return { ok: true, message: `We sent a sign-in link to ${parsed.data}. It expires in one hour.` };
}

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: { email: raw.email ?? "", fullName: raw.fullName ?? "" } };
  const { email, password, fullName } = parsed.data;
  const next = safeRedirect(parsed.data.next, "/dashboard?welcome=1");


  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo: callbackTo(next) },
  });
  if (error) return { message: friendlyAuthError(error.message), values: { email, fullName } };
  if (data.session) {
    // Email confirmation disabled in Supabase, the user is signed in immediately.
    await notify.welcome({ email, name: fullName });
    redirect(next);
  }
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const success = { ok: true, message: `If an account exists for ${parsed.data.email}, a reset link is on its way.` };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: callbackTo("/reset-password") });
  // Never reveal whether an account exists; only surface rate limits.
  if (error && /rate|too many/i.test(error.message)) return { message: friendlyAuthError(error.message) };
  return success;
}

export async function updatePassword(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { message: "Your reset link has expired. Please request a new one." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { message: friendlyAuthError(error.message) };
  redirect("/dashboard?password=updated");
}

export async function resendConfirmation(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { errors: { email: parsed.error.issues[0].message } };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email: parsed.data, options: { emailRedirectTo: callbackTo("/dashboard?welcome=1") } });
  if (error) return { message: friendlyAuthError(error.message) };
  return { ok: true, message: "Sent! Check your inbox (and spam, just in case)." };
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeRedirect(String(formData.get("next") ?? ""));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackTo(next) },
  });
  if (error || !data.url) redirect(`/signin?error=${encodeURIComponent("Google sign-in is unavailable right now.")}`);
  redirect(data.url);
}
