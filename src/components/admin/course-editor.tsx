"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteCourse, duplicateCourse, removeCover, saveCourseDetails, setPublished, uploadCover } from "@/app/(app)/admin/courses/actions";
import { Copy, ImageIcon, Trash, Upload } from "@/components/icons";
import { CourseArt } from "@/components/course/course-card";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { LEVELS, THEMES } from "@/lib/admin/schemas";
import type { Course } from "@/lib/types";
import type { FormState } from "@/lib/validation";
import { ConfirmButton } from "./confirm-button";
import { useAdminAction } from "./use-admin-action";
import { useFormAction } from "./use-form-action";
import { useUnsavedChanges } from "./use-unsaved-changes";

export function FormStatus({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={state.ok ? "text-sm font-semibold text-accent-ink" : "text-sm font-semibold text-danger"}>
      {state.message}
    </p>
  );
}

function Field({ name, label, state, hint, children }: { name: string; label: string; state: FormState; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-subtle">{hint}</p> : null}
      <FieldError id={`${name}-error`} message={state.errors?.[name]} />
    </div>
  );
}

const invalid = (state: FormState, name: string) => (state.errors?.[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {});

export function CourseDetailsForm({ course }: { course: Course }) {
  const { state, onSubmit, pending } = useFormAction(saveCourseDetails);
  const formRef = useRef<HTMLFormElement>(null);
  const { markClean } = useUnsavedChanges(formRef);
  useEffect(() => {
    if (state.ok) markClean();
  }, [state, markClean]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="courseId" value={course.id} />
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="title" label="Title" state={state}>
          <Input id="title" name="title" defaultValue={course.title} required {...invalid(state, "title")} />
        </Field>
        <Field name="slug" label="Web address" state={state} hint={`pintevact.com/courses/${course.slug}`}>
          <Input id="slug" name="slug" defaultValue={course.slug} required {...invalid(state, "slug")} />
        </Field>
      </div>
      <Field name="subtitle" label="Subtitle" state={state} hint="One line under the title on cards and the course page.">
        <Input id="subtitle" name="subtitle" defaultValue={course.subtitle} {...invalid(state, "subtitle")} />
      </Field>
      <Field name="description" label="Description" state={state}>
        <Textarea id="description" name="description" rows={5} defaultValue={course.description} {...invalid(state, "description")} />
      </Field>
      <Field name="outcomes" label="What learners take away" state={state} hint="One outcome per line.">
        <Textarea id="outcomes" name="outcomes" rows={4} defaultValue={course.outcomes.join("\n")} {...invalid(state, "outcomes")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
        <Field name="price" label="Price (USD)" state={state} hint="0 makes it free.">
          <Input id="price" name="price" type="number" inputMode="decimal" min={0} step="0.01" defaultValue={(course.priceCents / 100).toFixed(2)} {...invalid(state, "priceCents")} />
        </Field>
        <Field name="category" label="Category" state={state}>
          <Input id="category" name="category" defaultValue={course.category} {...invalid(state, "category")} />
        </Field>
        <Field name="level" label="Level" state={state}>
          <Select id="level" name="level" defaultValue={course.level}>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </Select>
        </Field>
        <Field name="theme" label="Accent theme" state={state}>
          <Select id="theme" name="theme" defaultValue={course.theme}>
            {THEMES.map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field name="stripePriceId" label="Stripe price ID (optional)" state={state} hint="Leave empty to charge the price above. Set it to use a price you manage in Stripe.">
        <Input id="stripePriceId" name="stripePriceId" defaultValue={course.stripePriceId ?? ""} placeholder="price_…" {...invalid(state, "stripePriceId")} />
      </Field>
      <fieldset className="space-y-5 rounded-[1.2rem] border border-line p-5">
        <legend className="px-1 text-sm font-medium">Instructor</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <Field name="instructorName" label="Name" state={state}>
            <Input id="instructorName" name="instructorName" defaultValue={course.instructor?.name ?? ""} />
          </Field>
          <Field name="instructorTitle" label="Title" state={state}>
            <Input id="instructorTitle" name="instructorTitle" defaultValue={course.instructor?.title ?? ""} placeholder="Clinical Psychologist" />
          </Field>
        </div>
        <Field name="instructorBio" label="Short bio" state={state}>
          <Textarea id="instructorBio" name="instructorBio" rows={3} defaultValue={course.instructor?.bio ?? ""} className="min-h-24" />
        </Field>
      </fieldset>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" name="published" defaultChecked={course.published} className="h-5 w-5 accent-[var(--accent)]" /> Published on the site
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" name="featured" defaultChecked={course.featured} className="h-5 w-5 accent-[var(--accent)]" /> Featured on the home page
        </label>
      </div>
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-4 rounded-[1.1rem] bg-raised/90 py-2 backdrop-blur">
        <Button type="submit" loading={pending}>
          Save course
        </Button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}

export function CoverUploader({ course }: { course: Course }) {
  const { run, pending } = useAdminAction();
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function onPick(file: File | undefined) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return toast({ title: "Use a JPG, PNG, WebP or AVIF image", tone: "error" });
    if (file.size > 5 * 1024 * 1024) return toast({ title: "Keep the image under 5 MB", tone: "error" });
    const local = URL.createObjectURL(file);
    setPreview(local);
    const data = new FormData();
    data.set("cover", file);
    run(() => uploadCover(course.id, data)).then(() => {
      URL.revokeObjectURL(local);
      setPreview(null);
      if (input.current) input.current.value = "";
    });
  }

  return (
    <div>
      <CourseArt index={course.position} image={preview ?? course.coverImageUrl} className="aspect-[16/10] rounded-[1.3rem]">
        {pending ? <span className="absolute inset-0 flex items-center justify-center bg-frame/50 text-sm font-medium text-white">Uploading…</span> : null}
      </CourseArt>
      <p className="mt-3 text-xs text-subtle">{course.coverImageUrl ? "Custom cover." : "Using the papercut artwork."} Landscape, at least 1600px wide, under 5 MB.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input ref={input} id="cover-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
        <Button type="button" variant="secondary" size="sm" loading={pending} onClick={() => input.current?.click()}>
          {course.coverImageUrl ? <ImageIcon size={16} aria-hidden /> : <Upload size={16} aria-hidden />} {course.coverImageUrl ? "Replace cover" : "Upload cover"}
        </Button>
        {course.coverImageUrl ? (
          <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => run(() => removeCover(course.id))}>
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function CourseHeaderActions({ course, lessons, purchases }: { course: Course; lessons: number; purchases: number }) {
  const { run, pending } = useAdminAction();
  const router = useRouter();
  return (
    <>
      <Button variant={course.published ? "outline" : "primary"} size="sm" disabled={pending} onClick={() => run(() => setPublished(course.id, !course.published))}>
        {course.published ? "Unpublish" : "Publish"}
      </Button>
      <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => duplicateCourse(course.id)).then((r) => r.ok && r.data && router.push(`/admin/courses/${r.data.slug}`))}>
        <Copy size={16} aria-hidden /> Duplicate
      </Button>
      <ConfirmButton
        variant="ghost"
        size="sm"
        title={`Delete ${course.title}?`}
        body={
          purchases
            ? `${purchases} ${purchases === 1 ? "learner has" : "learners have"} bought this course, so it can't be deleted. Unpublish it instead.`
            : `This removes the course, its ${lessons} lessons and every learner's progress in it. It can't be undone.`
        }
        confirmLabel="Delete course"
        onConfirm={() => run(() => deleteCourse(course.id), { refresh: false }).then((r) => r.ok && router.push("/admin/courses"))}
      >
        <Trash size={16} aria-hidden /> Delete
      </ConfirmButton>
    </>
  );
}
