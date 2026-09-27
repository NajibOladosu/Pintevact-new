import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Certificate,
  Chapter,
  Course,
  Enrollment,
  Interaction,
  InteractionResponse,
  Lesson,
  LessonProgress,
  Module,
  Note,
  Profile,
  Purchase,
  Subscription,
  XpEvent,
} from "@/lib/types";
import type { AdminStats, AdminUserRow, CertificateView, Store, Viewer } from "./store";

/* eslint-disable @typescript-eslint/no-explicit-any -- row shapes come from PostgREST */

const COURSE_SELECT =
  "*, modules(id, course_id, title, position, lessons(*, lesson_interactions(*)))";

export function mapInteraction(row: any): Interaction {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    atSeconds: row.at_seconds,
    type: row.type,
    prompt: row.prompt,
    options: row.options ?? undefined,
    explanation: row.explanation ?? undefined,
    body: row.body ?? undefined,
    scale: row.scale ?? undefined,
    xp: row.xp,
    required: row.required,
  };
}

export function mapLesson(row: any): Lesson {
  return {
    id: row.id,
    courseId: row.course_id,
    moduleId: row.module_id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    durationSeconds: row.duration_seconds,
    bunnyVideoId: row.bunny_video_id,
    isPreview: row.is_preview,
    position: row.position,
    chapters: (row.chapters ?? []) as Chapter[],
    takeaways: row.takeaways ?? [],
    exercise: row.exercise,
    interactions: ((row.lesson_interactions ?? []) as any[]).map(mapInteraction).sort((a, b) => a.atSeconds - b.atSeconds),
  };
}

export function mapCourse(row: any): Course {
  const modules: Module[] = ((row.modules ?? []) as any[])
    .map((m) => ({
      id: m.id,
      courseId: m.course_id,
      title: m.title,
      position: m.position,
      lessons: ((m.lessons ?? []) as any[]).map(mapLesson).sort((a, b) => a.position - b.position),
    }))
    .sort((a, b) => a.position - b.position);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    category: row.category,
    level: row.level,
    priceCents: row.price_cents,
    currency: row.currency,
    stripePriceId: row.stripe_price_id,
    theme: row.theme,
    glyph: row.glyph,
    instructor: row.instructor,
    outcomes: row.outcomes ?? [],
    published: row.published,
    featured: row.featured,
    position: row.position,
    modules,
  };
}

export function mapProfile(row: any): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    headline: row.headline,
    role: row.role,
    emailOptIn: row.email_opt_in,
    stripeCustomerId: row.stripe_customer_id,
    createdAt: row.created_at,
  };
}

export function mapSubscription(row: any): Subscription {
  return {
    id: row.id,
    status: row.status,
    priceId: row.price_id,
    interval: row.interval,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
  };
}

const mapProgress = (r: any): LessonProgress => ({
  lessonId: r.lesson_id,
  courseId: r.course_id,
  lastPosition: r.last_position,
  watchedSeconds: r.watched_seconds,
  completedAt: r.completed_at,
  updatedAt: r.updated_at,
});

const mapResponse = (r: any): InteractionResponse => ({
  interactionId: r.interaction_id,
  lessonId: r.lesson_id,
  courseId: r.course_id,
  response: r.response,
  isCorrect: r.is_correct,
  createdAt: r.created_at,
});

const mapNote = (r: any): Note => ({ id: r.id, lessonId: r.lesson_id, courseId: r.course_id, atSeconds: r.at_seconds, body: r.body, createdAt: r.created_at });
const mapCert = (r: any): Certificate => ({ id: r.id, userId: r.user_id, courseId: r.course_id, issuedAt: r.issued_at });

function check<T>(res: { data: T; error: any }): T {
  if (res.error) throw new Error(res.error.message ?? String(res.error));
  return res.data;
}

export type SupabaseStoreClients = {
  /** Client carrying the learner's session (RLS applies). Defaults to the request's auth cookies. */
  user?: SupabaseClient;
  /** Service-role client for trusted writes. Defaults to SUPABASE_SERVICE_ROLE_KEY. */
  admin?: SupabaseClient;
};

