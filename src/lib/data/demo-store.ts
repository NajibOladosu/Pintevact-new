import { catalog } from "@/content/catalog";
import { flattenLessons } from "@/lib/course";
import { stableUuid } from "@/lib/ids";
import type {
  Certificate,
  Course,
  Enrollment,
  InteractionResponse,
  LessonProgress,
  Note,
  Profile,
  Purchase,
  Subscription,
  XpEvent,
} from "@/lib/types";
import type { AccessInfo, AdminStats, AdminUserRow, CertificateView, CoursePatch, LessonPatch, ProfilePatch, Store, Viewer } from "./store";

type DemoDb = {
  courses: Course[];
  profiles: Map<string, Profile>;
  enrollments: Map<string, Enrollment[]>;
  purchases: Map<string, Purchase[]>;
  subscriptions: Map<string, Subscription>;
  progress: Map<string, Map<string, LessonProgress>>;
  responses: Map<string, Map<string, InteractionResponse>>;
  notes: Map<string, Note[]>;
  xp: Map<string, XpEvent[]>;
  certificates: Certificate[];
  contact: { name: string; email: string; topic: string; message: string; createdAt: string }[];
  newsletter: Set<string>;
};

export type DemoSession = { id: string; email: string; name: string | null };

const g = globalThis as unknown as { __pintevactDemoDb?: DemoDb };

function createDb(): DemoDb {
  return {
    courses: structuredClone(catalog),
    profiles: new Map(),
    enrollments: new Map(),
    purchases: new Map(),
    subscriptions: new Map(),
    progress: new Map(),
    responses: new Map(),
    notes: new Map(),
    xp: new Map(),
    certificates: [],
    contact: [],
    newsletter: new Set(),
  };
}

export function demoDb(): DemoDb {
  if (!g.__pintevactDemoDb) g.__pintevactDemoDb = createDb();
  return g.__pintevactDemoDb;
}

/** Reset the in-memory database (used by tests). */
export function resetDemoDb() {
  g.__pintevactDemoDb = createDb();
}

export function demoUserId(email: string) {
  return stableUuid(`demo-user:${email.trim().toLowerCase()}`);
}

const now = () => new Date().toISOString();

/** Pre-populate a showcase account so the dashboard feels alive on first visit. */
function seedShowcase(db: DemoDb, userId: string) {
  const free = db.courses.find((c) => c.priceCents === 0)!;
  const emo = db.courses.find((c) => c.slug === "emotional-alchemy")!;
  const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
  db.enrollments.set(userId, [
    { courseId: free.id, source: "free", createdAt: day(6), completedAt: null },
    { courseId: emo.id, source: "purchase", createdAt: day(4), completedAt: null },
  ]);
  db.purchases.set(userId, [{ id: stableUuid(`demo-purchase:${userId}`), courseId: emo.id, amountCents: emo.priceCents, currency: "usd", status: "paid", createdAt: day(4) }]);
  const lessons = flattenLessons(free);
  const prog = new Map<string, LessonProgress>();
  lessons.slice(0, 2).forEach((l, i) => {
    prog.set(l.id, { lessonId: l.id, courseId: free.id, lastPosition: l.durationSeconds, watchedSeconds: l.durationSeconds, completedAt: day(5 - i * 2), updatedAt: day(5 - i * 2) });
  });
  prog.set(lessons[2].id, { lessonId: lessons[2].id, courseId: free.id, lastPosition: 140, watchedSeconds: 140, completedAt: null, updatedAt: day(0) });
  db.progress.set(userId, prog);
  const reflection = lessons[0].interactions.find((i) => i.type === "reflection")!;
  db.responses.set(
    userId,
    new Map([
      [
        reflection.id,
        {
          interactionId: reflection.id,
          lessonId: lessons[0].id,
          courseId: free.id,
          response: { text: "I bought concert tickets at midnight because I felt lonely, then told myself it was 'an investment in experiences'." },
          isCorrect: null,
          createdAt: day(5),
        },
      ],
    ]),
  );
  db.xp.set(userId, [
    { amount: 50, reason: "lesson", refId: lessons[0].id, createdAt: day(5) },
    { amount: 15, reason: "interaction", refId: reflection.id, createdAt: day(5) },
    { amount: 20, reason: "interaction", refId: "seed-q1", createdAt: day(4) },
    { amount: 50, reason: "lesson", refId: lessons[1].id, createdAt: day(3) },
    { amount: 30, reason: "interaction", refId: "seed-q2", createdAt: day(2) },
    { amount: 25, reason: "interaction", refId: "seed-q3", createdAt: day(1) },
    { amount: 10, reason: "interaction", refId: "seed-q4", createdAt: day(0) },
  ]);
}

