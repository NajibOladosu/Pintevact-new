import { describe, expect, it } from "vitest";
import { createSupabaseStore } from "@/lib/data/supabase-store";
import { canAccessCourse, hasActiveSubscription } from "@/lib/access";
import { catalog } from "@/content/catalog";
import { flattenLessons } from "@/lib/course";
import { admin, createUser, signedInClient, uniqueEmail } from "../support/supabase";

const paid = catalog.find((c) => c.priceCents > 0)!;

async function storeFor(opts: Parameters<typeof createUser>[0] = {}) {
  const user = await createUser(opts);
  const client = await signedInClient(user.email);
  return { user, client, store: createSupabaseStore({ user: client, admin: admin() }) };
}

describe("Supabase store", () => {
  it("creates a profile for every new account and lets the learner edit it", async () => {
    const { user, store } = await storeFor({ name: "Maya" });
    const viewer = await store.getViewer();
    expect(viewer).toMatchObject({ id: user.id, email: user.email, profile: { fullName: "Maya", role: "student", emailOptIn: true } });

    await store.updateProfile(user.id, { fullName: "Maya A.", headline: "Recovering overthinker", emailOptIn: false });
    expect((await store.getViewer())!.profile).toMatchObject({ fullName: "Maya A.", headline: "Recovering overthinker", emailOptIn: false });
  });

  it("stops learners from promoting themselves to admin", async () => {
    const { user, client } = await storeFor();
    await client.from("profiles").update({ role: "admin" }).eq("id", user.id);
    const { data } = await admin().from("profiles").select("role").eq("id", user.id).single();
    expect(data!.role).toBe("student");
  });

  it("serves the published catalog with lessons and checkpoints", async () => {
    const { store } = await storeFor();
    const courses = await store.listCourses();
    expect(courses.map((c) => c.slug)).toEqual(catalog.filter((c) => c.published).map((c) => c.slug));
    const course = await store.getCourse(paid.slug);
    expect(flattenLessons(course!).length).toBe(flattenLessons(paid).length);
    expect(flattenLessons(course!)[0].interactions.length).toBeGreaterThan(0);
  });

  it("keeps notes private to their author", async () => {
    const { user, store } = await storeFor();
    const lesson = flattenLessons(catalog[0])[0];
    const note = await store.addNote(user.id, { lessonId: lesson.id, courseId: catalog[0].id, atSeconds: 42, body: "Noticed my jaw clench here." });
    expect((await store.listNotes(user.id)).map((n) => n.id)).toEqual([note.id]);

    const intruder = await signedInClient((await createUser()).email);
    const { data } = await intruder.from("notes").select("*").eq("id", note.id);
    expect(data).toEqual([]);

    await store.deleteNote(user.id, note.id);
    expect(await store.listNotes(user.id)).toEqual([]);
  });

  it("refuses paid enrolments from the client and grants access through purchases and memberships", async () => {
    const { user, client, store } = await storeFor();
    const { error } = await client.from("enrollments").insert({ user_id: user.id, course_id: paid.id, source: "purchase" });
    expect(error).not.toBeNull();
    expect(canAccessCourse(paid, await store.getAccess(user.id))).toBe(false);

    await admin().from("subscriptions").insert({ id: `sub_${user.id.slice(0, 8)}`, user_id: user.id, status: "active", interval: "month", current_period_end: new Date(Date.now() + 30 * 86_400_000).toISOString(), cancel_at_period_end: false });
    const access = await store.getAccess(user.id);
    expect(hasActiveSubscription(access)).toBe(true);
    expect(canAccessCourse(paid, access)).toBe(true);
  });

  it("never lets learners award themselves XP", async () => {
    const { user, client, store } = await storeFor();
    const { error } = await client.from("xp_events").insert({ user_id: user.id, amount: 1000, reason: "cheat", ref_id: "x" });
    expect(error).not.toBeNull();
    expect(await store.listXpEvents(user.id)).toEqual([]);
  });

  it("stores contact messages and newsletter sign-ups", async () => {
    const { store } = await storeFor();
    const email = uniqueEmail("reader");
    await store.subscribeNewsletter(email.toUpperCase());
    await store.subscribeNewsletter(email);
    const { data: subs } = await admin().from("newsletter_subscribers").select("email").eq("email", email);
    expect(subs).toHaveLength(1);

    await store.saveContactMessage({ name: "Ada", email, topic: "teams", message: "Seats for twelve, please." });
    const { data: msgs } = await admin().from("contact_messages").select("topic, message").eq("email", email);
    expect(msgs).toEqual([{ topic: "teams", message: "Seats for twelve, please." }]);
  });

  it("gives admins stats, the learner list, course edits and role changes", async () => {
    const { store } = await storeFor({ role: "admin" });
    const learner = await createUser({ name: "Promoted" });
    expect((await store.adminStats()).users).toBeGreaterThan(0);
    expect((await store.adminListUsers()).some((u) => u.id === learner.id)).toBe(true);

    await store.adminSetRole(learner.id, "admin");
    const { data } = await admin().from("profiles").select("role").eq("id", learner.id).single();
    expect(data!.role).toBe("admin");

    const course = (await store.listCourses({ includeUnpublished: true }))[1];
    await store.adminUpdateCourse(course.id, { subtitle: `${course.subtitle} (edited)` });
    expect((await store.getCourse(course.slug))!.subtitle).toBe(`${course.subtitle} (edited)`);
    await store.adminUpdateCourse(course.id, { subtitle: course.subtitle });
  });
});
