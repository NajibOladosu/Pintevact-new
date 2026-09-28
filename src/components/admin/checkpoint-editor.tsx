"use client";

import { useState } from "react";
import { deleteInteraction, saveInteraction } from "@/app/(app)/admin/courses/actions";
import { InteractionIcon, interactionMeta } from "@/components/course/interaction-icon";
import { Plus, Trash, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { DEFAULT_XP, formatClock, parseClock, type InteractionInput } from "@/lib/admin/schemas";
import type { Interaction, InteractionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ConfirmButton } from "./confirm-button";
import { useAdminAction } from "./use-admin-action";

type Draft = {
  id?: string;
  type: InteractionType;
  at: string;
  prompt: string;
  xp: string;
  options: { label: string; correct: boolean; feedback: string }[];
  explanation: string;
  required: boolean;
  body: string;
  min: string;
  max: string;
  minLabel: string;
  maxLabel: string;
};

const TYPES: { type: InteractionType; hint: string }[] = [
  { type: "quiz", hint: "A question with one right answer. Learners must answer to finish the lesson." },
  { type: "reflection", hint: "A written prompt. Answers are private and saved to the learner's vault." },
  { type: "poll", hint: "An opinion question. Learners see how others answered." },
  { type: "scale", hint: "A self-rating on a numbered scale." },
  { type: "insight", hint: "A short idea card. Nothing to answer." },
];

function blank(type: InteractionType, at: number): Draft {
  return {
    type,
    at: formatClock(at),
    prompt: "",
    xp: String(DEFAULT_XP[type]),
    options:
      type === "quiz"
        ? [
            { label: "", correct: true, feedback: "" },
            { label: "", correct: false, feedback: "" },
          ]
        : [
            { label: "", correct: false, feedback: "" },
            { label: "", correct: false, feedback: "" },
          ],
    explanation: "",
    required: false,
    body: "",
    min: "1",
    max: "10",
    minLabel: "",
    maxLabel: "",
  };
}

function fromInteraction(i: Interaction): Draft {
  return {
    ...blank(i.type, i.atSeconds),
    id: i.id,
    prompt: i.prompt,
    xp: String(i.xp),
    options: i.options?.map((o) => ({ label: o.label, correct: !!o.correct, feedback: o.feedback ?? "" })) ?? blank(i.type, 0).options,
    explanation: i.explanation ?? "",
    required: i.required,
    body: i.body ?? "",
    min: String(i.scale?.min ?? 1),
    max: String(i.scale?.max ?? 10),
    minLabel: i.scale?.minLabel ?? "",
    maxLabel: i.scale?.maxLabel ?? "",
  };
}

function toInput(d: Draft): InteractionInput | string {
  const atSeconds = parseClock(d.at);
  if (atSeconds === null) return 'Write the time as "2:30"';
  const common = { id: d.id, atSeconds, prompt: d.prompt, xp: Number(d.xp) || 0 };
  switch (d.type) {
    case "quiz":
      return { ...common, type: "quiz", options: d.options.map((o) => ({ label: o.label, correct: o.correct, feedback: o.feedback || undefined })), explanation: d.explanation };
    case "poll":
      return { ...common, type: "poll", options: d.options.map((o) => ({ label: o.label })) };
    case "reflection":
      return { ...common, type: "reflection", required: d.required };
    case "insight":
      return { ...common, type: "insight", body: d.body };
    case "scale":
      return { ...common, type: "scale", min: Number(d.min), max: Number(d.max), minLabel: d.minLabel, maxLabel: d.maxLabel };
  }
}

export function CheckpointEditor({ lessonId, durationSeconds, interactions }: { lessonId: string; durationSeconds: number; interactions: Interaction[] }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [newType, setNewType] = useState<InteractionType>("quiz");
  const sorted = [...interactions].sort((a, b) => a.atSeconds - b.atSeconds);

  function startNew() {
    const last = sorted.at(-1)?.atSeconds ?? 0;
    const at = Math.min(durationSeconds - 1, Math.max(30, last + 60));
    setDraft(blank(newType, at));
  }

  return (
    <div className="space-y-6">
      {/* The video as a line, with a marker at every checkpoint. */}
      <div>
        <div className="relative h-10">
          <span aria-hidden className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line-strong" />
          {sorted.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setDraft(fromInteraction(i))}
              aria-label={`${interactionMeta[i.type].label} at ${formatClock(i.atSeconds)}: ${i.prompt}`}
              title={`${formatClock(i.atSeconds)} · ${i.prompt}`}
              className={cn(
                "absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-raised ring-2 transition-transform hover:scale-110",
                draft?.id === i.id ? "ring-accent" : "ring-line-strong",
              )}
              style={{ left: `${Math.min(100, (i.atSeconds / Math.max(1, durationSeconds)) * 100)}%` }}
            >
              <InteractionIcon type={i.type} size={14} className={i.required ? "text-accent-ink" : undefined} />
            </button>
          ))}
        </div>
        <div className="tabular mt-1 flex justify-between text-xs text-subtle">
          <span>0:00</span>
          <span>{formatClock(durationSeconds)}</span>
        </div>
      </div>

      <ul className="divide-y divide-line rounded-[1.2rem] ring-1 ring-line">
        {sorted.map((i) => (
          <li key={i.id}>
            <button type="button" onClick={() => setDraft(fromInteraction(i))} className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-fg/[0.03]", draft?.id === i.id && "bg-accent/5")}>
              <span className="tabular w-12 shrink-0 pt-0.5 font-mono text-xs text-subtle">{formatClock(i.atSeconds)}</span>
              <InteractionIcon type={i.type} className="pt-0.5" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{i.prompt}</span>
                <span className="text-xs text-subtle">
                  {interactionMeta[i.type].label} · {i.xp} XP{i.required ? " · required" : ""}
                </span>
              </span>
            </button>
          </li>
        ))}
        {!sorted.length ? <li className="px-4 py-4 text-sm text-muted">No checkpoints yet. Add the first one below.</li> : null}
      </ul>

      {draft ? (
        <CheckpointForm key={draft.id ?? `new-${draft.type}`} lessonId={lessonId} durationSeconds={durationSeconds} initial={draft} onDone={() => setDraft(null)} />
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="new-checkpoint-type">New checkpoint</Label>
            <Select id="new-checkpoint-type" value={newType} onChange={(e) => setNewType(e.target.value as InteractionType)}>
              {TYPES.map((t) => (
                <option key={t.type} value={t.type}>
                  {interactionMeta[t.type].label}: {t.hint}
                </option>
              ))}
            </Select>
          </div>
          <Button type="button" variant="secondary" onClick={startNew}>
            <Plus size={16} aria-hidden /> Add checkpoint
          </Button>
        </div>
      )}
    </div>
  );
}

