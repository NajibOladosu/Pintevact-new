"use client";

import Link from "next/link";
import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check, X } from "@/components/icons";
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
    <div className="w-full rounded-[1.6rem] bg-raised p-2 text-fg shadow-frame ring-1 ring-line">
      <div className="relative [perspective:1400px]" key={index} data-testid="hero-deck">
        <div
          className={cn("grid transition-transform duration-700 ease-[var(--ease-out-expo)] [transform-style:preserve-3d]", !reduce && index > 0 && !flipped && "animate-enter")}
          style={{ transform: flipped && !reduce ? "rotateY(180deg)" : "none" }}
        >
          {/* Front */}
          <div className={cn("flex flex-col rounded-[1.2rem] p-5 [grid-area:1/1] [backface-visibility:hidden] sm:p-6", flipped && reduce && "invisible")} aria-hidden={flipped}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="eyebrow text-muted">Try a {card.kind.toLowerCase()}</span>
                <p className="mt-2 text-[0.8125rem] text-muted">From The Elephant and the Rider</p>
              </div>
              <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                <ArrowUpRight size={18} />
              </span>
            </div>
            <p className="mt-4 text-lg font-semibold leading-snug tracking-[-0.025em] sm:text-[1.3rem]">{card.prompt}</p>
            {card.kind === "Reflection" ? (
              <div className="mt-5">
                <div className="rounded-[0.85rem] border border-dashed border-line-strong px-4 py-5 text-sm text-muted">Your answer stays private to you.</div>
                <button type="button" onClick={() => answer(0)} className="mt-3 flex h-12 w-full items-center justify-between rounded-[0.9rem] bg-fg px-5 text-[0.8125rem] font-semibold text-bg transition-colors hover:bg-fg/85">
                  See what happens to it <ArrowUpRight size={15} aria-hidden />
                </button>
              </div>
            ) : (
              <div className="mt-5 grid gap-2">
                {card.options.map((o, i) => (
                  <button
                    key={o.label}
                    type="button"
                    tabIndex={flipped ? -1 : 0}
                    onClick={() => answer(i)}
                    className="flex items-center justify-between rounded-[0.85rem] border border-line px-4 py-3 text-left text-[0.9375rem] font-medium transition-colors hover:border-accent hover:bg-accent/[0.05]"
                  >
                    {o.label}
                    <ArrowRight size={15} className="text-muted" aria-hidden />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-[0.78rem] text-muted">
              <span className="flex gap-1.5" aria-hidden>
                {cards.map((c, i) => (
                  <span key={c.kind} className={cn("h-1.5 rounded-full transition-all", i < index ? "w-4 bg-accent" : i === index ? "w-8 bg-accent" : "w-4 bg-fg/15")} />
                ))}
              </span>
              <span>
                Card {index + 1} of {cards.length}
              </span>
            </div>
          </div>

          {/* Back */}
          <div
            className={cn("flex flex-col rounded-[1.2rem] bg-violet p-6 text-on-violet [grid-area:1/1] [backface-visibility:hidden]", !reduce && "[transform:rotateY(180deg)]", !flipped && "invisible")}
            aria-hidden={!flipped}
            aria-live="polite"
          >
            {verdict ? (
              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                {verdict === "right" ? <Check size={16} weight="bold" /> : <X size={16} weight="bold" />}
                {verdict === "right" ? "Right. Your slow system stepped in." : "Not quite, and that's the point."}
              </p>
            ) : (
              <p className="text-sm font-semibold">{chosen ? `You picked: ${chosen.label}` : "Saved to your vault"}</p>
            )}
            <p className="mt-3 text-lg leading-relaxed text-on-violet-muted">{card.back}</p>
            <div className="mt-auto flex items-center justify-between gap-4 pt-8">
              <span className="text-[0.78rem] text-on-violet-muted">
                Card {index + 1} of {cards.length}
              </span>
              {last ? (
                <Link href="/signup?next=/learn/meet-your-mind" className={buttonClasses({ variant: "primary", size: "sm" })} tabIndex={flipped ? 0 : -1}>
                  Start free
                </Link>
              ) : (
                <button type="button" onClick={next} tabIndex={flipped ? 0 : -1} className="inline-flex h-10 items-center gap-2 rounded-full bg-on-violet px-4 text-[0.8125rem] font-semibold text-violet transition-opacity hover:opacity-90">
                  Next card <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
