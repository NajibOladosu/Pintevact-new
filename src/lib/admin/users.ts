import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import type { Enrollment, Role, Subscription } from "@/lib/types";
import { AdminError } from "./catalog";

/* eslint-disable @typescript-eslint/no-explicit-any -- PostgREST rows */

const db = () => createAdminClient();

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export const USERS_PER_PAGE = 25;

export type UserListRow = {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  createdAt: string;
  courses: number;
  xp: number;
};

/** A page of learners, newest first, filtered by name or email and role. */
export async function listUsers(opts: { q?: string; role?: Role | "all"; page?: number } = {}): Promise<{ rows: UserListRow[]; total: number; page: number; pages: number }> {
  const client = db();
  const page = Math.max(1, opts.page ?? 1);
  let query = client.from("profiles").select("id, email, full_name, role, created_at", { count: "exact" });
  const q = opts.q?.trim().replace(/[%,()]/g, " ");
  if (q) query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
  if (opts.role && opts.role !== "all") query = query.eq("role", opts.role);
  const res = await query.order("created_at", { ascending: false }).range((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE - 1);
  const profiles = check(res) as any[];
  const ids = profiles.map((p) => p.id);
  const [enrollments, xp] = ids.length
    ? await Promise.all([client.from("enrollments").select("user_id").in("user_id", ids), client.from("xp_events").select("user_id, amount").in("user_id", ids)])
    : [{ data: [] }, { data: [] }];
  const courseCount = new Map<string, number>();
  for (const e of (enrollments.data ?? []) as any[]) courseCount.set(e.user_id, (courseCount.get(e.user_id) ?? 0) + 1);
  const xpSum = new Map<string, number>();
  for (const e of (xp.data ?? []) as any[]) xpSum.set(e.user_id, (xpSum.get(e.user_id) ?? 0) + e.amount);
  const total = res.count ?? profiles.length;
  return {
    rows: profiles.map((p) => ({ id: p.id, email: p.email, fullName: p.full_name, role: p.role, createdAt: p.created_at, courses: courseCount.get(p.id) ?? 0, xp: xpSum.get(p.id) ?? 0 })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / USERS_PER_PAGE)),
  };
}

export type UserDetail = {
  id: string;
  email: string;
  fullName: string | null;
  headline: string | null;
  avatarUrl: string | null;
  role: Role;
  emailOptIn: boolean;
  stripeCustomerId: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmedAt: string | null;
  providers: string[];
  suspendedUntil: string | null;
  xp: number;
  lessonsCompleted: number;
  reflections: number;
  courses: { courseId: string; title: string; slug: string; source: Enrollment["source"]; enrolledAt: string; completedAt: string | null; lessonsDone: number; lessonsTotal: number }[];
  purchases: { id: string; courseTitle: string; amountCents: number; currency: string; status: string; createdAt: string }[];
  subscriptions: Subscription[];
  certificates: { id: string; courseTitle: string; issuedAt: string }[];
};

export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  const client = db();
  const profile = check(await client.from("profiles").select("*").eq("id", userId).maybeSingle()) as any;
  if (!profile) return null;
  const [auth, enrollments, progress, lessons, xp, reflections, purchases, subscriptions, certificates] = await Promise.all([
    client.auth.admin.getUserById(userId),
    client.from("enrollments").select("course_id, source, created_at, completed_at, courses(title, slug)").eq("user_id", userId).order("created_at"),
    client.from("lesson_progress").select("course_id").eq("user_id", userId).not("completed_at", "is", null),
    client.from("lessons").select("course_id"),
    client.from("xp_events").select("amount").eq("user_id", userId),
    client.from("interaction_responses").select("interaction_id", { count: "exact", head: true }).eq("user_id", userId).not("response->>text", "is", null),
    client.from("purchases").select("id, amount_cents, currency, status, created_at, courses(title)").eq("user_id", userId).order("created_at", { ascending: false }),
    client.from("subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    client.from("certificates").select("id, issued_at, courses(title)").eq("user_id", userId).order("issued_at", { ascending: false }),
  ]);
  const user = auth.data.user;
  const done = new Map<string, number>();
  for (const p of (check(progress) as any[]) ?? []) done.set(p.course_id, (done.get(p.course_id) ?? 0) + 1);
  const totals = new Map<string, number>();
  for (const l of (check(lessons) as any[]) ?? []) totals.set(l.course_id, (totals.get(l.course_id) ?? 0) + 1);
  const bannedUntil = (user as any)?.banned_until as string | undefined;
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    headline: profile.headline,
    avatarUrl: profile.avatar_url,
    role: profile.role,
    emailOptIn: profile.email_opt_in,
    stripeCustomerId: profile.stripe_customer_id,
    createdAt: profile.created_at,
    lastSignInAt: user?.last_sign_in_at ?? null,
    emailConfirmedAt: user?.email_confirmed_at ?? null,
    providers: ((user?.app_metadata?.providers as string[] | undefined) ?? [user?.app_metadata?.provider].filter(Boolean)) as string[],
    suspendedUntil: bannedUntil && new Date(bannedUntil) > new Date() ? bannedUntil : null,
    xp: ((check(xp) as any[]) ?? []).reduce((s, e) => s + e.amount, 0),
    lessonsCompleted: [...done.values()].reduce((a, b) => a + b, 0),
    reflections: reflections.count ?? 0,
    courses: ((check(enrollments) as any[]) ?? []).map((e) => ({
      courseId: e.course_id,
      title: e.courses?.title ?? "",
      slug: e.courses?.slug ?? "",
      source: e.source,
      enrolledAt: e.created_at,
      completedAt: e.completed_at,
      lessonsDone: done.get(e.course_id) ?? 0,
      lessonsTotal: totals.get(e.course_id) ?? 0,
    })),
    purchases: ((check(purchases) as any[]) ?? []).map((p) => ({ id: p.id, courseTitle: p.courses?.title ?? "", amountCents: p.amount_cents, currency: p.currency, status: p.status, createdAt: p.created_at })),
    subscriptions: ((check(subscriptions) as any[]) ?? []).map((s) => ({ id: s.id, status: s.status, priceId: s.price_id, interval: s.interval, currentPeriodEnd: s.current_period_end, cancelAtPeriodEnd: s.cancel_at_period_end })),
    certificates: ((check(certificates) as any[]) ?? []).map((c) => ({ id: c.id, courseTitle: c.courses?.title ?? "", issuedAt: c.issued_at })),
  };
}

