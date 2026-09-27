"use client";

import { useEffect, useState } from "react";
import { Pause, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
  { id: "a", label: "10 cents", correct: false },
  { id: "b", label: "5 cents", correct: true },
  { id: "c", label: "1 cent", correct: false },
];

/** A living miniature of the Pintevact player: it "plays", pauses, and asks the visitor a question. */
export function HeroPlayerDemo() {
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const checkpoint = 38;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setT((v) => {
        const next = v + 1;
        if (next === checkpoint && !answer) setPaused(true);
        return next >= 100 ? 0 : next;
      });
    }, 120);
    return () => clearInterval(id);
  }, [paused, answer]);

  const chosen = options.find((o) => o.id === answer);
  const showQuiz = t >= checkpoint && t < checkpoint + 30 && (paused || answer);

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-night shadow-hard-lg">
        <div className="relative aspect-[4/3.3] sm:aspect-[4/3]">
          {/* faux video frame */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,124,255,0.55),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(255,90,54,0.45),transparent_50%)]" />
          <div className="absolute left-5 top-5 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-ember" />
            <span className="eyebrow text-paper/80">Meet Your Mind · Lesson 1</span>
          </div>
          <p className="absolute left-6 right-6 top-16 font-display text-2xl italic leading-snug text-paper sm:text-3xl">
            “Your fast mind answers first. Your slow mind signs off without reading.”
          </p>

          {showQuiz ? (
            <div className="absolute inset-x-3 bottom-16 animate-rise rounded-3xl border-2 border-ink bg-paper p-4 text-ink sm:inset-x-6 sm:p-5">
              <p className="eyebrow flex items-center gap-1.5 text-ember">
                <Sparkles size={12} /> Quick check · the video paused for you
              </p>
              <p className="mt-2 text-[0.95rem] font-semibold leading-snug sm:text-base">A bat and ball cost $1.10. The bat costs $1 more than the ball. The ball costs…</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    disabled={!!answer}
                    onClick={() => {
                      setAnswer(o.id);
                      setTimeout(() => setPaused(false), 1600);
                    }}
                    className={cn(
                      "rounded-xl border-2 border-ink px-2 py-2 text-sm font-semibold transition",
                      !answer && "hover:bg-lucid",
                      answer && o.correct && "bg-lucid",
                      answer === o.id && !o.correct && "bg-ember",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {chosen ? (
                <p className="mt-2 text-sm text-ink-2" role="status">
                  {chosen.correct ? "Your rider stepped in. +20 XP ✦" : "That's System 1 talking — the answer is 5¢. +5 XP"}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* controls */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-night to-transparent px-5 pb-4 pt-10">
            <button
              type="button"
              aria-label={paused ? "Play demo" : "Pause demo"}
              onClick={() => setPaused((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink"
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <div className="relative h-1.5 flex-1 rounded-full bg-white/20">
              <div className="absolute inset-y-0 left-0 rounded-full bg-lucid" style={{ width: `${t}%` }} />
              {[checkpoint, 72].map((m) => (
                <span key={m} className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-night bg-ember" style={{ left: `${m}%` }} />
              ))}
            </div>
            <span className="font-mono text-xs text-paper/70">0:{String(Math.floor(t * 0.42)).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
      <span className="absolute -right-3 -top-4 rotate-6 rounded-full border-2 border-ink bg-lucid px-3 py-1.5 font-mono text-xs font-semibold uppercase shadow-hard sm:-right-6">
        It talks back
      </span>
      <span className="absolute -bottom-5 -left-3 -rotate-6 rounded-full border-2 border-ink bg-iris px-3 py-1.5 font-mono text-xs font-semibold uppercase text-white shadow-hard sm:-left-6">
        +20 XP per insight
      </span>
    </div>
  );
}
