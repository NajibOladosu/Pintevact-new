"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getStore, getViewer } from "@/lib/data";
import { env, isStripeConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { notify } from "@/lib/notifications";
import { emailSchema, fieldErrors, passwordSchema, profileSchema, type FormState } from "@/lib/validation";

async function viewerOrThrow() {
  const viewer = await getViewer();
  if (!viewer) throw new Error("Not signed in");
  return viewer;
}

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const viewer = await viewerOrThrow();
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    headline: formData.get("headline") ?? "",
    emailOptIn: formData.get("emailOptIn") === "on",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  await getStore().updateProfile(viewer.id, { fullName: parsed.data.fullName, headline: parsed.data.headline || null, emailOptIn: parsed.data.emailOptIn });
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved." };
}

export async function changeEmail(_: FormState, formData: FormData): Promise<FormState> {
  const viewer = await viewerOrThrow();
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { errors: { email: parsed.error.issues[0].message } };
  if (parsed.data === viewer.email) return { errors: { email: "That's already your email." } };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: parsed.data }, { emailRedirectTo: `${env.siteUrl()}/auth/callback?next=${encodeURIComponent("/account?email=updated")}` });
  if (error) return { message: error.message };
  return { ok: true, message: `Check ${parsed.data} (and your current inbox) to confirm the change.` };
}

const passwordChangeSchema = z
  .object({ current: z.string().min(1, "Enter your current password"), password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const viewer = await viewerOrThrow();
  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const supabase = await createClient();
  const { error: authError } = await supabase.auth.signInWithPassword({ email: viewer.email, password: parsed.data.current });
  if (authError) return { errors: { current: "Current password is incorrect." } };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { message: error.message };
  await notify.passwordChanged({ email: viewer.email, name: viewer.profile.fullName }).catch(console.error);
  return { ok: true, message: "Password updated." };
}

export async function deleteAccount(_: FormState, formData: FormData): Promise<FormState> {
  const viewer = await viewerOrThrow();
  if (formData.get("confirm") !== "DELETE") return { errors: { confirm: 'Type "DELETE" to confirm.' } };

  // Cancel any live membership so the learner is never billed again.
  const access = await getStore().getAccess(viewer.id);
  if (isStripeConfigured() && access.subscription && ["active", "trialing", "past_due"].includes(access.subscription.status)) {
    await getStripe().subscriptions.cancel(access.subscription.id).catch(console.error);
  }
  const { error } = await createAdminClient().auth.admin.deleteUser(viewer.id);
  if (error) return { message: "We couldn't delete your account. Please contact support." };
  await notify.accountDeleted({ email: viewer.email, name: viewer.profile.fullName }).catch(console.error);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
