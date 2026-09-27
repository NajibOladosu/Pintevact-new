"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, RotateCcw } from "@/components/icons";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { archetypes, quiz, scoreQuiz, type Archetype } from "@/content/mind-quiz";

export function MindQuiz({ courseTitles }: { courseTitles: Record<string, string> }) {
  const [picks, setPicks] = useState<Archetype[]>([]);
  const step = picks.length;
  const done = step >= quiz.length;
  const steps = (
    <div className="flex gap-1.5" aria-hidden>
      {quiz.map((q, i) => (
        <span key={q.id} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", i < step ? "bg-accent" : i === step ? "bg-accent/40" : "bg-fg/10")} />
      ))}
    </div>
  );

  if (done) {
    const { winner, scores } = scoreQuiz(picks);
    const a = archetypes[winner];
    const ranked = (Object.keys(scores) as Archetype[]).sort((x, y) => scores[y] - scores[x]);
    return (
      <div className="animate-enter">
        {steps}
        <div className="mt-8 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[2rem] bg-violet p-8 text-on-violet sm:p-12">
            <p className="eyebrow text-on-violet-muted">Your learning archetype</p>
            <h2 className="h-section mt-5">{a.name}</h2>
            <p className="mt-4 text-lg">{a.tagline}</p>
            <p className="mt-4 leading-relaxed text-on-violet-muted">{a.description}</p>
            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="eyebrow text-on-violet-muted">Strengths</dt>
                <dd className="mt-2.5">{a.strengths.join(", ")}</dd>
              </div>
              <div>
                <dt className="eyebrow text-on-violet-muted">Watch out for</dt>
                <dd className="mt-2.5">{a.blindSpot}</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col rounded-[2rem] bg-raised p-8 ring-1 ring-line sm:p-10">
            <p className="eyebrow text-muted">Recommended course</p>
            <p className="mt-4 text-[1.9rem] font-semibold leading-tight tracking-[-0.04em]">{courseTitles[a.courseSlug] ?? "Explore courses"}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={`/courses/${a.courseSlug}`} className={buttonClasses({})}>
                See the course <ArrowUpRight size={15} aria-hidden className="arrow-nudge" />
              </Link>
              <Link href="/signup?next=/learn/meet-your-mind" className={buttonClasses({ variant: "outline" })}>
                Start free
              </Link>
            </div>
            <p className="eyebrow mt-10 text-muted">Your answers</p>
            <ul className="tabular mt-4 space-y-2 text-sm">
              {ranked.map((k) => (
                <li key={k} className="flex justify-between">
                  <span>{archetypes[k].name}</span>
                  <span className="text-muted">
                    {scores[k]} of {picks.length}
                  </span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setPicks([])} className="mt-auto inline-flex items-center gap-2 self-start pt-8 text-sm font-medium text-muted hover:text-fg">
              <RotateCcw size={16} /> Take it again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = quiz[step];
  return (
    <div>
      {steps}
      <div className="mt-6 flex items-center justify-between text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-muted">
        <span className="tabular">
          Question {step + 1} of {quiz.length}
        </span>
        {step > 0 ? (
          <button type="button" onClick={() => setPicks((p) => p.slice(0, -1))} className="inline-flex items-center gap-1.5 hover:text-fg">
            <ArrowLeft size={14} /> Back
          </button>
        ) : null}
      </div>
      <div key={q.id} className="mt-5 animate-enter rounded-[2rem] bg-raised p-7 shadow-card ring-1 ring-line sm:p-12">
        <h2 className="h-sub max-w-[26ch]">{q.prompt}</h2>
        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          {q.answers.map((ans) => (
            <button
              key={ans.label}
              type="button"
              onClick={() => setPicks((p) => [...p, ans.archetype])}
              data-testid="quiz-answer"
              className="group flex items-center justify-between gap-4 rounded-[0.9rem] border border-line px-5 py-4 text-left font-medium transition-colors hover:border-accent hover:bg-accent/[0.05]"
            >
              {ans.label}
              <ArrowRight size={16} className="shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
