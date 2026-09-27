"use client";

import Link from "next/link";
import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowRight, Check, X } from "@/components/icons";
import { StationLine } from "@/components/brand/station-line";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DeckCard =
  | { kind: "Checkpoint"; prompt: string; options: { label: string; correct?: boolean }[]; back: string }
  | { kind: "Poll"; prompt: string; options: { label: string }[]; back: string }
  | { kind: "Reflection"; prompt: string; back: string };

// Real checkpoints from "The Elephant and the Rider", lesson 1 of the free course.
const cards: DeckCard[] = [
  {
    kind: "Checkpoint",
    prompt: "A bat and a ball cost $1.10. The bat costs $1.00 more than the ball. How much is the ball?",
    options: [{ label: "10 cents" }, { label: "5 cents", correct: true }, { label: "15 cents" }],
    back: "Most people say 10 cents first. That quick answer is your fast, intuitive system talking. The slow one checks: $0.05 + $1.05 = $1.10.",
  },
  {
    kind: "Poll",
    prompt: "Right now, which one feels more in charge of your life?",
    options: [{ label: "My feelings and impulses" }, { label: "My plans and logic" }, { label: "They take turns" }],
    back: "In the lesson you would now see how other learners answered, then learn why the elephant usually wins.",
  },
  {
    kind: "Reflection",
    prompt: "Describe a recent moment where your feelings overpowered your plans. What happened just before?",
    back: "Reflections stay private. They collect in your vault, so you can spot your own patterns over time.",
  },
];

export function HeroDeck() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];
  const last = index === cards.length - 1;
  const stations = [
    { id: "start", label: "Start", state: "done" as const },
    ...cards.map((c, i) => ({
      id: String(i),
      label: c.kind,
      state: i < index || (i === index && flipped) ? ("done" as const) : i === index ? ("current" as const) : ("ahead" as const),
    })),
  ];

  const answer = (i: number) => {
    if (flipped) return;
    setPicked(i);
    setFlipped(true);
  };
  const next = () => {
    setFlipped(false);
    setPicked(null);
    setIndex((n) => Math.min(n + 1, cards.length - 1));
  };

  const chosen = card.kind !== "Reflection" && picked !== null ? card.options[picked] : null;
  const verdict = card.kind === "Checkpoint" && chosen ? ("correct" in chosen && chosen.correct ? "right" : "wrong") : null;

  return (
    <div className="w-full">
      <StationLine stations={stations} showLabels className="mb-6 sm:mb-8" />
      <div className="relative">
        {/* Edges of the cards waiting underneath */}
        <div aria-hidden className="absolute inset-x-6 -bottom-3 h-full rounded-2xl bg-violet" />
        <div aria-hidden className="absolute inset-x-3 -bottom-1.5 h-full rounded-2xl border border-line bg-raised/80" />

        <div className="relative [perspective:1400px]" key={index} data-testid="hero-deck">
          <div
            className={cn("grid transition-transform duration-700 ease-[var(--ease-out-expo)] [transform-style:preserve-3d]", !reduce && index > 0 && !flipped && "animate-enter")}
            style={{ transform: flipped && !reduce ? "rotateY(180deg)" : "none" }}
          >
            {/* Front */}
            <div
              className={cn("rounded-2xl border border-line bg-raised p-5 [grid-area:1/1] [backface-visibility:hidden] sm:p-8", flipped && reduce && "invisible")}
              aria-hidden={flipped}
            >
              <p className="text-sm text-subtle">
                <span className="font-medium text-fg">{card.kind}</span>, from The Elephant and the Rider
              </p>
              <p className="mt-2 text-lg font-semibold leading-snug tracking-tight sm:mt-3 sm:text-2xl">{card.prompt}</p>
              {card.kind === "Reflection" ? (
                <div className="mt-6">
                  <div className="rounded-[10px] border border-dashed border-line-strong px-4 py-6 text-sm text-subtle">Your answer stays private to you.</div>
                  <button type="button" onClick={() => answer(0)} className={buttonClasses({ variant: "outline", className: "mt-4 w-full" })}>
                    See what happens to it
                  </button>
                </div>
              ) : (
                <div className="mt-4 grid gap-2 sm:mt-6">
                  {card.options.map((o, i) => (
                    <button
                      key={o.label}
                      type="button"
                      tabIndex={flipped ? -1 : 0}
                      onClick={() => answer(i)}
                      className="flex items-center justify-between rounded-[10px] border border-line-strong px-4 py-2.5 text-left font-medium sm:py-3 transition-colors hover:border-fg hover:bg-fg/[0.03]"
                    >
                      {o.label}
                      <ArrowRight size={16} className="text-subtle" aria-hidden />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Back */}
            <div
              className={cn("flex flex-col rounded-2xl bg-violet p-6 text-on-violet [grid-area:1/1] [backface-visibility:hidden] sm:p-8", !reduce && "[transform:rotateY(180deg)]", !flipped && "invisible")}
              aria-hidden={!flipped}
              aria-live="polite"
            >
              {verdict ? (
                <p className="inline-flex items-center gap-2 text-sm font-medium">
                  {verdict === "right" ? <Check size={16} weight="bold" /> : <X size={16} weight="bold" />}
                  {verdict === "right" ? "Right. Your slow system stepped in." : "Not quite, and that's the point."}
                </p>
              ) : (
                <p className="text-sm font-medium">{chosen ? `You picked: ${chosen.label}` : "Saved to your vault"}</p>
              )}
              <p className="mt-3 text-lg leading-relaxed text-on-violet-muted">{card.back}</p>
              <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                <span className="text-sm text-on-violet-muted">
                  Card {index + 1} of {cards.length}
                </span>
                {last ? (
                  <Link href="/signup?next=/learn/meet-your-mind" className={buttonClasses({ variant: "primary", size: "sm" })} tabIndex={flipped ? 0 : -1}>
                    Start free
                  </Link>
                ) : (
                  <button type="button" onClick={next} tabIndex={flipped ? 0 : -1} className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-on-violet px-3.5 text-sm font-medium text-violet transition-opacity hover:opacity-90">
                    Next card <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
