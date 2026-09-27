import { beforeEach, describe, expect, it } from "vitest";
import { createSupabaseStore } from "@/lib/data/supabase-store";
import { recordProgress, recordResponse } from "@/lib/lesson-service";
import { catalog } from "@/content/catalog";
import { flattenLessons } from "@/lib/course";
import type { Store, Viewer } from "@/lib/data/store";
import { admin, createUser, signedInClient } from "../support/supabase";
import { waitForEmail } from "../support/mailpit";

const free = catalog.find((c) => c.priceCents === 0)!;
const paid = catalog.find((c) => c.priceCents > 0)!;

let store: Store;
let viewer: Viewer;

beforeEach(async () => {
  const user = await createUser({ name: "Service Tester" });
  store = createSupabaseStore({ user: await signedInClient(user.email), admin: admin() });
  viewer = (await store.getViewer())!;
});

describe("recordResponse", () => {
  it("scores quizzes and awards XP only once", async () => {
    const quiz = flattenLessons(free).flatMap((l) => l.interactions).find((i) => i.type === "quiz")!;
    const right = quiz.options!.find((o) => o.correct)!;
    const first = await recordResponse(viewer, { interactionId: quiz.id, optionId: right.id }, store);
    expect(first).toMatchObject({ ok: true, isCorrect: true, xpAwarded: quiz.xp });
    const again = await recordResponse(viewer, { interactionId: quiz.id, optionId: right.id }, store);
    expect(again.xpAwarded).toBe(0);
    const xp = await store.listXpEvents(viewer.id);
    expect(xp.filter((e) => e.refId === quiz.id)).toHaveLength(1);
  });

  it("returns live poll results that include this answer", async () => {
    const poll = flattenLessons(free).flatMap((l) => l.interactions).find((i) => i.type === "poll")!;
    const res = await recordResponse(viewer, { interactionId: poll.id, optionId: poll.options![0].id }, store);
    expect(res.pollResults?.[poll.options![0].id]).toBeGreaterThan(0);
  });

  it("stores reflections privately and rejects empty ones", async () => {
    const refl = flattenLessons(free).flatMap((l) => l.interactions).find((i) => i.type === "reflection")!;
    expect((await recordResponse(viewer, { interactionId: refl.id, text: " " }, store)).ok).toBe(false);
    expect((await recordResponse(viewer, { interactionId: refl.id, text: "I rush decisions when I'm tired." }, store)).ok).toBe(true);
    const saved = await store.listResponses(viewer.id, { type: "reflection" });
    expect(saved[0].response.text).toBe("I rush decisions when I'm tired.");

    // Another learner cannot read it through row-level security.
    const other = await createUser();
    const otherClient = await signedInClient(other.email);
    const { data } = await otherClient.from("interaction_responses").select("*").eq("user_id", viewer.id);
    expect(data).toEqual([]);
  });

  it("rejects unknown interactions and locked lessons of paid courses", async () => {
    expect((await recordResponse(viewer, { interactionId: "00000000-0000-4000-8000-000000000000", optionId: "o1" }, store)).ok).toBe(false);
    const locked = flattenLessons(paid).find((l) => !l.isPreview)!;
    await expect(recordResponse(viewer, { interactionId: locked.interactions[0].id, optionId: "o1", acknowledged: true, text: "x", value: 3 }, store)).rejects.toThrow(/access/);
  });
});

describe("recordProgress", () => {
  it("needs enough watching and every required checkpoint before completing", async () => {
    const lesson = flattenLessons(free)[0];
    const early = await recordProgress(viewer, { lessonId: lesson.id, position: 30, watched: 30 }, store);
    expect(early.completed).toBe(false);

    const watchedAll = await recordProgress(viewer, { lessonId: lesson.id, position: lesson.durationSeconds, watched: lesson.durationSeconds }, store);
    const required = lesson.interactions.filter((i) => i.required);
    expect(watchedAll.completed).toBe(required.length === 0);

    for (const i of lesson.interactions) {
      await recordResponse(viewer, { interactionId: i.id, optionId: i.options?.find((o) => o.correct)?.id ?? i.options?.[0]?.id, text: "A thoughtful answer", value: 3, acknowledged: true }, store);
    }
    const done = await recordProgress(viewer, { lessonId: lesson.id, position: lesson.durationSeconds, watched: lesson.durationSeconds }, store);
    expect(done.completed).toBe(true);
  });

  it("completes the course, issues one certificate and emails it", async () => {
    let last = null as Awaited<ReturnType<typeof recordProgress>> | null;
    for (const lesson of flattenLessons(free)) {
      for (const i of lesson.interactions) {
        await recordResponse(viewer, { interactionId: i.id, optionId: i.options?.find((o) => o.correct)?.id ?? i.options?.[0]?.id, text: "A thoughtful answer", value: 3, acknowledged: true }, store);
      }
      last = await recordProgress(viewer, { lessonId: lesson.id, position: lesson.durationSeconds, watched: lesson.durationSeconds }, store);
    }
    expect(last).toMatchObject({ courseCompleted: true });
    expect(last!.certificateId).toBeTruthy();
    expect(await store.listCertificates(viewer.id)).toHaveLength(1);

    const view = await store.getCertificate(last!.certificateId!);
    expect(view).toMatchObject({ courseTitle: free.title, learnerName: "Service Tester" });

    const mail = await waitForEmail(viewer.email, /You completed/);
    expect(mail.HTML).toContain(`/certificates/${last!.certificateId}`);
  });
});
