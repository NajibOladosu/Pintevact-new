"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { attempt, type ActionResult } from "@/lib/admin/action";
import { audit } from "@/lib/admin/audit";
import * as users from "@/lib/admin/users";
import { userProfileSchema } from "@/lib/admin/schemas";
import { fieldErrors, type FormState } from "@/lib/validation";

const uuid = z.string().uuid();

function refresh(userId: string) {
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function saveUserProfile(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = userProfileSchema.safeParse({ ...raw, emailOptIn: raw.emailOptIn === "on" });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const res = await attempt(() => users.updateUserProfile(parsed.data.userId, parsed.data));
  if (!res.ok) return { message: res.error };
  await audit(admin.id, "edited profile", "user", parsed.data.userId, parsed.data.fullName ?? "");
  refresh(parsed.data.userId);
  return { ok: true, message: "Profile saved." };
}

export async function setRole(userId: string, role: "student" | "admin"): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => users.setUserRole(admin.id, uuid.parse(userId), role === "admin" ? "admin" : "student"), role === "admin" ? "Now an admin." : "Admin access removed.");
  if (res.ok) {
    await audit(admin.id, role === "admin" ? "made admin" : "removed admin", "user", userId, "");
    refresh(userId);
  }
  return res;
}

export async function grantCourse(userId: string, courseId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => users.grantCourse(uuid.parse(userId), uuid.parse(courseId)), "Course access granted.");
  if (res.ok) {
    await audit(admin.id, "granted course", "user", userId, courseId);
    refresh(userId);
  }
  return res;
}

export async function revokeCourse(userId: string, courseId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => users.revokeCourse(uuid.parse(userId), uuid.parse(courseId)), "Access revoked.");
  if (res.ok) {
    await audit(admin.id, "revoked course", "user", userId, courseId);
    refresh(userId);
  }
  return res;
}

export async function sendReset(userId: string, email: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => users.sendPasswordReset(z.string().email().parse(email)), `Reset link sent to ${email}.`);
  if (res.ok) await audit(admin.id, "sent password reset", "user", userId, email);
  return res;
}

export async function setSuspended(userId: string, suspended: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => users.setSuspended(admin.id, uuid.parse(userId), suspended), suspended ? "Suspended. They can't sign in until you lift it." : "Suspension lifted.");
  if (res.ok) {
    await audit(admin.id, suspended ? "suspended" : "unsuspended", "user", userId, "");
    refresh(userId);
  }
  return res;
}

export async function deleteUser(userId: string, email: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => users.deleteUser(admin.id, uuid.parse(userId)));
  if (!res.ok) return res;
  await audit(admin.id, "deleted", "user", userId, email);
  revalidatePath("/admin/users");
  redirect("/admin/users?deleted=1");
}
