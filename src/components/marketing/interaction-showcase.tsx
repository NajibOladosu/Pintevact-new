"use client";

import { useState } from "react";
import { BarChart3, Brain, Lightbulb, PenLine, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const kinds = [
  {
    id: "quiz",
    label: "Checkpoints",
    icon: Brain,
    color: "bg-lucid",
    title: "The video pauses to test your intuition.",
    body: "Quick, surprising questions reveal how your mind really works — and lock in the learning through the testing effect.",
  },
  {
    id: "reflection",
    label: "Reflections",
    icon: PenLine,
    color: "bg-ember",
    title: "You write. The lesson becomes about you.",
    body: "Private prompts turn research into self-knowledge. Everything you write is saved to your Reflection Vault.",
  },
  {
    id: "poll",
    label: "Live polls",
    icon: BarChart3,
    color: "bg-iris",
    title: "See how your mind compares.",
    body: "Vote, then instantly see how thousands of other learners answered. Social proof, but for self-awareness.",
  },
  {
    id: "scale",
    label: "Self-ratings",
    icon: SlidersHorizontal,
    color: "bg-tide",
    title: "Measure yourself before and after.",
    body: "Rate your stress, focus or confidence in the moment — then watch it shift as you practice the technique.",
  },
  {
    id: "insight",
    label: "Insight cards",
    icon: Lightbulb,
    color: "bg-sun",
    title: "Key ideas, captured the second they land.",
    body: "Bite-size insights and micro-practices appear right when they matter, ready to revisit later.",
  },
] as const;

function Preview({ id }: { id: (typeof kinds)[number]["id"] }) {
  const [value, setValue] = useState(6);
  const [vote, setVote] = useState<number | null>(null);
  const [text, setText] = useState("");
  if (id === "quiz")
    return (
      <div>
        <p className="font-semibold">Losing $100 feels about as intense as gaining…</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {["$50", "$100", "$200", "$1,000"].map((o, i) => (
            <button key={o} type="button" onClick={() => setVote(i)} className={cn("rounded-xl border-2 border-ink px-3 py-2 font-semibold", vote !== null && i === 2 && "bg-lucid", vote === i && i !== 2 && "bg-ember")}>
              {o}
            </button>
          ))}
        </div>
        {vote !== null ? <p className="mt-3 text-sm text-ink-2">Loss aversion: losses loom about twice as large as gains.</p> : null}
      </div>
    );
  if (id === "reflection")
    return (
      <div>
        <p className="font-semibold">Name one activity that makes you lose track of time.</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type privately — this is just a preview…" className="mt-3 h-24 w-full resize-none rounded-xl border-2 border-ink bg-white p-3 focus:outline-none focus:ring-4 focus:ring-lucid/60" />
        <p className="mt-1 text-right font-mono text-xs text-ink-3">{text.length ? "Saved to your vault ✓" : "Private to you"}</p>
      </div>
    );
  if (id === "poll") {
    const opts = [["Boredom", 38], ["The task feels hard", 31], ["Anxiety", 19], ["A notification", 12]] as const;
    return (
      <div>
        <p className="font-semibold">What usually happens right before you get distracted?</p>
        <div className="mt-3 space-y-2">
          {opts.map(([label, pct], i) => (
            <button key={label} type="button" onClick={() => setVote(i)} className="relative block w-full overflow-hidden rounded-xl border-2 border-ink bg-white px-3 py-2 text-left font-semibold">
              {vote !== null ? <span className="absolute inset-y-0 left-0 bg-iris/30 transition-all duration-700" style={{ width: `${pct}%` }} /> : null}
              <span className="relative flex justify-between">
                {label} {vote !== null ? <span className="font-mono">{pct}%</span> : null}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (id === "scale")
    return (
      <div>
        <p className="font-semibold">Rate your current stress level.</p>
        <input type="range" min={1} max={10} value={value} onChange={(e) => setValue(Number(e.target.value))} aria-label="Stress level" className="mt-5 w-full accent-[var(--color-ember)]" />
        <div className="mt-1 flex justify-between font-mono text-xs text-ink-3">
          <span>Serene</span>
          <span className="text-2xl font-bold text-ink">{value}</span>
          <span>Frazzled</span>
        </div>
      </div>
    );
  return (
    <div>
      <p className="eyebrow text-ember">Mind fact</p>
      <p className="mt-2 font-display text-2xl leading-snug">Your brain is 2% of your weight but burns ~20% of your energy. Predicting is cheaper than perceiving.</p>
    </div>
  );
}

export function InteractionShowcase() {
  const [active, setActive] = useState<(typeof kinds)[number]["id"]>("quiz");
  const current = kinds.find((k) => k.id === active)!;
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div role="tablist" aria-label="Interaction types" className="flex gap-2 overflow-x-auto pb-2 scrollbar-none lg:flex-col lg:overflow-visible">
        {kinds.map((k) => (
          <button
            key={k.id}
            role="tab"
            type="button"
            aria-selected={active === k.id}
            onClick={() => setActive(k.id)}
            className={cn(
              "flex shrink-0 items-center gap-4 rounded-3xl border-2 p-4 text-left transition lg:p-5",
              active === k.id ? "border-ink bg-paper shadow-hard" : "border-transparent hover:border-ink/20",
            )}
          >
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-ink", k.color)}>
              <k.icon size={20} />
            </span>
            <span>
              <span className="block font-semibold">{k.label}</span>
              <span className="hidden text-sm text-ink-3 lg:block">{k.title}</span>
            </span>
          </button>
        ))}
      </div>
      <div role="tabpanel" className="rounded-[2rem] border-2 border-ink bg-white p-6 shadow-hard-lg sm:p-8">
        <p className="eyebrow text-ink-3">{current.label}</p>
        <h3 className="mt-2 text-3xl leading-tight">{current.title}</h3>
        <p className="mt-3 text-ink-2">{current.body}</p>
        <div key={current.id} className="mt-6 animate-rise rounded-3xl border-2 border-dashed border-ink/30 bg-paper p-5">
          <Preview id={current.id} />
        </div>
      </div>
    </div>
  );
}