export function createSupabaseStore(clients: SupabaseStoreClients = {}): Store {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  let userClient: Promise<SupabaseClient> | null = clients.user ? Promise.resolve(clients.user) : null;
  const db = () => (userClient ??= createClient());
  const admin = () => clients.admin ?? createAdminClient();

  return {
    async listCourses(opts) {
      const client = opts?.includeUnpublished ? admin() : await db();
      let q = client.from("courses").select(COURSE_SELECT).order("position");
      if (!opts?.includeUnpublished) q = q.eq("published", true);
      return (check(await q) as any[]).map(mapCourse);
    },
    async getCourse(slug, opts) {
      const client = opts?.includeUnpublished ? admin() : await db();
      let q = client.from("courses").select(COURSE_SELECT).eq("slug", slug);
      if (!opts?.includeUnpublished) q = q.eq("published", true);
      const row = check(await q.maybeSingle());
      return row ? mapCourse(row) : null;
    },

    async getViewer(): Promise<Viewer | null> {
      const client = await db();
      const { data } = await client.auth.getUser();
      if (!data.user) return null;
      let row = check(await client.from("profiles").select("*").eq("id", data.user.id).maybeSingle());
      if (!row) {
        // Trigger may not have run (e.g. user created before migration), create lazily.
        row = check(
          await admin()
            .from("profiles")
            .upsert({ id: data.user.id, email: data.user.email, full_name: data.user.user_metadata?.full_name ?? null })
            .select("*")
            .single(),
        );
      }
      return { id: data.user.id, email: data.user.email ?? row.email, profile: mapProfile(row) };
    },
    async updateProfile(userId, patch) {
      const update: Record<string, unknown> = {};
      if (patch.fullName !== undefined) update.full_name = patch.fullName;
      if (patch.headline !== undefined) update.headline = patch.headline;
      if (patch.emailOptIn !== undefined) update.email_opt_in = patch.emailOptIn;
      if (patch.avatarUrl !== undefined) update.avatar_url = patch.avatarUrl;
      check(await (await db()).from("profiles").update(update).eq("id", userId));
    },

    async getAccess(userId) {
      const client = await db();
      const [profile, subs, purchases, grants] = await Promise.all([
        client.from("profiles").select("role").eq("id", userId).maybeSingle(),
        client.from("subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        client.from("purchases").select("course_id").eq("user_id", userId).eq("status", "paid"),
        client.from("enrollments").select("course_id").eq("user_id", userId).eq("source", "admin"),
      ]);
      const subRows = (check(subs) as any[]).map(mapSubscription);
      const live = subRows.find((s) => s.status === "active" || s.status === "trialing") ?? subRows[0] ?? null;
      return {
        isAdmin: (check(profile) as any)?.role === "admin",
        subscription: live,
        purchasedCourseIds: (check(purchases) as any[]).map((p) => p.course_id),
        grantedCourseIds: (check(grants) as any[]).map((p) => p.course_id),
      };
    },
    async listEnrollments(userId) {
      const rows = check(await (await db()).from("enrollments").select("*").eq("user_id", userId).order("created_at")) as any[];
      return rows.map((r): Enrollment => ({ courseId: r.course_id, source: r.source, createdAt: r.created_at, completedAt: r.completed_at }));
    },
    async enroll(userId, courseId, source) {
      // Service role: access has already been verified by the caller (see lib/access.ts).
      check(await admin().from("enrollments").upsert({ user_id: userId, course_id: courseId, source }, { onConflict: "user_id,course_id", ignoreDuplicates: true }));
    },
    async markEnrollmentComplete(userId, courseId) {
      check(await admin().from("enrollments").update({ completed_at: new Date().toISOString() }).eq("user_id", userId).eq("course_id", courseId).is("completed_at", null));
    },
    async listPurchases(userId) {
      const rows = check(await (await db()).from("purchases").select("*").eq("user_id", userId).order("created_at", { ascending: false })) as any[];
      return rows.map((r): Purchase => ({ id: r.id, courseId: r.course_id, amountCents: r.amount_cents, currency: r.currency, status: r.status, createdAt: r.created_at }));
    },

    async listProgress(userId, courseId) {
      let q = (await db()).from("lesson_progress").select("*").eq("user_id", userId);
      if (courseId) q = q.eq("course_id", courseId);
      return (check(await q) as any[]).map(mapProgress);
    },
    async upsertProgress(userId, p) {
      const client = await db();
      const prev = check(await client.from("lesson_progress").select("*").eq("user_id", userId).eq("lesson_id", p.lessonId).maybeSingle()) as any;
      const row = {
        user_id: userId,
        lesson_id: p.lessonId,
        course_id: p.courseId,
        last_position: Math.max(0, Math.round(p.lastPosition)),
        watched_seconds: Math.max(prev?.watched_seconds ?? 0, Math.round(p.watchedSeconds)),
        completed_at: prev?.completed_at ?? (p.completed ? new Date().toISOString() : null),
      };
      return mapProgress(check(await client.from("lesson_progress").upsert(row).select("*").single()));
    },
    async listResponses(userId, filter) {
      let q = (await db())
        .from("interaction_responses")
        .select(filter?.type ? "*, lesson_interactions!inner(type)" : "*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (filter?.lessonId) q = q.eq("lesson_id", filter.lessonId);
      if (filter?.courseId) q = q.eq("course_id", filter.courseId);
      if (filter?.type) q = q.eq("lesson_interactions.type", filter.type);
      return (check(await q) as any[]).map(mapResponse);
    },
    async saveResponse(userId, r) {
      const client = await db();
      const existing = check(await client.from("interaction_responses").select("interaction_id").eq("user_id", userId).eq("interaction_id", r.interactionId).maybeSingle());
      check(
        await client.from("interaction_responses").upsert({
          user_id: userId,
          interaction_id: r.interactionId,
          lesson_id: r.lessonId,
          course_id: r.courseId,
          response: r.response,
          is_correct: r.isCorrect,
        }),
      );
      return { created: !existing };
    },
    async pollResults(interactionId) {
      const rows = check(await (await db()).rpc("poll_results", { p_interaction: interactionId })) as { option_id: string; votes: number }[];
      return Object.fromEntries((rows ?? []).map((r) => [r.option_id, Number(r.votes)]));
    },
    async listNotes(userId, filter) {
      let q = (await db()).from("notes").select("*").eq("user_id", userId).order("at_seconds");
      if (filter?.lessonId) q = q.eq("lesson_id", filter.lessonId);
      return (check(await q) as any[]).map(mapNote);
    },
    async addNote(userId, n) {
      const row = check(
        await (await db())
          .from("notes")
          .insert({ user_id: userId, lesson_id: n.lessonId, course_id: n.courseId, at_seconds: Math.round(n.atSeconds), body: n.body })
          .select("*")
          .single(),
      );
      return mapNote(row);
    },
    async deleteNote(userId, noteId) {
      check(await (await db()).from("notes").delete().eq("id", noteId).eq("user_id", userId));
    },

    async awardXp(userId, amount, reason, refId) {
      const res = await admin().from("xp_events").insert({ user_id: userId, amount, reason, ref_id: refId });
      if (res.error) {
        if (res.error.code === "23505") return false; // already awarded
        throw new Error(res.error.message);
      }
      return true;
    },
    async listXpEvents(userId) {
      const rows = check(await (await db()).from("xp_events").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(2000)) as any[];
      return rows.map((r): XpEvent => ({ amount: r.amount, reason: r.reason, refId: r.ref_id, createdAt: r.created_at }));
    },
    async issueCertificate(userId, courseId) {
      const client = admin();
      const existing = check(await client.from("certificates").select("*").eq("user_id", userId).eq("course_id", courseId).maybeSingle());
      if (existing) return { certificate: mapCert(existing), created: false };
      const row = check(await client.from("certificates").insert({ user_id: userId, course_id: courseId }).select("*").single());
      return { certificate: mapCert(row), created: true };
    },
    async listCertificates(userId) {
      return (check(await (await db()).from("certificates").select("*").eq("user_id", userId)) as any[]).map(mapCert);
    },
    async getCertificate(id): Promise<CertificateView | null> {
      const rows = check(await (await db()).rpc("certificate_lookup", { p_id: id })) as any[];
      const r = rows?.[0];
      if (!r) return null;
      return {
        certificate: { id: r.id, userId: "", courseId: "", issuedAt: r.issued_at },
        courseTitle: r.course_title,
        courseSlug: r.course_slug,
        learnerName: r.learner_name,
      };
    },

    async saveContactMessage(m) {
      check(await admin().from("contact_messages").insert(m));
    },
    async subscribeNewsletter(email) {
      check(await admin().from("newsletter_subscribers").upsert({ email: email.toLowerCase() }, { ignoreDuplicates: true }));
    },

    async adminStats(): Promise<AdminStats> {
      const client = admin();
      const count = async (table: string, filter?: (q: any) => any) => {
        let q: any = client.from(table).select("*", { count: "exact", head: true });
        if (filter) q = filter(q);
        const res = await q;
        return res.count ?? 0;
      };
      const [users, activeSubscriptions, enrollments, lessonsCompleted, reflections, purchases] = await Promise.all([
        count("profiles"),
        count("subscriptions", (q) => q.in("status", ["active", "trialing"])),
        count("enrollments"),
        count("lesson_progress", (q) => q.not("completed_at", "is", null)),
        count("interaction_responses", (q) => q.not("response->>text", "is", null)),
        client.from("purchases").select("amount_cents").eq("status", "paid"),
      ]);
      const revenueCents = ((purchases.data ?? []) as any[]).reduce((s, p) => s + p.amount_cents, 0);
      return { users, activeSubscriptions, revenueCents, enrollments, lessonsCompleted, reflections };
    },
    async adminListUsers(): Promise<AdminUserRow[]> {
      const client = admin();
      const [profiles, enrollments, xp] = await Promise.all([
        client.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
        client.from("enrollments").select("user_id"),
        client.from("xp_events").select("user_id, amount"),
      ]);
      const enrolCount = new Map<string, number>();
      for (const e of (enrollments.data ?? []) as any[]) enrolCount.set(e.user_id, (enrolCount.get(e.user_id) ?? 0) + 1);
      const xpSum = new Map<string, number>();
      for (const e of (xp.data ?? []) as any[]) xpSum.set(e.user_id, (xpSum.get(e.user_id) ?? 0) + e.amount);
      return ((check(profiles) as any[]) ?? []).map((p) => ({
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        role: p.role,
        createdAt: p.created_at,
        enrollments: enrolCount.get(p.id) ?? 0,
        xp: xpSum.get(p.id) ?? 0,
      }));
    },
    async adminUpdateCourse(courseId, patch) {
      const map: Record<string, string> = {
        title: "title",
        subtitle: "subtitle",
        description: "description",
        category: "category",
        level: "level",
        priceCents: "price_cents",
        stripePriceId: "stripe_price_id",
        published: "published",
        featured: "featured",
        theme: "theme",
      };
      const update = Object.fromEntries(Object.entries(patch).map(([k, v]) => [map[k], v]).filter(([k]) => k));
      check(await admin().from("courses").update(update).eq("id", courseId));
    },
    async adminUpdateLesson(lessonId, patch) {
      const map: Record<string, string> = {
        title: "title",
        summary: "summary",
        durationSeconds: "duration_seconds",
        bunnyVideoId: "bunny_video_id",
        isPreview: "is_preview",
      };
      const update = Object.fromEntries(Object.entries(patch).map(([k, v]) => [map[k], v]).filter(([k]) => k));
      check(await admin().from("lessons").update(update).eq("id", lessonId));
    },
    async adminSetRole(userId, role) {
      check(await admin().from("profiles").update({ role }).eq("id", userId));
    },
  };
}
