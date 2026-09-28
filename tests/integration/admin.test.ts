import { afterAll, describe, expect, it } from "vitest";
import { Upload } from "tus-js-client";
import * as catalog from "@/lib/admin/catalog";
import { AdminError } from "@/lib/admin/catalog";
import * as users from "@/lib/admin/users";
import { audit, recentAudit } from "@/lib/admin/audit";
import { interactionSchema } from "@/lib/admin/schemas";
import { createBunnyUpload, deleteBunnyVideo, getBunnyVideo, listBunnyVideoPage, renameBunnyVideo } from "@/lib/bunny";
import { flattenLessons } from "@/lib/course";
import { admin, createUser, uniqueEmail } from "../support/supabase";
import { waitForEmail } from "../support/mailpit";

const created: string[] = [];
afterAll(async () => {
  for (const id of created) await catalog.deleteCourse(id).catch(() => {});
});

async function newCourse(title = `Test course ${Date.now()}`) {
  const c = await catalog.createCourse(title);
  created.push(c.id);
  return c;
}

const quiz = (at: number) => interactionSchema.parse({ type: "quiz", atSeconds: at, prompt: "Which is right?", xp: 20, explanation: "Because.", options: [{ label: "This", correct: true }, { label: "That", correct: false }] });

describe("admin course authoring", () => {
  it("creates a draft with a module, then builds, reorders and duplicates lessons", async () => {
    const { id, slug } = await newCourse("Calm Under Pressure");
    expect(slug).toMatch(/^calm-under-pressure/);
    let course = (await catalog.getCourseById(id))!;
    expect(course.published).toBe(false);
    expect(course.modules).toHaveLength(1);

    // Publishing needs at least one lesson.
    await expect(catalog.setCoursePublished(id, true)).rejects.toBeInstanceOf(AdminError);

    const m1 = course.modules[0].id;
    const m2 = (await catalog.addModule(id, "Going deeper")).id;
    const a = await catalog.addLesson(m1, "First steps");
    const b = await catalog.addLesson(m1, "First steps"); // same title gets its own slug
    const c = await catalog.addLesson(m2, "Breathing");
    course = (await catalog.getCourseById(id))!;
    expect(flattenLessons(course).map((l) => l.slug)).toEqual(["first-steps", "first-steps-2", "breathing"]);

    // Move "Breathing" to the top of module 1 and the second lesson into module 2.
    await catalog.reorderCurriculum(id, [
      { id: m1, lessons: [c.id, a.id] },
      { id: m2, lessons: [b.id] },
    ]);
    course = (await catalog.getCourseById(id))!;
    expect(course.modules.map((m) => m.lessons.map((l) => l.id))).toEqual([[c.id, a.id], [b.id]]);
    expect(flattenLessons(course).map((l) => l.position)).toEqual([0, 1, 2]);

    // A layout that leaves a lesson out is refused as a whole.
    await expect(catalog.reorderCurriculum(id, [{ id: m1, lessons: [c.id] }, { id: m2, lessons: [b.id] }])).rejects.toBeInstanceOf(AdminError);

    await catalog.saveInteraction(a.id, quiz(120));
    const copy = await catalog.duplicateLesson(a.id);
    course = (await catalog.getCourseById(id))!;
    const lessons = flattenLessons(course);
    expect(lessons.map((l) => l.id)).toEqual([c.id, a.id, copy.id, b.id]);
    expect(lessons[2]).toMatchObject({ slug: "first-steps-copy", title: "First steps (copy)", isPreview: false });
    expect(lessons[2].interactions).toHaveLength(1);

    await catalog.setCoursePublished(id, true);
    expect((await catalog.getCourseById(id))!.published).toBe(true);
  });

  it("edits details and refuses a slug another course uses", async () => {
    const { id } = await newCourse();
    const base = { courseId: id, title: "Renamed", subtitle: "Sub", description: "", category: "Emotions", level: "Beginner" as const, priceCents: 2500, stripePriceId: null, theme: "tide" as const, outcomes: ["One"], instructorName: "Ada", instructorTitle: "Coach", instructorBio: "", published: false, featured: true };
    await expect(catalog.updateCourseDetails({ ...base, slug: "meet-your-mind" })).rejects.toThrow(/already uses/);
    const slug = `renamed-${Date.now()}`;
    await catalog.updateCourseDetails({ ...base, slug });
    const course = (await catalog.getCourseForAdmin(slug))!;
    expect(course).toMatchObject({ title: "Renamed", priceCents: 2500, theme: "tide", featured: true, outcomes: ["One"] });
    expect(course.instructor).toEqual({ name: "Ada", title: "Coach", bio: "" });
  });

  it("keeps checkpoints inside the video and edits them in place", async () => {
    const { id } = await newCourse();
    const course = (await catalog.getCourseById(id))!;
    const lesson = await catalog.addLesson(course.modules[0].id, "Timed");
    await expect(catalog.saveInteraction(lesson.id, quiz(600))).rejects.toThrow(/before the video ends/);
    const cid = await catalog.saveInteraction(lesson.id, quiz(100));
    await catalog.saveInteraction(lesson.id, interactionSchema.parse({ id: cid, type: "insight", atSeconds: 200, prompt: "Notice this", xp: 5, body: "Feelings pass." }));
    let saved = flattenLessons((await catalog.getCourseById(id))!)[0].interactions;
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ id: cid, type: "insight", atSeconds: 200, body: "Feelings pass.", required: false });

    // Shortening the video below a checkpoint is refused.
    await expect(
      catalog.updateLessonDetails({ lessonId: lesson.id, title: "Timed", slug: "timed", summary: "", durationSeconds: 150, isPreview: false, chapters: [], takeaways: [], exercise: null }),
    ).rejects.toThrow(/after the end of the video/);

    await catalog.deleteInteraction(lesson.id, cid);
    saved = flattenLessons((await catalog.getCourseById(id))!)[0].interactions;
    expect(saved).toHaveLength(0);
  });

  it("duplicates a whole course as a draft, deep-copying checkpoints", async () => {
    const source = (await catalog.getCourseForAdmin("emotional-alchemy"))!;
    const copy = await catalog.duplicateCourse(source.id);
    created.push(copy.id);
    const dup = (await catalog.getCourseById(copy.id))!;
    expect(dup).toMatchObject({ slug: "emotional-alchemy-copy", title: "Emotional Alchemy (copy)", published: false, featured: false, stripePriceId: null });
    expect(flattenLessons(dup).map((l) => l.title)).toEqual(flattenLessons(source).map((l) => l.title));
    const count = (c: typeof dup) => flattenLessons(c).reduce((n, l) => n + l.interactions.length, 0);
    expect(count(dup)).toBe(count(source));
    expect(flattenLessons(dup)[0].interactions[0].id).not.toBe(flattenLessons(source)[0].interactions[0].id);
  });

  it("only deletes empty modules and courses nobody bought", async () => {
    const { id } = await newCourse();
    const course = (await catalog.getCourseById(id))!;
    await expect(catalog.deleteModule(course.modules[0].id)).rejects.toThrow(/at least one module/);
    const m2 = await catalog.addModule(id, "Extra");
    const lesson = await catalog.addLesson(m2.id, "Inside");
    await expect(catalog.deleteModule(m2.id)).rejects.toThrow(/Move or delete/);
    await catalog.deleteLesson(lesson.id);
    await catalog.deleteModule(m2.id);

    const buyer = await createUser();
    await admin().from("purchases").insert({ user_id: buyer.id, course_id: id, amount_cents: 1000, currency: "usd" });
    await expect(catalog.deleteCourse(id)).rejects.toThrow(/bought this course/);
    await admin().from("purchases").delete().eq("course_id", id);
    await catalog.deleteCourse(id);
    expect(await catalog.getCourseById(id)).toBeNull();
  });

  it("stores cover images in Supabase Storage and cleans up replaced ones", async () => {
    const { id } = await newCourse();
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
    const url = await catalog.uploadCourseCover(id, new File([png], "cover.png", { type: "image/png" }));
    expect(url).toMatch(/\/storage\/v1\/object\/public\/course-covers\//);
    expect((await fetch(url)).status).toBe(200);
    const next = await catalog.uploadCourseCover(id, new File([png], "cover2.png", { type: "image/png" }));
    expect((await catalog.getCourseById(id))!.coverImageUrl).toBe(next);
    expect((await fetch(url)).status).not.toBe(200);
    await expect(catalog.uploadCourseCover(id, new File(["<svg/>"], "x.svg", { type: "image/svg+xml" }))).rejects.toThrow(/JPG, PNG/);
    await catalog.removeCourseCover(id);
    expect((await catalog.getCourseById(id))!.coverImageUrl).toBeNull();
  });
});

