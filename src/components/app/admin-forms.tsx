"use client";

import { useActionState } from "react";
import { saveCourse, saveLesson } from "@/app/(app)/admin/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import type { Course, Lesson } from "@/lib/types";

function Status({ ok, message }: { ok?: boolean; message?: string }) {
  if (!message) return null;
  return <p role="status" className={ok ? "text-sm font-semibold text-accent-ink" : "text-sm font-semibold text-danger"}>{message}</p>;
}

const select = "h-11 w-full rounded-[0.85rem] border border-line bg-raised px-3.5 text-fg focus:border-accent focus:outline-none";

export function CourseForm({ course }: { course: Course }) {
  const [state, action, pending] = useActionState(saveCourse, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="courseId" value={course.id} />
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={course.title} />
          <FieldError message={state.errors?.title} />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={course.category} />
          <FieldError message={state.errors?.category} />
        </div>
      </div>
      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" name="subtitle" defaultValue={course.subtitle} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={course.description} />
      </div>
      <div className="grid gap-5 md:grid-cols-4">
        <div>
          <Label htmlFor="price">Price (USD)</Label>
          <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={(course.priceCents / 100).toFixed(2)} />
          <FieldError message={state.errors?.priceCents} />
        </div>
        <div>
          <Label htmlFor="level">Level</Label>
          <select id="level" name="level" defaultValue={course.level} className={select}>
            {["Beginner", "Intermediate", "Advanced"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="theme">Theme</Label>
          <select id="theme" name="theme" defaultValue={course.theme} className={select}>
            {["ember", "iris", "lucid", "tide", "sun", "blush"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="stripePriceId">Stripe price ID</Label>
          <Input id="stripePriceId" name="stripePriceId" defaultValue={course.stripePriceId ?? ""} placeholder="optional" />
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="published" defaultChecked={course.published} className="h-5 w-5 accent-[var(--accent)]" /> Published
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={course.featured} className="h-5 w-5 accent-[var(--accent)]" /> Featured on home page
        </label>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" variant="primary" loading={pending}>
          Save course
        </Button>
        <Status ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}

export function LessonForm({ lesson, videos }: { lesson: Lesson; videos: { guid: string; title: string }[] }) {
  const [state, action, pending] = useActionState(saveLesson, {});
  const listId = `videos-${lesson.id}`;
  return (
    <form action={action} className="grid gap-4 md:grid-cols-[1.4fr_1fr_0.6fr_auto] md:items-end">
      <input type="hidden" name="lessonId" value={lesson.id} />
      <input type="hidden" name="summary" value={lesson.summary} />
      <div>
        <Label htmlFor={`t-${lesson.id}`}>Title</Label>
        <Input id={`t-${lesson.id}`} name="title" defaultValue={lesson.title} />
        <FieldError message={state.errors?.title} />
      </div>
      <div>
        <Label htmlFor={`v-${lesson.id}`}>Bunny video ID</Label>
        <Input id={`v-${lesson.id}`} name="bunnyVideoId" defaultValue={lesson.bunnyVideoId ?? ""} list={listId} placeholder="Video GUID" className="font-mono text-sm" />
        <datalist id={listId}>
          {videos.map((v) => (
            <option key={v.guid} value={v.guid}>
              {v.title}
            </option>
          ))}
        </datalist>
        <FieldError message={state.errors?.bunnyVideoId} />
      </div>
      <div>
        <Label htmlFor={`d-${lesson.id}`}>Minutes</Label>
        <Input id={`d-${lesson.id}`} name="durationMinutes" type="number" min={0.1} step="0.1" defaultValue={(lesson.durationSeconds / 60).toFixed(1)} />
      </div>
      <div className="flex items-center gap-3 pb-1">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPreview" defaultChecked={lesson.isPreview} className="h-5 w-5 accent-[var(--accent)]" /> Preview
        </label>
        <Button type="submit" size="sm" variant="outline" loading={pending}>
          Save
        </Button>
      </div>
      {state.message ? (
        <div className="md:col-span-4">
          <Status ok={state.ok} message={state.message} />
        </div>
      ) : null}
    </form>
  );
}
