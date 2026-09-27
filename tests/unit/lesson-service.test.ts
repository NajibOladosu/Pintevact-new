import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { state } = vi.hoisted(() => ({ state: { session: null as null | { id: string; email: string; name: string | null } } }));
const { notifyMock } = vi.hoisted(() => ({ notifyMock: { courseCompleted: vi.fn(async () => ({ ok: true, id: null })) } }));
vi.mock("@/lib/notifications", () => ({ notify: notifyMock }));
vi.mock("@/lib/data", async () => {
  const demo = await import("@/lib/data/demo-store");
  const store = () => demo.createDemoStore(async () => state.session);
  return { getStore: store, getCourses: () => store().listCourses(), getViewer: () => store().getViewer() };
});

import { createDemoStore, demoUserId, resetDemoDb } from "@/lib/data/demo-store";
import { recordProgress, recordResponse } from "@/lib/lesson-service";
import { catalog } from "@/content/catalog";
import { flattenLessons } from "@/lib/course";

const free = catalog.find((c) => c.priceCents === 0)!;
const paid = catalog.find((c) => c.priceCents > 0)!;

async function viewer() {
  return (await createDemoStore(async () => state.session).getViewer())!;
}

beforeEach(() => {
  resetDemoDb();
  notifyMock.courseCompleted.mockClear();
  state.session = { id: demoUserId("svc@test.com"), email: "svc@test.com", name: "Svc" };
});

describe("recordResponse", () => {
  it("scores quizzes and awards XP once", async () => {
    const v = await viewer();
    const quiz = flattenLessons(free).flatMap((l) => l.interactions).find((i) => i.type === "quiz")!;
    const right = quiz.options!.find((o) => o.correct)!;
    const first = await recordResponse(v, { interactionId: quiz.id, optionId: right.id });
    expect(first).toMatchObject({ ok: true, isCorrect: true, xpAwarded: quiz.xp });
    const again = await recordResponse(v, { interactionId: quiz.id, optionId: right.id });
    expect(again.xpAwarded).toBe(0);
  });

  it("returns poll results", async () => {
    const v = await viewer();
    const poll = flattenLessons(free).flatMap((l) => l.interactions).find((i) => i.type === "poll")!;
    const res = await recordResponse(v, { interactionId: poll.id, optionId: "o1" });
    expect(res.pollResults?.o1).toBeGreaterThan(0);
  });

  it("rejects empty reflections and unknown interactions", async () => {
    const v = await viewer();
    const refl = flattenLessons(free).flatMap((l) => l.interactions).find((i) => i.type === "reflection")!;
    expect((await recordResponse(v, { interactionId: refl.id, text: " " })).ok).toBe(false);
    expect((await recordResponse(v, { interactionId: "00000000-0000-4000-8000-000000000000", optionId: "o1" })).ok).toBe(false);
  });

  it("blocks locked lessons of paid courses", async () => {
    const v = await viewer();
    const locked = flattenLessons(paid).find((l) => !l.isPreview)!;
    await expect(recordResponse(v, { interactionId: locked.interactions[0].id, acknowledged: true, optionId: "o1", text: "hello", value: 3 })).rejects.toThrow(/access/);
  });
});

describe("recordProgress", () => {
  it("requires required interactions before completing", async () => {
    const v = await viewer();
    const lesson = flattenLessons(free)[0];
    const res = await recordProgress(v, { lessonId: lesson.id, position: lesson.durationSeconds, watched: lesson.durationSeconds });
    expect(res.completed).toBe(lesson.interactions.every((i) => !i.required));
  });

  it("completes a full course, issues a certificate and emails once", async () => {
    const v = await viewer();
    let last = null as Awaited<ReturnType<typeof recordProgress>> | null;
    for (const lesson of flattenLessons(free)) {
      for (const i of lesson.interactions.filter((x) => x.required)) {
        await recordResponse(v, { interactionId: i.id, optionId: i.options?.[0]?.id, text: "a real reflection", value: 5, acknowledged: true });
      }
      last = await recordProgress(v, { lessonId: lesson.id, position: lesson.durationSeconds, watched: lesson.durationSeconds });
      expect(last.newlyCompleted).toBe(true);
    }
    expect(last!.courseCompleted).toBe(true);
    expect(last!.certificateId).toBeTruthy();
    expect(last!.xpAwarded).toBe(50 + 250);
    expect(notifyMock.courseCompleted).toHaveBeenCalledTimes(1);

    const again = await recordProgress(v, { lessonId: flattenLessons(free)[0].id, position: 10, watched: 10 });
    expect(again.newlyCompleted).toBe(false);
    expect(again.completed).toBe(true);
  });

  it("caps watched time at the lesson duration", async () => {
    const v = await viewer();
    const lesson = flattenLessons(free)[1];
    await recordProgress(v, { lessonId: lesson.id, position: 99999, watched: 99999 });
    const [p] = await createDemoStore(async () => state.session).listProgress(v.id, free.id);
    expect(p.watchedSeconds).toBe(lesson.durationSeconds);
  });
});
