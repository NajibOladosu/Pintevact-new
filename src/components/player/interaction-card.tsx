"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, Check, Lock, X } from "@/components/icons";
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

/**
 * A checkpoint card. The front asks; once answered the card flips to its violet back,
 * which carries the feedback, the XP and the way forward.
 */
export function InteractionCard({ interaction, previous, onSubmit, onContinue, onDismiss }: Props) {
  const meta = interactionMeta[interaction.type];
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ResponseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [optionId, setOptionId] = useState<string | undefined>(previous?.optionId);
  const [text, setText] = useState(previous?.text ?? "");
  const [value, setValue] = useState<number>(previous?.value ?? Math.round(((interaction.scale?.min ?? 1) + (interaction.scale?.max ?? 10)) / 2));

  const answered = Boolean(result?.ok);
  const continueRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // Move focus to the way forward without scrolling the page under the overlay.
    if (answered) continueRef.current?.focus({ preventScroll: true });
  }, [answered]);
  const submit = (payload: SubmitPayload) => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await onSubmit(payload);
        if (!res.ok) setError(res.error ?? "Something went wrong.");
        else setResult(res);
      } catch {
        setError("Couldn't save. Check your connection and try again.");
      }
    });
  };

  const totalVotes = result?.pollResults ? Object.values(result.pollResults).reduce((a, b) => a + b, 0) : 0;
  const chosen = interaction.options?.find((o) => o.id === optionId);

  return (
    <div
      key={answered ? "back" : "front"}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`int-${interaction.id}`}
      className={cn("w-full max-w-xl rounded-[1.6rem] p-5 sm:p-7", answered ? "animate-flip bg-violet text-on-violet" : "animate-enter bg-raised ring-1 ring-line text-fg")}
      data-testid="interaction-card"
    >
      <div className="flex items-center justify-between gap-3">
        <p className={cn("inline-flex items-center gap-2 text-sm", answered ? "text-on-violet-muted" : "text-subtle")}>
          <meta.icon size={16} aria-hidden />
          <span className={answered ? "text-on-violet" : "font-medium text-fg"}>{meta.label}</span>
          {interaction.required ? <span>, required</span> : null}
        </p>
        {onDismiss && !interaction.required && !answered ? (
          <button type="button" onClick={onDismiss} aria-label="Skip for now" className="rounded-lg p-1.5 text-subtle hover:bg-fg/5 hover:text-fg">
            <X size={18} />
          </button>
        ) : null}
      </div>

      <h3 id={`int-${interaction.id}`} className="mt-3 text-balance text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
        {interaction.prompt}
      </h3>

      {/* Quiz & poll */}
      {(interaction.type === "quiz" || interaction.type === "poll") && interaction.options ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {interaction.options.map((o, i) => {
            const isChosen = optionId === o.id;
            const votes = result?.pollResults?.[o.id] ?? 0;
            const pct = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
            const isQuizBack = answered && interaction.type === "quiz";
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
                  "relative flex items-center gap-3 overflow-hidden rounded-[0.85rem] px-3.5 py-3 text-left text-[0.95rem] font-medium leading-snug transition-colors",
                  !answered && "border border-line-strong hover:border-fg hover:bg-fg/[0.03]",
                  answered && "border border-on-violet/20",
                  isQuizBack && o.correct && "border-on-violet bg-on-violet text-violet",
                  isQuizBack && isChosen && !o.correct && "line-through decoration-on-violet/60",
                )}
              >
                {answered && interaction.type === "poll" ? <span aria-hidden className="absolute inset-y-0 left-0 bg-on-violet/15 transition-[width] duration-700" style={{ width: `${pct}%` }} /> : null}
                <span className="tabular relative w-4 shrink-0 text-xs opacity-60">
                  {isQuizBack && o.correct ? <Check size={14} weight="bold" /> : isQuizBack && isChosen ? <X size={14} weight="bold" /> : "ABCDEF"[i]}
                </span>
                <span className="relative flex-1">{o.label}</span>
                {answered && interaction.type === "poll" ? <span className="tabular relative text-sm">{pct}%</span> : null}
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
            className={cn(
              "w-full resize-none rounded-[0.85rem] p-3.5 leading-relaxed focus:outline-none focus-visible:outline-none",
              answered ? "bg-on-violet/10 text-on-violet" : "border border-line-strong bg-bg focus:border-accent",
            )}
          />
          <p className={cn("mt-1.5 flex items-center gap-1.5 text-xs", answered ? "text-on-violet-muted" : "text-subtle")}>
            <Lock size={12} /> Private, saved to your reflection vault
          </p>
        </div>
      ) : null}

      {/* Scale */}
      {interaction.type === "scale" && interaction.scale ? (
        <div className="mt-6">
          <p className="tabular text-center text-5xl font-semibold tracking-tight">{value}</p>
          <input
            type="range"
            min={interaction.scale.min}
            max={interaction.scale.max}
            value={value}
            disabled={answered}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label={interaction.prompt}
            className="mt-3 w-full accent-[var(--accent)]"
          />
          <div className={cn("flex justify-between text-xs", answered ? "text-on-violet-muted" : "text-subtle")}>
            <span>{interaction.scale.minLabel}</span>
            <span>{interaction.scale.maxLabel}</span>
          </div>
        </div>
      ) : null}

      {/* Insight */}
      {interaction.type === "insight" ? <p className={cn("mt-4 text-lg leading-relaxed", answered ? "text-on-violet-muted" : "text-muted")}>{interaction.body}</p> : null}

      {/* Feedback on the back */}
      {answered && interaction.type === "quiz" ? (
        <div className="mt-5 space-y-1.5" role="status">
          <p className="font-semibold">{result?.isCorrect ? "Spot on." : "Not quite, and that's the point."}</p>
          {chosen?.feedback ? <p className="text-on-violet-muted">{chosen.feedback}</p> : null}
          {interaction.explanation ? <p className="text-on-violet-muted">{interaction.explanation}</p> : null}
        </div>
      ) : null}
      {answered && interaction.type === "poll" ? (
        <p className="tabular mt-3 text-sm text-on-violet-muted" role="status">
          {totalVotes.toLocaleString()} learners have answered.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {answered ? (
          <span className="tabular text-sm font-medium" role="status">
            {result?.xpAwarded ? `+${result.xpAwarded} XP` : "Saved"}
          </span>
        ) : (
          <span />
        )}
        {answered ? (
          <button ref={continueRef} type="button" onClick={onContinue} className="inline-flex h-10 items-center gap-2 rounded-[0.85rem] bg-on-violet px-4 text-sm font-medium text-violet transition-opacity hover:opacity-90">
            Continue <ArrowRight size={14} />
          </button>
        ) : interaction.type === "reflection" ? (
          <Button onClick={() => submit({ text })} loading={pending} disabled={text.trim().length < 3} variant="secondary">
            Save reflection
          </Button>
        ) : interaction.type === "scale" ? (
          <Button onClick={() => submit({ value })} loading={pending} variant="secondary">
            Lock in {value}
          </Button>
        ) : interaction.type === "insight" ? (
          <Button onClick={() => submit({ acknowledged: true })} loading={pending} variant="secondary">
            Got it
          </Button>
        ) : pending ? (
          <span className="text-sm text-subtle">Checking</span>
        ) : null}
      </div>
    </div>
  );
}