export async function updateUserProfile(userId: string, patch: { fullName: string | null; headline: string | null; emailOptIn: boolean }) {
  check(await db().from("profiles").update({ full_name: patch.fullName, headline: patch.headline, email_opt_in: patch.emailOptIn }).eq("id", userId));
}

export async function setUserRole(actorId: string, userId: string, role: Role) {
  if (actorId === userId && role !== "admin") throw new AdminError("You can't remove your own admin access");
  check(await db().from("profiles").update({ role }).eq("id", userId));
}

/** Gives a learner a course for free (source "admin"), or takes an admin grant back. */
export async function grantCourse(userId: string, courseId: string) {
  check(await db().from("enrollments").upsert({ user_id: userId, course_id: courseId, source: "admin" }, { onConflict: "user_id,course_id", ignoreDuplicates: true }));
}

export async function revokeCourse(userId: string, courseId: string) {
  const res = check(await db().from("enrollments").delete().eq("user_id", userId).eq("course_id", courseId).eq("source", "admin").select("course_id")) as any[];
  if (!res.length) throw new AdminError("Only access you granted can be revoked here. Purchases are refunded in Stripe.");
}

/** Sends the learner our branded reset email (through the Supabase auth hook). */
export async function sendPasswordReset(email: string) {
  const { error } = await db().auth.resetPasswordForEmail(email, { redirectTo: `${env.siteUrl()}/auth/callback?next=${encodeURIComponent("/reset-password")}` });
  if (error) throw new AdminError(error.message);
}

/** Suspending signs the learner out and blocks sign-in until lifted. */
export async function setSuspended(actorId: string, userId: string, suspended: boolean) {
  if (actorId === userId) throw new AdminError("You can't suspend yourself");
  const { error } = await db().auth.admin.updateUserById(userId, { ban_duration: suspended ? "876000h" : "none" });
  if (error) throw new AdminError(error.message);
}

export async function deleteUser(actorId: string, userId: string) {
  if (actorId === userId) throw new AdminError("Delete your own account from Account settings");
  const { error } = await db().auth.admin.deleteUser(userId);
  if (error) throw new AdminError(error.message);
}

/** Every learner as CSV rows (email, name, role, joined, courses, XP). */
export async function exportUsersCsv(): Promise<string> {
  const client = db();
  const [profiles, enrollments, xp] = await Promise.all([
    client.from("profiles").select("id, email, full_name, role, email_opt_in, created_at").order("created_at"),
    client.from("enrollments").select("user_id"),
    client.from("xp_events").select("user_id, amount"),
  ]);
  const courses = new Map<string, number>();
  for (const e of (check(enrollments) as any[]) ?? []) courses.set(e.user_id, (courses.get(e.user_id) ?? 0) + 1);
  const points = new Map<string, number>();
  for (const e of (check(xp) as any[]) ?? []) points.set(e.user_id, (points.get(e.user_id) ?? 0) + e.amount);
  const cell = (v: unknown) => {
    const s = String(v ?? "");
    // Quote everything and neutralise spreadsheet formulas.
    return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  const rows = [["email", "name", "role", "learning_emails", "joined", "courses", "xp"]];
  for (const p of (check(profiles) as any[]) ?? []) rows.push([p.email, p.full_name ?? "", p.role, p.email_opt_in ? "on" : "off", p.created_at, String(courses.get(p.id) ?? 0), String(points.get(p.id) ?? 0)]);
  return rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
