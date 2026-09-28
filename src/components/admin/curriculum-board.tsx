"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addLesson, addModule, deleteLesson, deleteModule, duplicateLesson, renameModule, saveCurriculumOrder } from "@/app/(app)/admin/courses/actions";
import { AlertTriangle, CaretDown, CaretUp, Copy, Film, PenLine, Plus, Trash } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatMinutes } from "@/lib/utils";
import type { Course } from "@/lib/types";
import { ConfirmButton } from "./confirm-button";
import { SortableList, SortableRow } from "./sortable";
import { useAdminAction } from "./use-admin-action";

type Row =
  | { id: string; kind: "module"; title: string }
  | { id: string; kind: "lesson"; title: string; slug: string; durationSeconds: number; checkpoints: number; hasVideo: boolean; isPreview: boolean };

function toRows(course: Course): Row[] {
  return course.modules.flatMap((m): Row[] => [
    { id: m.id, kind: "module", title: m.title },
    ...m.lessons.map((l): Row => ({ id: l.id, kind: "lesson", title: l.title, slug: l.slug, durationSeconds: l.durationSeconds, checkpoints: l.interactions.length, hasVideo: !!l.bunnyVideoId, isPreview: l.isPreview })),
  ]);
}

/** Flat rows → [{ module, lessons }] in order. Lessons belong to the module above them. */
function toLayout(rows: Row[]) {
  const layout: { id: string; lessons: string[] }[] = [];
  for (const r of rows) {
    if (r.kind === "module") layout.push({ id: r.id, lessons: [] });
    else layout.at(-1)?.lessons.push(r.id);
  }
  return layout;
}

export function CurriculumBoard({ course }: { course: Course }) {
  const [rows, setRows] = useState(() => toRows(course));
  const { run, pending } = useAdminAction();
  const [synced, setSynced] = useState(course);
  if (synced !== course) {
    setSynced(course);
    setRows(toRows(course));
  }

  function commit(moved: Row[]) {
    // A lesson dropped above the first module joins the top of that module.
    const firstModule = moved.findIndex((r) => r.kind === "module");
    const next = firstModule > 0 ? [moved[firstModule], ...moved.slice(0, firstModule), ...moved.slice(firstModule + 1)] : moved;
    const previous = rows;
    setRows(next);
    run(() => saveCurriculumOrder(course.id, toLayout(next)), { quiet: true }).then((r) => !r.ok && setRows(previous));
  }

  /** Moves a whole module (its header and lessons) one place up or down. */
  function moveModule(moduleId: string, dir: -1 | 1) {
    const blocks: Row[][] = [];
    for (const r of rows) (r.kind === "module" ? blocks.push([r]) : blocks.at(-1)?.push(r));
    const i = blocks.findIndex((b) => b[0].id === moduleId);
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    commit(blocks.flat());
  }

  const moduleIds = rows.filter((r) => r.kind === "module").map((r) => r.id);
  const lessonNumbers = new Map(rows.filter((r) => r.kind === "lesson").map((r, i) => [r.id, i + 1]));

  return (
    <div className="space-y-4">
      <ol className="space-y-1.5" aria-label="Curriculum">
        <SortableList items={rows} onReorder={commit} label={(r) => r.title}>
          {(r) => {
            if (r.kind === "module") {
              const index = moduleIds.indexOf(r.id);
              const empty = rows[rows.indexOf(r) + 1]?.kind !== "lesson";
              return (
                <SortableRow key={r.id} id={r.id} label={r.title} disabled className={cn(index > 0 && "!mt-6")}>
                  {() => (
                    <ModuleHeader
                      moduleId={r.id}
                      title={r.title}
                      index={index}
                      count={moduleIds.length}
                      empty={empty}
                      pending={pending}
                      onMove={(dir) => moveModule(r.id, dir)}
                      onRename={(name) => run(() => renameModule(r.id, name))}
                      onDelete={() => run(() => deleteModule(r.id))}
                    />
                  )}
                </SortableRow>
              );
            }
            return (
              <SortableRow key={r.id} id={r.id} label={r.title} className="rounded-[1.1rem] bg-raised ring-1 ring-line">
                {(handle) => <LessonRow row={r} number={lessonNumbers.get(r.id) ?? 0} courseSlug={course.slug} handle={handle} />}
              </SortableRow>
            );
          }}
        </SortableList>
      </ol>
      <AddForms courseId={course.id} courseSlug={course.slug} modules={rows.filter((r) => r.kind === "module")} />
    </div>
  );
}

function ModuleHeader({
  moduleId,
  title,
  index,
  count,
  empty,
  pending,
  onMove,
  onRename,
  onDelete,
}: {
  moduleId: string;
  title: string;
  index: number;
  count: number;
  empty: boolean;
  pending: boolean;
  onMove: (dir: -1 | 1) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(title);
  const [synced, setSynced] = useState(title);
  if (synced !== title) {
    setSynced(title);
    setName(title);
  }
  const save = () => {
    const next = name.trim();
    if (next && next !== title) onRename(next);
    else setName(title);
  };
  return (
    <div className="flex flex-wrap items-center gap-2 px-1 pb-1">
      <span className="eyebrow shrink-0 text-accent-ink">Module {index + 1}</span>
      <input
        aria-label={`Module ${index + 1} name`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") setName(title);
        }}
        className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 text-lg font-semibold tracking-[-0.02em] hover:bg-fg/5 focus:bg-raised focus:outline-none focus:ring-2 focus:ring-accent/40"
        data-module-id={moduleId}
      />
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" className="h-9 w-9" disabled={pending || index === 0} aria-label={`Move ${title} up`} onClick={() => onMove(-1)}>
          <CaretUp size={16} aria-hidden />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" disabled={pending || index === count - 1} aria-label={`Move ${title} down`} onClick={() => onMove(1)}>
          <CaretDown size={16} aria-hidden />
        </Button>
        {empty && count > 1 ? (
          <ConfirmButton variant="ghost" size="icon" className="h-9 w-9" aria-label={`Delete ${title}`} title={`Delete ${title}?`} body="The module is empty, so no lessons are affected." confirmLabel="Delete module" onConfirm={onDelete}>
            <Trash size={16} aria-hidden />
          </ConfirmButton>
        ) : null}
      </div>
    </div>
  );
}

