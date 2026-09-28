"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createCourse, deleteCourse, duplicateCourse, reorderCourses, setPublished } from "@/app/(app)/admin/courses/actions";
import { Copy, Eye, PenLine, Plus, Trash } from "@/components/icons";
import { CourseArt } from "@/components/course/course-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { ConfirmButton } from "./confirm-button";
import { SortableList, SortableRow } from "./sortable";
import { useAdminAction } from "./use-admin-action";
import { formatMinutes, formatMoney, formatPrice } from "@/lib/utils";

export type CourseListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  position: number;
  coverImageUrl: string | null;
  published: boolean;
  featured: boolean;
  priceCents: number;
  currency: string;
  lessons: number;
  durationSeconds: number;
  checkpoints: number;
  videosMissing: number;
  learners: number;
  purchases: number;
  revenueCents: number;
};

export function NewCourseForm() {
  const [state, action, pending] = useActionState(createCourse, {});
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="new-course-title">New course</Label>
        <Input id="new-course-title" name="title" placeholder="e.g. The Anxious Brain" required minLength={2} maxLength={120} aria-invalid={state.errors?.title ? true : undefined} />
        <FieldError message={state.errors?.title} />
      </div>
      <Button type="submit" loading={pending} className="sm:mb-[1px]">
        <Plus size={16} aria-hidden /> Create draft
      </Button>
    </form>
  );
}

export function CourseList({ courses: initial }: { courses: CourseListItem[] }) {
  const [courses, setCourses] = useState(initial);
  const { run } = useAdminAction();
  // Take fresh server data after a refresh, replacing the optimistic order.
  const [synced, setSynced] = useState(initial);
  if (synced !== initial) {
    setSynced(initial);
    setCourses(initial);
  }

  function reorder(next: CourseListItem[]) {
    const previous = courses;
    setCourses(next);
    run(() => reorderCourses(next.map((c) => c.id)), { quiet: true }).then((res) => !res.ok && setCourses(previous));
  }

  if (!courses.length) return <p className="rounded-[1.6rem] bg-raised p-8 text-center text-muted ring-1 ring-line">No courses yet. Create your first draft above.</p>;

  return (
    <ol className="space-y-2.5" aria-label="Courses, in catalogue order">
      <SortableList items={courses} onReorder={reorder} label={(c) => c.title}>
        {(c) => (
          <SortableRow key={c.id} id={c.id} label={c.title} className="rounded-[1.4rem] bg-raised ring-1 ring-line">
            {(handle) => <CourseRowItem course={c} handle={handle} />}
          </SortableRow>
        )}
      </SortableList>
    </ol>
  );
}

function CourseRowItem({ course: c, handle }: { course: CourseListItem; handle: React.ReactNode }) {
  const { run, pending } = useAdminAction();
  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {handle}
        <CourseArt index={c.position} image={c.coverImageUrl} className="h-16 w-20 shrink-0 rounded-[0.9rem]" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/admin/courses/${c.slug}`} className="truncate font-semibold tracking-[-0.01em] hover:text-accent-ink">
              {c.title}
            </Link>
            {c.published ? <Badge tone="success">Live</Badge> : <Badge>Draft</Badge>}
            {c.featured ? <Badge tone="soft">Featured</Badge> : null}
          </div>
          <p className="tabular mt-1 text-[0.8125rem] text-subtle">
            {c.priceCents ? formatPrice(c.priceCents, c.currency) : "Free"} · {c.lessons} {c.lessons === 1 ? "lesson" : "lessons"} · {formatMinutes(c.durationSeconds)} · {c.checkpoints} checkpoints
            {c.videosMissing ? <span className="text-danger"> · {c.videosMissing} without video</span> : null}
          </p>
          <p className="tabular mt-0.5 text-[0.8125rem] text-subtle">
            {c.learners} {c.learners === 1 ? "learner" : "learners"} · {c.purchases} {c.purchases === 1 ? "sale" : "sales"} · {formatMoney(c.revenueCents, c.currency)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 pl-10 lg:pl-0">
        <Link href={`/admin/courses/${c.slug}`} className={buttonClasses({ variant: "secondary", size: "sm" })}>
          <PenLine size={15} aria-hidden /> Edit
        </Link>
        <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => setPublished(c.id, !c.published))}>
          {c.published ? "Unpublish" : "Publish"}
        </Button>
        <Link href={`/courses/${c.slug}`} target="_blank" className={buttonClasses({ variant: "ghost", size: "icon" })} aria-label={`Preview ${c.title}`} title="Preview">
          <Eye size={17} aria-hidden />
        </Link>
        <Button variant="ghost" size="icon" disabled={pending} aria-label={`Duplicate ${c.title}`} title="Duplicate" onClick={() => run(() => duplicateCourse(c.id))}>
          <Copy size={17} aria-hidden />
        </Button>
        <ConfirmButton
          variant="ghost"
          size="icon"
          aria-label={`Delete ${c.title}`}
          title={`Delete ${c.title}?`}
          body={
            <>
              This removes the course, its {c.lessons} lessons and every learner&apos;s progress and reflections in it. It can&apos;t be undone.
              {c.purchases ? " Courses with sales can't be deleted; unpublish it instead." : null}
            </>
          }
          confirmLabel="Delete course"
          onConfirm={() => run(() => deleteCourse(c.id))}
        >
          <Trash size={17} aria-hidden />
        </ConfirmButton>
      </div>
    </div>
  );
}
