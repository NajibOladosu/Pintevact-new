import { beforeEach, describe, expect, it } from "vitest";
import { createDemoStore, demoUserId, resetDemoDb, type DemoSession } from "@/lib/data/demo-store";
import { flattenLessons } from "@/lib/course";

let session: DemoSession | null;
const store = () => createDemoStore(async () => session);

beforeEach(() => {
  resetDemoDb();
  session = { id: demoUserId("ada@example.com"), email: "ada@example.com", name: "Ada" };
});

describe("demo store", () => {
  it("returns null viewer when signed out", async () => {
    session = null;
    expect(await store().getViewer()).toBeNull();
  });

  it("creates a student profile on first sight and admins by email prefix", async () => {
    const v = await store().getViewer();
    expect(v?.profile).toMatchObject({ email: "ada@example.com", role: "student", fullName: "Ada" });
    session = { id: demoUserId("admin@x.com"), email: "admin@x.com", name: null };
    expect((await store().getViewer())?.profile.role).toBe("admin");
  });

  it("seeds the showcase account", async () => {
    session = { id: demoUserId("demo@pintevact.com"), email: "demo@pintevact.com", name: "Demo" };
    const s = store();
    const v = (await s.getViewer())!;
    expect(await s.listEnrollments(v.id)).toHaveLength(2);
    expect((await s.listXpEvents(v.id)).length).toBeGreaterThan(3);
  });

  it("awards XP only once per reason/ref", async () => {
    const s = store();
    const id = session!.id;
    expect(await s.awardXp(id, 50, "lesson", "l1")).toBe(true);
    expect(await s.awardXp(id, 50, "lesson", "l1")).toBe(false);
    expect(await s.listXpEvents(id)).toHaveLength(1);
  });

  it("tracks progress monotonically and keeps completion", async () => {
    const s = store();
    const [course] = await s.listCourses();
    const lesson = flattenLessons(course)[0];
    const id = session!.id;
    await s.upsertProgress(id, { lessonId: lesson.id, courseId: course.id, lastPosition: 100, watchedSeconds: 100, completed: true });
    const p = await s.upsertProgress(id, { lessonId: lesson.id, courseId: course.id, lastPosition: 10, watchedSeconds: 10 });
    expect(p.watchedSeconds).toBe(100);
    expect(p.lastPosition).toBe(10);
    expect(p.completedAt).not.toBeNull();
  });

  it("saves responses, reports creation and filters reflections", async () => {
    const s = store();
    const [course] = await s.listCourses();
    const lesson = flattenLessons(course)[0];
    const refl = lesson.interactions.find((i) => i.type === "reflection")!;
    const poll = lesson.interactions.find((i) => i.type === "poll")!;
    const id = session!.id;
    const base = { lessonId: lesson.id, courseId: course.id, isCorrect: null };
    expect((await s.saveResponse(id, { ...base, interactionId: refl.id, response: { text: "hello" } })).created).toBe(true);
    expect((await s.saveResponse(id, { ...base, interactionId: refl.id, response: { text: "edit" } })).created).toBe(false);
    await s.saveResponse(id, { ...base, interactionId: poll.id, response: { optionId: "o1" } });
    const reflections = await s.listResponses(id, { type: "reflection" });
    expect(reflections).toHaveLength(1);
    expect(reflections[0].response.text).toBe("edit");
    const results = await s.pollResults(poll.id);
    expect(Object.keys(results)).toEqual(expect.arrayContaining(["o1", "o2"]));
  });

  it("manages notes per user", async () => {
    const s = store();
    const id = session!.id;
    const n = await s.addNote(id, { lessonId: "l", courseId: "c", atSeconds: 30, body: "insight" });
    await s.addNote(id, { lessonId: "l", courseId: "c", atSeconds: 5, body: "first" });
    expect((await s.listNotes(id, { lessonId: "l" })).map((x) => x.body)).toEqual(["first", "insight"]);
    await s.deleteNote(id, n.id);
    expect(await s.listNotes(id)).toHaveLength(1);
  });

  it("issues certificates idempotently and exposes a public view", async () => {
    const s = store();
    const v = (await s.getViewer())!;
    const [course] = await s.listCourses();
    const a = await s.issueCertificate(v.id, course.id);
    const b = await s.issueCertificate(v.id, course.id);
    expect(a.created).toBe(true);
    expect(b.created).toBe(false);
    expect((await s.getCertificate(a.certificate.id))?.learnerName).toBe("Ada");
  });

  it("grants access through purchases and subscriptions", async () => {
    const s = store();
    const v = (await s.getViewer())!;
    await s.recordPurchase(v.id, "course-x", 7900, "usd", "cs_1");
    await s.upsertSubscription(v.id, { id: "sub", status: "active", priceId: "p", interval: "month", currentPeriodEnd: null, cancelAtPeriodEnd: false });
    const access = await s.getAccess(v.id);
    expect(access.purchasedCourseIds).toContain("course-x");
    expect(access.subscription?.status).toBe("active");
    expect((await s.adminStats()).revenueCents).toBe(7900);
  });
});
