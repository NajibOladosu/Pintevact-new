"use server";

import { getStore, getViewer } from "@/lib/data";
import { authorizeLessonForNotes, recordProgress, recordResponse, type ProgressResult, type ResponseResult } from "@/lib/lesson-service";
import { noteSchema, progressSchema, responseSchema } from "@/lib/validation";
import type { Note } from "@/lib/types";

async function viewer() {
  const v = await getViewer();
  if (!v) throw new Error("Please sign in again.");
  return v;
}

export async function saveProgressAction(input: { lessonId: string; position: number; watched: number }): Promise<ProgressResult | null> {
  const parsed = progressSchema.safeParse(input);
  if (!parsed.success) return null;
  return recordProgress(await viewer(), parsed.data);
}

export async function submitResponseAction(input: { interactionId: string; optionId?: string; text?: string; value?: number; acknowledged?: boolean }): Promise<ResponseResult> {
  const parsed = responseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid answer", isCorrect: null, xpAwarded: 0 };
  return recordResponse(await viewer(), parsed.data);
}

export async function addNoteAction(input: { lessonId: string; atSeconds: number; body: string }): Promise<{ note?: Note; error?: string }> {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = await viewer();
  const { course } = await authorizeLessonForNotes(v, parsed.data.lessonId);
  const note = await getStore().addNote(v.id, { lessonId: parsed.data.lessonId, courseId: course.id, atSeconds: Math.round(parsed.data.atSeconds), body: parsed.data.body });
  return { note };
}

export async function deleteNoteAction(noteId: string): Promise<{ ok: boolean }> {
  const v = await viewer();
  await getStore().deleteNote(v.id, noteId);
  return { ok: true };
}
