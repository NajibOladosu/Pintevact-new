"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "@/components/icons";
import { StationLine } from "@/components/brand/station-line";
import { buttonClasses } from "@/components/ui/button";
import { archetypes, quiz, scoreQuiz, type Archetype } from "@/content/mind-quiz";

export function MindQuiz({ courseTitles }: { courseTitles: Record<string, string> }) {
  const [picks, setPicks] = useState<Archetype[]>([]);
  const step = picks.length;
  const done = step >= quiz.length;
  const stations = quiz.map((q, i) => ({ id: q.id, state: i < step ? ("done" as const) : i === step ? ("current" as const) : ("ahead" as const) }));

  if (done) {
    const { winner, scores } = scoreQuiz(picks);
    const a = archetypes[winner];
    const ranked = (Object.keys(scores) as Archetype[]).sort((x, y) => scores[y] - scores[x]);
    return (
      <div className="animate-enter">
        <StationLine stations={stations} />
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl bg-violet p-7 text-on-violet sm:p-10">
            <p className="text-sm text-on-violet-muted">Your learning archetype</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{a.name}</h2>
            <p className="mt-4 text-lg">{a.tagline}</p>
            <p className="mt-4 leading-relaxed text-on-violet-muted">{a.description}</p>
            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-on-violet-muted">Strengths</dt>
                <dd className="mt-1">{a.strengths.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-sm text-on-violet-muted">Watch out for</dt>
                <dd className="mt-1">{a.blindSpot}</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col rounded-2xl border border-line bg-raised p-7 sm:p-8">
            <p className="text-sm text-subtle">Recommended course</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{courseTitles[a.courseSlug] ?? "Explore courses"}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={`/courses/${a.courseSlug}`} className={buttonClasses({ variant: "secondary" })}>
                See the course
              </Link>
              <Link href="/signup?next=/learn/meet-your-mind" className={buttonClasses({ variant: "outline" })}>
                Start free
              </Link>
            </div>
            <p className="mt-8 text-sm text-subtle">Your answers</p>
            <ul className="tabular mt-2 space-y-1.5 text-sm">
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
      <StationLine stations={stations} />
      <div className="mt-6 flex items-center justify-between text-sm text-subtle">
        <span className="tabular">
          Question {step + 1} of {quiz.length}
        </span>
        {step > 0 ? (
          <button type="button" onClick={() => setPicks((p) => p.slice(0, -1))} className="inline-flex items-center gap-1.5 hover:text-fg">
            <ArrowLeft size={14} /> Back
          </button>
        ) : null}
      </div>
      <div key={q.id} className="mt-4 animate-enter rounded-2xl border border-line bg-raised p-6 sm:p-10">
        <h2 className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">{q.prompt}</h2>
        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          {q.answers.map((ans) => (
            <button
              key={ans.label}
              type="button"
              onClick={() => setPicks((p) => [...p, ans.archetype])}
              data-testid="quiz-answer"
              className="group flex items-center justify-between gap-4 rounded-[10px] border border-line-strong px-4 py-3.5 text-left font-medium transition-colors hover:border-fg hover:bg-fg/[0.03]"
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