describe("Bunny Stream library", () => {
  it("creates a video, uploads it over signed TUS, then renames and deletes it", async () => {
    const title = `Upload ${Date.now()}`;
    const signed = await createBunnyUpload(title);
    expect((await getBunnyVideo(signed.videoId)).status).toBe(0);

    const file = Buffer.alloc(256 * 1024, 7);
    await new Promise<void>((resolve, reject) => {
      new Upload(file, {
        endpoint: signed.endpoint,
        chunkSize: 100 * 1024,
        headers: { AuthorizationSignature: signed.signature, AuthorizationExpire: String(signed.expires), VideoId: signed.videoId, LibraryId: signed.libraryId },
        metadata: { filetype: "video/mp4", title },
        onSuccess: () => resolve(),
        onError: reject,
      }).start();
    });
    const video = await getBunnyVideo(signed.videoId);
    expect(video.status).toBe(4);
    expect(video.storageSize).toBe(file.length);

    await renameBunnyVideo(signed.videoId, "Renamed upload");
    expect((await listBunnyVideoPage({ search: "Renamed upload" })).items.map((v) => v.guid)).toContain(signed.videoId);
    await deleteBunnyVideo(signed.videoId);
    await expect(getBunnyVideo(signed.videoId)).rejects.toThrow(/404/);
  });

  it("attaches a library video and adopts its length", async () => {
    const { id } = await newCourse();
    const course = (await catalog.getCourseById(id))!;
    const lesson = await catalog.addLesson(course.modules[0].id, "With video");
    await catalog.setLessonVideo(lesson.id, "e2e-480", 480);
    const saved = flattenLessons((await catalog.getCourseById(id))!)[0];
    expect(saved).toMatchObject({ bunnyVideoId: "e2e-480", durationSeconds: 480 });
    expect((await catalog.videoUsage()).get("e2e-480")?.some((u) => u.lessonId === lesson.id)).toBe(true);
  });
});

