import "server-only";
import { getCourses, getStore } from "@/lib/data";
import { canWatchLesson } from "@/lib/access";
import { courseProgress, flattenLessons, isLessonComplete } from "@/lib/course";
import { scoreResponse, XP_RULES } from "@/lib/gamification";
import { notify } from "@/lib/notifications";
import type { Course, Lesson } from "@/lib/types";
import type { Viewer } from "@/lib/data/store";

export async function resolveLesson(lessonId: string): Promise<{ course: Course; lesson: Lesson } | null> {
  for (const course of await getCourses()) {
    const lesson = flattenLessons(course).find((l) => l.id === lessonId);
    if (lesson) return { course, lesson };
  }
  return null;
}

async function authorize(viewer: Viewer, lessonId: string) {
  const found = await resolveLesson(lessonId);
  if (!found) throw new Error("Lesson not found");
  const access = await getStore().getAccess(viewer.id);
  if (!canWatchLesson(found.course, found.lesson, access)) throw new Error("You don't have access to this lesson");
  return found;
}

export type ProgressResult = {
  completed: boolean;
  newlyCompleted: boolean;
  xpAwarded: number;
  courseCompleted: boolean;
  certificateId: string | null;
};

/** Persist playback progress; completes the lesson (and course) when the rules are satisfied. */
export async function recordProgress(viewer: Viewer, input: { lessonId: string; position: number; watched: number }): Promise<ProgressResult> {
  const { course, lesson } = await authorize(viewer, input.lessonId);
  const store = getStore();
  const watched = Math.min(input.watched, lesson.durationSeconds);
  const position = Math.min(input.position, lesson.durationSeconds);

  const existing = (await store.listProgress(viewer.id, course.id)).find((p) => p.lessonId === lesson.id);
  const answered = new Set((await store.listResponses(viewer.id, { lessonId: lesson.id })).map((r) => r.interactionId));
  const totalWatched = Math.max(existing?.watchedSeconds ?? 0, watched);
  const shouldComplete = isLessonComplete(lesson, totalWatched, answered);

  const saved = await store.upsertProgress(viewer.id, { lessonId: lesson.id, courseId: course.id, lastPosition: position, watchedSeconds: watched, completed: shouldComplete });
  const newlyCompleted = !existing?.completedAt && Boolean(saved.completedAt);

  let xpAwarded = 0;
  let courseCompleted = false;
  let certificateId: string | null = null;

  if (newlyCompleted) {
    if (await store.awardXp(viewer.id, XP_RULES.lessonComplete, "lesson", lesson.id)) xpAwarded += XP_RULES.lessonComplete;
    const all = await store.listProgress(viewer.id, course.id);
    const pct = courseProgress(course, all);
    if (pct.total > 0 && pct.completed === pct.total) {
      courseCompleted = true;
      await store.markEnrollmentComplete(viewer.id, course.id);
      const { certificate, created } = await store.issueCertificate(viewer.id, course.id);
      certificateId = certificate.id;
      if (await store.awardXp(viewer.id, XP_RULES.courseComplete, "course", course.id)) xpAwarded += XP_RULES.courseComplete;
      if (created) {
        await notify
          .courseCompleted({ email: viewer.email, name: viewer.profile.fullName }, { courseTitle: course.title, certificateId: certificate.id, xpEarned: XP_RULES.courseComplete })
          .catch(console.error);
      }
    }
  }

  return { completed: Boolean(saved.completedAt), newlyCompleted, xpAwarded, courseCompleted, certificateId };
}

export type ResponseResult = {
  ok: boolean;
  error?: string;
  isCorrect: boolean | null;
  xpAwarded: number;
  pollResults?: Record<string, number>;
};

export async function recordResponse(
  viewer: Viewer,
  input: { interactionId: string; optionId?: string; text?: string; value?: number; acknowledged?: boolean },
): Promise<ResponseResult> {
  const found = (await getCourses())
    .flatMap((c) => flattenLessons(c).map((l) => ({ c, l })))
    .find(({ l }) => l.interactions.some((i) => i.id === input.interactionId));
  if (!found) return { ok: false, error: "Unknown interaction", isCorrect: null, xpAwarded: 0 };
  await authorize(viewer, found.l.id);
  const interaction = found.l.interactions.find((i) => i.id === input.interactionId)!;

  const response = { optionId: input.optionId, text: input.text?.trim(), value: input.value, acknowledged: input.acknowledged };
  const score = scoreResponse(interaction, response);
  if (!score.valid) return { ok: false, error: interaction.type === "reflection" ? "Write at least a few words." : "Please choose an answer.", isCorrect: null, xpAwarded: 0 };

  const store = getStore();
  const clean = Object.fromEntries(Object.entries(response).filter(([, v]) => v !== undefined && v !== ""));
  await store.saveResponse(viewer.id, { interactionId: interaction.id, lessonId: found.l.id, courseId: found.c.id, response: clean, isCorrect: score.isCorrect });
  const xpAwarded = (await store.awardXp(viewer.id, score.xp, "interaction", interaction.id)) ? score.xp : 0;
  const pollResults = interaction.type === "poll" ? await store.pollResults(interaction.id) : undefined;
  return { ok: true, isCorrect: score.isCorrect, xpAwarded, pollResults };
}

export async function authorizeLessonForNotes(viewer: Viewer, lessonId: string) {
  return authorize(viewer, lessonId);
}