export function ensureDemoProfile(session: DemoSession): Profile {
  const db = demoDb();
  const existing = db.profiles.get(session.id);
  if (existing) return existing;
  const profile: Profile = {
    id: session.id,
    email: session.email,
    fullName: session.name,
    avatarUrl: null,
    headline: null,
    role: session.email.startsWith("admin@") ? "admin" : "student",
    emailOptIn: true,
    stripeCustomerId: null,
    createdAt: now(),
  };
  db.profiles.set(session.id, profile);
  if (session.email === "demo@pintevact.com") seedShowcase(db, session.id);
  return profile;
}

function listOf<T>(map: Map<string, T[]>, key: string): T[] {
  let v = map.get(key);
  if (!v) {
    v = [];
    map.set(key, v);
  }
  return v;
}

function mapOf<T>(map: Map<string, Map<string, T>>, key: string): Map<string, T> {
  let v = map.get(key);
  if (!v) {
    v = new Map();
    map.set(key, v);
  }
  return v;
}

export function createDemoStore(getSession: () => Promise<DemoSession | null>): Store {
  const db = demoDb();

  const findLesson = (lessonId: string) => {
    for (const c of db.courses) for (const m of c.modules) for (const l of m.lessons) if (l.id === lessonId) return l;
    return null;
  };
  const findInteraction = (id: string) => {
    for (const c of db.courses) for (const l of flattenLessons(c)) for (const i of l.interactions) if (i.id === id) return i;
    return null;
  };

  return {
    kind: "demo",

    async listCourses(opts) {
      return db.courses.filter((c) => opts?.includeUnpublished || c.published).sort((a, b) => a.position - b.position);
    },
    async getCourse(slug, opts) {
      return db.courses.find((c) => c.slug === slug && (opts?.includeUnpublished || c.published)) ?? null;
    },

    async getViewer(): Promise<Viewer | null> {
      const session = await getSession();
      if (!session) return null;
      const profile = ensureDemoProfile(session);
      return { id: profile.id, email: profile.email, profile };
    },
    async updateProfile(userId, patch: ProfilePatch) {
      const p = db.profiles.get(userId);
      if (p) db.profiles.set(userId, { ...p, ...patch });
    },

    async getAccess(userId): Promise<AccessInfo> {
      const profile = db.profiles.get(userId);
      const sub = db.subscriptions.get(userId) ?? null;
      return {
        isAdmin: profile?.role === "admin",
        subscription: sub,
        purchasedCourseIds: (db.purchases.get(userId) ?? []).filter((p) => p.status === "paid").map((p) => p.courseId),
        grantedCourseIds: (db.enrollments.get(userId) ?? []).filter((e) => e.source === "admin").map((e) => e.courseId),
      };
    },
    async listEnrollments(userId) {
      return [...(db.enrollments.get(userId) ?? [])];
    },
    async enroll(userId, courseId, source) {
      const list = listOf(db.enrollments, userId);
      if (!list.some((e) => e.courseId === courseId)) list.push({ courseId, source, createdAt: now(), completedAt: null });
    },
    async markEnrollmentComplete(userId, courseId) {
      const e = (db.enrollments.get(userId) ?? []).find((x) => x.courseId === courseId);
      if (e && !e.completedAt) e.completedAt = now();
    },
    async listPurchases(userId) {
      return [...(db.purchases.get(userId) ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async listProgress(userId, courseId) {
      const all = [...(db.progress.get(userId)?.values() ?? [])];
      return courseId ? all.filter((p) => p.courseId === courseId) : all;
    },
    async upsertProgress(userId, p) {
      const m = mapOf(db.progress, userId);
      const prev = m.get(p.lessonId);
      const next: LessonProgress = {
        lessonId: p.lessonId,
        courseId: p.courseId,
        lastPosition: Math.max(0, Math.round(p.lastPosition)),
        watchedSeconds: Math.max(prev?.watchedSeconds ?? 0, Math.round(p.watchedSeconds)),
        completedAt: prev?.completedAt ?? (p.completed ? now() : null),
        updatedAt: now(),
      };
      m.set(p.lessonId, next);
      return next;
    },
    async listResponses(userId, filter) {
      let all = [...(db.responses.get(userId)?.values() ?? [])];
      if (filter?.lessonId) all = all.filter((r) => r.lessonId === filter.lessonId);
      if (filter?.courseId) all = all.filter((r) => r.courseId === filter.courseId);
      if (filter?.type) all = all.filter((r) => findInteraction(r.interactionId)?.type === filter.type);
      return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async saveResponse(userId, r) {
      const m = mapOf(db.responses, userId);
      const existed = m.has(r.interactionId);
      m.set(r.interactionId, { ...r, createdAt: m.get(r.interactionId)?.createdAt ?? now() });
      return { created: !existed };
    },
    async pollResults(interactionId) {
      const counts: Record<string, number> = {};
      for (const m of db.responses.values()) {
        const r = m.get(interactionId);
        if (r?.response.optionId) counts[r.response.optionId] = (counts[r.response.optionId] ?? 0) + 1;
      }
      // Seed plausible community votes so polls feel alive in demo mode.
      const interaction = findInteraction(interactionId);
      interaction?.options?.forEach((o, i) => (counts[o.id] = (counts[o.id] ?? 0) + ((interactionId.charCodeAt(i) + i * 7) % 23) + 4));
      return counts;
    },
    async listNotes(userId, filter) {
      const all = db.notes.get(userId) ?? [];
      return (filter?.lessonId ? all.filter((n) => n.lessonId === filter.lessonId) : [...all]).sort((a, b) => a.atSeconds - b.atSeconds);
    },
    async addNote(userId, n) {
      const note: Note = { ...n, id: crypto.randomUUID(), createdAt: now() };
      listOf(db.notes, userId).push(note);
      return note;
    },
    async deleteNote(userId, noteId) {
      db.notes.set(userId, (db.notes.get(userId) ?? []).filter((n) => n.id !== noteId));
    },

    async awardXp(userId, amount, reason, refId) {
      const list = listOf(db.xp, userId);
      if (list.some((e) => e.reason === reason && e.refId === refId)) return false;
      list.push({ amount, reason, refId, createdAt: now() });
      return true;
    },
    async listXpEvents(userId) {
      return [...(db.xp.get(userId) ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async issueCertificate(userId, courseId) {
      const existing = db.certificates.find((c) => c.userId === userId && c.courseId === courseId);
      if (existing) return { certificate: existing, created: false };
      const certificate: Certificate = { id: stableUuid(`cert:${userId}:${courseId}`), userId, courseId, issuedAt: now() };
      db.certificates.push(certificate);
      return { certificate, created: true };
    },
    async listCertificates(userId) {
      return db.certificates.filter((c) => c.userId === userId);
    },
    async getCertificate(id): Promise<CertificateView | null> {
      const certificate = db.certificates.find((c) => c.id === id);
      if (!certificate) return null;
      const course = db.courses.find((c) => c.id === certificate.courseId);
      const profile = db.profiles.get(certificate.userId);
      if (!course || !profile) return null;
      return { certificate, courseTitle: course.title, courseSlug: course.slug, learnerName: profile.fullName ?? profile.email.split("@")[0] };
    },

    async recordPurchase(userId, courseId, amountCents, currency, ref) {
      const list = listOf(db.purchases, userId);
      if (!list.some((p) => p.id === ref)) list.push({ id: ref, courseId, amountCents, currency, status: "paid", createdAt: now() });
    },
    async upsertSubscription(userId, sub) {
      db.subscriptions.set(userId, sub);
    },

    async saveContactMessage(m) {
      db.contact.push({ ...m, createdAt: now() });
    },
    async subscribeNewsletter(email) {
      db.newsletter.add(email.toLowerCase());
    },

    async adminStats(): Promise<AdminStats> {
      let revenue = 0;
      for (const list of db.purchases.values()) revenue += list.reduce((s, p) => s + p.amountCents, 0);
      let lessonsCompleted = 0;
      for (const m of db.progress.values()) lessonsCompleted += [...m.values()].filter((p) => p.completedAt).length;
      let reflections = 0;
      for (const m of db.responses.values()) reflections += [...m.values()].filter((r) => r.response.text).length;
      return {
        users: db.profiles.size,
        activeSubscriptions: [...db.subscriptions.values()].filter((s) => s.status === "active" || s.status === "trialing").length,
        revenueCents: revenue,
        enrollments: [...db.enrollments.values()].reduce((s, l) => s + l.length, 0),
        lessonsCompleted,
        reflections,
      };
    },
    async adminListUsers(): Promise<AdminUserRow[]> {
      return [...db.profiles.values()]
        .map((p) => ({
          id: p.id,
          email: p.email,
          fullName: p.fullName,
          role: p.role,
          createdAt: p.createdAt,
          enrollments: db.enrollments.get(p.id)?.length ?? 0,
          xp: (db.xp.get(p.id) ?? []).reduce((s, e) => s + e.amount, 0),
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async adminUpdateCourse(courseId, patch: CoursePatch) {
      const c = db.courses.find((x) => x.id === courseId);
      if (c) Object.assign(c, patch);
    },
    async adminUpdateLesson(lessonId, patch: LessonPatch) {
      const l = findLesson(lessonId);
      if (l) Object.assign(l, patch);
    },
    async adminSetRole(userId, role) {
      const p = db.profiles.get(userId);
      if (p) p.role = role;
    },
  };
}
