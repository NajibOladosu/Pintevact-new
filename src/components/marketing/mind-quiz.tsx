"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { archetypes, quiz, scoreQuiz, type Archetype } from "@/content/mind-quiz";
import { themeClasses } from "@/lib/course";
import { cn } from "@/lib/utils";

export function MindQuiz({ courseTitles }: { courseTitles: Record<string, string> }) {
  const [picks, setPicks] = useState<Archetype[]>([]);
  const step = picks.length;
  const done = step >= quiz.length;

  if (done) {
    const { winner, scores } = scoreQuiz(picks);
    const a = archetypes[winner];
    const total = picks.length;
    return (
      <div className="animate-rise overflow-hidden rounded-[2rem] border-2 border-ink bg-paper shadow-hard-lg">
        <div className={cn("border-b-2 border-ink p-8 sm:p-12", themeClasses[a.theme].bg)}>
          <p className="eyebrow">Your learning archetype</p>
          <h2 className="mt-3 text-6xl italic sm:text-7xl">{a.name}</h2>
          <p className="mt-4 max-w-xl text-xl">{a.tagline}</p>
        </div>
        <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed text-ink-2">{a.description}</p>
            <p className="eyebrow mt-8 text-ink-3">Strengths</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {a.strengths.map((s) => (
                <span key={s} className="rounded-full border-2 border-ink bg-lucid px-3 py-1 font-semibold">{s}</span>
              ))}
            </div>
            <p className="eyebrow mt-8 text-ink-3">Blind spot</p>
            <p className="mt-2 text-lg">{a.blindSpot}</p>
          </div>
          <div>
            <p className="eyebrow text-ink-3">Your mix</p>
            <ul className="mt-4 space-y-4">
              {(Object.keys(scores) as Archetype[]).map((k) => (
                <li key={k}>
                  <div className="mb-1 flex justify-between font-semibold">
                    <span>{archetypes[k].name}</span>
                    <span className="font-mono text-sm">{Math.round((scores[k] / total) * 100)}%</span>
                  </div>
                  <Progress value={(scores[k] / total) * 100} label={archetypes[k].name} />
                </li>
              ))}
            </ul>
            <div className="mt-10 rounded-3xl border-2 border-ink bg-night p-6 text-paper">
              <p className="eyebrow text-lucid">Recommended for you</p>
              <p className="mt-2 font-display text-3xl">{courseTitles[a.courseSlug] ?? "Explore courses"}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href={`/courses/${a.courseSlug}`} className={buttonClasses({ variant: "lucid" })}>
                  See the course
                </Link>
                <Link href="/signup?next=/learn/meet-your-mind" className={buttonClasses({ variant: "outline", className: "text-paper" })}>
                  Start free first
                </Link>
              </div>
            </div>
            <button type="button" onClick={() => setPicks([])} className="mt-6 inline-flex items-center gap-2 font-semibold underline underline-offset-4">
              <RotateCcw size={16} /> Retake the quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = quiz[step];
  return (
    <div className="rounded-[2rem] border-2 border-ink bg-paper p-6 shadow-hard-lg sm:p-10">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-sm">
          {String(step + 1).padStart(2, "0")} / {String(quiz.length).padStart(2, "0")}
        </p>
        {step > 0 ? (
          <button type="button" onClick={() => setPicks((p) => p.slice(0, -1))} className="inline-flex items-center gap-1 text-sm font-semibold">
            <ArrowLeft size={16} /> Back
          </button>
        ) : null}
      </div>
      <Progress value={(step / quiz.length) * 100} className="mt-4" label="Quiz progress" />
      <h2 key={q.id} className="text-balance mt-10 animate-rise text-4xl leading-tight sm:text-5xl">{q.prompt}</h2>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {q.answers.map((a, i) => (
          <button
            key={a.label}
            type="button"
            onClick={() => setPicks((p) => [...p, a.archetype])}
            className="group flex animate-rise items-center gap-4 rounded-2xl border-2 border-ink bg-white p-5 text-left text-lg font-semibold transition hover:-translate-y-0.5 hover:bg-lucid hover:shadow-hard"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink font-mono text-sm group-hover:bg-paper">{"ABCD"[i]}</span>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