function LessonRow({ row, number, courseSlug, handle }: { row: Extract<Row, { kind: "lesson" }>; number: number; courseSlug: string; handle: React.ReactNode }) {
  const { run, pending } = useAdminAction();
  const href = `/admin/courses/${courseSlug}/lessons/${row.id}`;
  return (
    <div className="flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {handle}
        <span className="tabular w-7 shrink-0 text-center text-xs font-semibold text-accent-ink">{String(number).padStart(2, "0")}</span>
        <div className="min-w-0">
          <Link href={href} className="block truncate font-medium hover:text-accent-ink">
            {row.title}
          </Link>
          <p className="tabular mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-subtle">
            <span>{formatMinutes(row.durationSeconds)}</span>
            <span>·</span>
            <span>
              {row.checkpoints} {row.checkpoints === 1 ? "checkpoint" : "checkpoints"}
            </span>
            <span>·</span>
            {row.hasVideo ? (
              <span className="inline-flex items-center gap-1">
                <Film size={12} aria-hidden /> Video attached
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-danger">
                <AlertTriangle size={12} aria-hidden /> No video
              </span>
            )}
          </p>
        </div>
        {row.isPreview ? <Badge tone="soft" className="ml-1 shrink-0">Free preview</Badge> : null}
      </div>
      <div className="flex items-center gap-1 pl-9 sm:pl-0">
        <Link href={href} className={buttonClasses({ variant: "outline", size: "sm", className: "h-9" })}>
          <PenLine size={15} aria-hidden /> Edit
        </Link>
        <Button variant="ghost" size="icon" className="h-9 w-9" disabled={pending} aria-label={`Duplicate ${row.title}`} onClick={() => run(() => duplicateLesson(row.id))}>
          <Copy size={16} aria-hidden />
        </Button>
        <ConfirmButton
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label={`Delete ${row.title}`}
          title={`Delete ${row.title}?`}
          body="Its checkpoints go too, along with every learner's progress, answers and reflections for this lesson."
          confirmLabel="Delete lesson"
          onConfirm={() => run(() => deleteLesson(row.id))}
        >
          <Trash size={16} aria-hidden />
        </ConfirmButton>
      </div>
    </div>
  );
}

function AddForms({ courseId, courseSlug, modules }: { courseId: string; courseSlug: string; modules: Row[] }) {
  const { run, pending } = useAdminAction();
  const router = useRouter();
  const [lesson, setLesson] = useState("");
  const [picked, setModuleId] = useState(modules.at(-1)?.id ?? "");
  const [moduleName, setModuleName] = useState("");
  const moduleId = modules.some((m) => m.id === picked) ? picked : (modules.at(-1)?.id ?? "");

  return (
    <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
      <form
        className="flex flex-col gap-2 rounded-[1.2rem] border border-dashed border-line-strong p-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!lesson.trim() || !moduleId) return;
          run(() => addLesson(moduleId, lesson.trim())).then((r) => {
            if (!r.ok) return;
            setLesson("");
            if (r.data) router.push(`/admin/courses/${courseSlug}/lessons/${r.data.id}?created=1`);
          });
        }}
      >
        <Input aria-label="New lesson title" placeholder="New lesson title" value={lesson} onChange={(e) => setLesson(e.target.value)} className="h-11 flex-1" maxLength={160} />
        {modules.length > 1 ? (
          <select aria-label="Add to module" value={moduleId} onChange={(e) => setModuleId(e.target.value)} className="h-11 rounded-[0.85rem] border border-line bg-raised px-3 text-sm">
            {modules.map((m, i) => (
              <option key={m.id} value={m.id}>
                Module {i + 1}: {m.title}
              </option>
            ))}
          </select>
        ) : null}
        <Button type="submit" size="sm" className="h-11" loading={pending} disabled={!lesson.trim()}>
          <Plus size={15} aria-hidden /> Add lesson
        </Button>
      </form>
      <form
        className="flex gap-2 rounded-[1.2rem] border border-dashed border-line-strong p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!moduleName.trim()) return;
          run(() => addModule(courseId, moduleName.trim())).then((r) => r.ok && setModuleName(""));
        }}
      >
        <Input aria-label="New module name" placeholder="New module" value={moduleName} onChange={(e) => setModuleName(e.target.value)} className="h-11 flex-1" maxLength={160} />
        <Button type="submit" variant="outline" size="sm" className="h-11" disabled={pending || !moduleName.trim()}>
          <Plus size={15} aria-hidden /> Add module
        </Button>
      </form>
    </div>
  );
}
