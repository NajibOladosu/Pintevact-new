"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check, Lock, Sparkles, X } from "lucide-react";
import { interactionMeta } from "@/components/course/interaction-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Interaction, InteractionResponse } from "@/lib/types";
import type { ResponseResult } from "@/lib/lesson-service";

export type SubmitPayload = { optionId?: string; text?: string; value?: number; acknowledged?: boolean };

type Props = {
  interaction: Interaction;
  previous?: InteractionResponse["response"] | null;
  onSubmit: (payload: SubmitPayload) => Promise<ResponseResult>;
  onContinue: () => void;
  onDismiss?: () => void;
};

/** The card that appears over the video when a checkpoint is reached. */
export function InteractionCard({ interaction, previous, onSubmit, onContinue, onDismiss }: Props) {
  const meta = interactionMeta[interaction.type];
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ResponseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [optionId, setOptionId] = useState<string | undefined>(previous?.optionId);
  const [text, setText] = useState(previous?.text ?? "");
  const [value, setValue] = useState<number>(previous?.value ?? Math.round(((interaction.scale?.min ?? 1) + (interaction.scale?.max ?? 10)) / 2));

  const answered = Boolean(result?.ok);
  const submit = (payload: SubmitPayload) => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await onSubmit(payload);
        if (!res.ok) setError(res.error ?? "Something went wrong.");
        else setResult(res);
      } catch {
        setError("Couldn't save — check your connection and try again.");
      }
    });
  };

  const totalVotes = result?.pollResults ? Object.values(result.pollResults).reduce((a, b) => a + b, 0) : 0;
  const chosen = interaction.options?.find((o) => o.id === optionId);

  return (
    <div role="dialog" aria-modal="false" aria-labelledby={`int-${interaction.id}`} className="w-full max-w-xl animate-rise rounded-[1.75rem] border-2 border-ink bg-paper p-5 text-ink shadow-hard-lg sm:p-6" data-testid="interaction-card">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow inline-flex items-center gap-2">
          <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full border border-ink", meta.color)}>
            <meta.icon size={13} aria-hidden />
          </span>
          {meta.label}
          {interaction.required ? <span className="rounded-full bg-ink px-2 py-0.5 text-[0.6rem] text-paper">Required</span> : null}
        </p>
        {onDismiss && !interaction.required ? (
          <button type="button" onClick={onDismiss} aria-label="Skip for now" className="rounded-full p-1.5 text-ink-3 hover:bg-ink/5 hover:text-ink">
            <X size={18} />
          </button>
        ) : null}
      </div>

      <h3 id={`int-${interaction.id}`} className="mt-2 text-balance text-xl leading-snug sm:text-2xl">
        {interaction.prompt}
      </h3>

      {/* Quiz & poll */}
      {(interaction.type === "quiz" || interaction.type === "poll") && interaction.options ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {interaction.options.map((o, i) => {
            const isChosen = optionId === o.id;
            const votes = result?.pollResults?.[o.id] ?? 0;
            const pct = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
            const showQuiz = answered && interaction.type === "quiz";
            return (
              <button
                key={o.id}
                type="button"
                disabled={answered || pending}
                aria-pressed={isChosen}
                onClick={() => {
                  setOptionId(o.id);
                  submit({ optionId: o.id });
                }}
                className={cn(
                  "relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 border-ink px-3 py-2.5 text-left text-[0.95rem] font-semibold leading-snug transition",
                  !answered && "bg-white hover:-translate-y-0.5 hover:bg-lucid hover:shadow-hard",
                  showQuiz && o.correct && "bg-lucid",
                  showQuiz && isChosen && !o.correct && "bg-ember",
                  answered && interaction.type === "poll" && "bg-white",
                )}
              >
                {answered && interaction.type === "poll" ? <span className="absolute inset-y-0 left-0 bg-iris/30 transition-all duration-700" style={{ width: `${pct}%` }} /> : null}
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper font-mono text-xs">
                  {showQuiz && o.correct ? <Check size={14} /> : showQuiz && isChosen ? <X size={14} /> : "ABCDEF"[i]}
                </span>
                <span className="relative flex-1">{o.label}</span>
                {answered && interaction.type === "poll" ? <span className="relative font-mono text-sm">{pct}%</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Reflection */}
      {interaction.type === "reflection" ? (
        <div className="mt-5">
          <label htmlFor={`reflect-${interaction.id}`} className="sr-only">
            Your reflection
          </label>
          <textarea
            id={`reflect-${interaction.id}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={answered}
            rows={3}
            maxLength={5000}
            placeholder="Write freely. Only you can see this."
            className="w-full resize-none rounded-2xl border-2 border-ink bg-white p-4 leading-relaxed focus:outline-none focus:ring-4 focus:ring-lucid/60 disabled:opacity-80"
          />
          <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-ink-3">
            <Lock size={12} /> Private · saved to your Reflection Vault
          </p>
        </div>
      ) : null}

      {/* Scale */}
      {interaction.type === "scale" && interaction.scale ? (
        <div className="mt-6">
          <div className="flex items-end justify-center">
            <span className="font-display text-6xl">{value}</span>
          </div>
          <input
            type="range"
            min={interaction.scale.min}
            max={interaction.scale.max}
            value={value}
            disabled={answered}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label={interaction.prompt}
            className="mt-2 w-full accent-[var(--color-ember)]"
          />
          <div className="flex justify-between font-mono text-xs text-ink-3">
            <span>{interaction.scale.minLabel}</span>
            <span>{interaction.scale.maxLabel}</span>
          </div>
        </div>
      ) : null}

      {/* Insight */}
      {interaction.type === "insight" ? <p className="mt-4 text-lg leading-relaxed text-ink-2">{interaction.body}</p> : null}

      {/* Feedback */}
      {answered && interaction.type === "quiz" ? (
        <div className={cn("mt-3 rounded-2xl p-3 text-sm", result?.isCorrect ? "bg-lucid/40" : "bg-ember/20")} role="status">
          <p className="font-semibold">{result?.isCorrect ? "Spot on." : "Not quite — and that's the point."}</p>
          {chosen?.feedback ? <p className="mt-1 text-ink-2">{chosen.feedback}</p> : null}
          {interaction.explanation ? <p className="mt-1 text-ink-2">{interaction.explanation}</p> : null}
        </div>
      ) : null}
      {answered && interaction.type === "poll" ? (
        <p className="mt-3 text-sm text-ink-3" role="status">
          {totalVotes.toLocaleString()} learners have answered.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-ember">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {answered ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-iris px-3 py-1 font-mono text-xs font-semibold text-white" role="status">
            <Sparkles size={12} /> {result?.xpAwarded ? `+${result.xpAwarded} XP` : "Saved"}
          </span>
        ) : (
          <span />
        )}
        {answered ? (
          <Button onClick={onContinue} variant="ink" autoFocus>
            Continue <ArrowRight size={16} />
          </Button>
        ) : interaction.type === "reflection" ? (
          <Button onClick={() => submit({ text })} loading={pending} disabled={text.trim().length < 3}>
            Save reflection
          </Button>
        ) : interaction.type === "scale" ? (
          <Button onClick={() => submit({ value })} loading={pending}>
            Lock in {value}
          </Button>
        ) : interaction.type === "insight" ? (
          <Button onClick={() => submit({ acknowledged: true })} loading={pending}>
            Got it
          </Button>
        ) : pending ? (
          <span className="text-sm text-ink-3">Checking…</span>
        ) : null}
      </div>
    </div>
  );
}