describe("admin learner management", () => {
  it("finds learners, grants and revokes courses, suspends and exports", async () => {
    const actor = await createUser({ role: "admin" });
    const email = uniqueEmail("managed");
    const learner = await createUser({ email, name: "=HYPERLINK(1)" });

    const found = await users.listUsers({ q: email });
    expect(found.rows.map((r) => r.id)).toEqual([learner.id]);
    expect((await users.listUsers({ q: email, role: "admin" })).rows).toHaveLength(0);

    const course = (await catalog.getCourseForAdmin("emotional-alchemy"))!;
    await users.grantCourse(learner.id, course.id);
    let detail = (await users.getUserDetail(learner.id))!;
    expect(detail.courses).toEqual([expect.objectContaining({ courseId: course.id, source: "admin", lessonsTotal: flattenLessons(course).length })]);
    await users.revokeCourse(learner.id, course.id);
    expect((await users.getUserDetail(learner.id))!.courses).toHaveLength(0);

    await expect(users.setUserRole(actor.id, actor.id, "student")).rejects.toThrow(/your own admin/);
    await users.setSuspended(actor.id, learner.id, true);
    detail = (await users.getUserDetail(learner.id))!;
    expect(detail.suspendedUntil).not.toBeNull();
    await users.setSuspended(actor.id, learner.id, false);
    expect((await users.getUserDetail(learner.id))!.suspendedUntil).toBeNull();

    const csv = await users.exportUsersCsv();
    expect(csv).toContain(`"${email}","'=HYPERLINK(1)","student"`);

    await users.sendPasswordReset(email);
    await waitForEmail(email, /Reset your password/);

    await expect(users.deleteUser(actor.id, actor.id)).rejects.toThrow(/Account settings/);
    await users.deleteUser(actor.id, learner.id);
    expect(await users.getUserDetail(learner.id)).toBeNull();
  });

  it("records admin activity", async () => {
    const actor = await createUser({ role: "admin", name: "Auditor" });
    await audit(actor.id, "edited", "course", null, `Audit ${Date.now()}`);
    const [latest] = await recentAudit(1);
    expect(latest).toMatchObject({ actor: "Auditor", action: "edited", targetType: "course" });
  });
});

describe("database permissions", () => {
  it("keeps the admin SQL helpers away from signed-in learners", async () => {
    const { signedInClient } = await import("../support/supabase");
    const learner = await createUser();
    const client = await signedInClient(learner.email);
    const course = (await catalog.getCourseForAdmin("meet-your-mind"))!;
    const res = await client.rpc("admin_duplicate_course", { p_course_id: course.id, p_slug: "stolen", p_title: "Stolen" });
    expect(res.error?.code).toBe("42501");
    const audit = await client.from("admin_audit_log").select("id");
    expect(audit.data).toEqual([]);
  });
});