function CheckpointForm({ lessonId, durationSeconds, initial, onDone }: { lessonId: string; durationSeconds: number; initial: Draft; onDone: () => void }) {
  const [d, setD] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, pending } = useAdminAction();
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }));
  const setOption = (i: number, patch: Partial<Draft["options"][number]>) =>
    setD((prev) => ({ ...prev, options: prev.options.map((o, j) => (j === i ? { ...o, ...patch } : patch.correct && prev.type === "quiz" ? { ...o, correct: false } : o)) }));
  const hint = TYPES.find((t) => t.type === d.type)?.hint;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const input = toInput(d);
    if (typeof input === "string") return setErrors({ atSeconds: input });
    run(() => saveInteraction(lessonId, input)).then((r) => {
      if (r.ok) onDone();
      else setErrors(r.errors ?? {});
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-[1.4rem] bg-sunken/60 p-5 ring-1 ring-line sm:p-6" aria-label={d.id ? "Edit checkpoint" : "New checkpoint"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-semibold">
            <InteractionIcon type={d.type} className="text-accent-ink" /> {d.id ? "Edit" : "New"} {interactionMeta[d.type].label.toLowerCase()}
          </p>
          <p className="mt-1 text-xs text-subtle">{hint}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={onDone}>
          <X size={16} aria-hidden />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[8rem_1fr_6rem]">
        <div>
          <Label htmlFor="cp-at">At</Label>
          <Input id="cp-at" value={d.at} onChange={(e) => set("at", e.target.value)} placeholder="2:30" className="font-mono" aria-describedby="cp-at-hint" />
          <p id="cp-at-hint" className="mt-1.5 text-xs text-subtle">
            Before {formatClock(durationSeconds)}
          </p>
          <FieldError message={errors.atSeconds} />
        </div>
        <div>
          <Label htmlFor="cp-prompt">{d.type === "insight" ? "Heading" : "Question or prompt"}</Label>
          <Input id="cp-prompt" value={d.prompt} onChange={(e) => set("prompt", e.target.value)} />
          <FieldError message={errors.prompt} />
        </div>
        <div>
          <Label htmlFor="cp-xp">XP</Label>
          <Input id="cp-xp" type="number" min={0} max={500} value={d.xp} onChange={(e) => set("xp", e.target.value)} />
        </div>
      </div>

      {d.type === "quiz" || d.type === "poll" ? (
        <fieldset className="space-y-2.5">
          <legend className="mb-2 text-[0.8125rem] font-medium">{d.type === "quiz" ? "Answers (mark the correct one)" : "Choices"}</legend>
          {d.options.map((o, i) => (
            <div key={i} className="grid gap-2 rounded-[1rem] bg-raised p-3 ring-1 ring-line sm:grid-cols-[auto_1fr_auto]">
              {d.type === "quiz" ? (
                <label className="flex items-center gap-2 text-xs text-muted">
                  <input type="radio" name="cp-correct" checked={o.correct} onChange={() => setOption(i, { correct: true })} className="h-4 w-4 accent-[var(--accent)]" aria-label={`Answer ${i + 1} is correct`} />
                  Correct
                </label>
              ) : (
                <span className="tabular self-center text-xs text-subtle">{i + 1}</span>
              )}
              <div className="space-y-2">
                <Input aria-label={`${d.type === "quiz" ? "Answer" : "Choice"} ${i + 1}`} value={o.label} onChange={(e) => setOption(i, { label: e.target.value })} className="h-11" />
                {d.type === "quiz" ? <Input aria-label={`Feedback for answer ${i + 1} (optional)`} placeholder="Feedback when chosen (optional)" value={o.feedback} onChange={(e) => setOption(i, { feedback: e.target.value })} className="h-10 text-sm" /> : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 self-start"
                disabled={d.options.length <= 2}
                aria-label={`Remove ${d.type === "quiz" ? "answer" : "choice"} ${i + 1}`}
                onClick={() => setD((prev) => {
                  const options = prev.options.filter((_, j) => j !== i);
                  if (prev.type === "quiz" && !options.some((x) => x.correct)) options[0] = { ...options[0], correct: true };
                  return { ...prev, options };
                })}
              >
                <Trash size={15} aria-hidden />
              </Button>
            </div>
          ))}
          {d.options.length < 6 ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setD((prev) => ({ ...prev, options: [...prev.options, { label: "", correct: false, feedback: "" }] }))}>
              <Plus size={14} aria-hidden /> Add {d.type === "quiz" ? "answer" : "choice"}
            </Button>
          ) : null}
          <FieldError message={errors.options} />
        </fieldset>
      ) : null}

      {d.type === "quiz" ? (
        <div>
          <Label htmlFor="cp-explanation">Explanation after answering</Label>
          <Textarea id="cp-explanation" rows={3} value={d.explanation} onChange={(e) => set("explanation", e.target.value)} className="min-h-24" />
        </div>
      ) : null}
      {d.type === "reflection" ? (
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={d.required} onChange={(e) => set("required", e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" /> Required to finish the lesson
        </label>
      ) : null}
      {d.type === "insight" ? (
        <div>
          <Label htmlFor="cp-body">The insight</Label>
          <Textarea id="cp-body" rows={4} value={d.body} onChange={(e) => set("body", e.target.value)} className="min-h-28" />
          <FieldError message={errors.body} />
        </div>
      ) : null}
      {d.type === "scale" ? (
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="cp-min">From</Label>
            <Input id="cp-min" type="number" min={0} max={10} value={d.min} onChange={(e) => set("min", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cp-max">To</Label>
            <Input id="cp-max" type="number" min={1} max={10} value={d.max} onChange={(e) => set("max", e.target.value)} />
            <FieldError message={errors.max} />
          </div>
          <div>
            <Label htmlFor="cp-min-label">Low label</Label>
            <Input id="cp-min-label" value={d.minLabel} onChange={(e) => set("minLabel", e.target.value)} placeholder="Not at all" />
            <FieldError message={errors.minLabel} />
          </div>
          <div>
            <Label htmlFor="cp-max-label">High label</Label>
            <Input id="cp-max-label" value={d.maxLabel} onChange={(e) => set("maxLabel", e.target.value)} placeholder="Completely" />
            <FieldError message={errors.maxLabel} />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button type="submit" loading={pending}>
            {d.id ? "Save checkpoint" : "Add checkpoint"}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
        {d.id ? (
          <ConfirmButton
            variant="danger"
            size="sm"
            title="Delete this checkpoint?"
            body="Learners' answers to it are deleted too."
            confirmLabel="Delete checkpoint"
            onConfirm={() => run(() => deleteInteraction(lessonId, d.id!)).then((r) => r.ok && onDone())}
          >
            <Trash size={15} aria-hidden /> Delete
          </ConfirmButton>
        ) : null}
      </div>
    </form>
  );
}
