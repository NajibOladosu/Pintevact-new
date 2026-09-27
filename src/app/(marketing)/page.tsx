import Link from "next/link";
import { ArrowRight, Brain, Compass, Flame, Microscope, Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Marquee } from "@/components/brand/marquee";
import { Constellation } from "@/components/brand/constellation";
import { Blob } from "@/components/brand/blob";
import { CourseCard } from "@/components/course/course-card";
import { WordCycler } from "@/components/marketing/word-cycler";
import { HeroPlayerDemo } from "@/components/marketing/hero-player-demo";
import { InteractionShowcase } from "@/components/marketing/interaction-showcase";
import { getCourses } from "@/lib/data";
import { summarizeCourse } from "@/lib/course";
import { LEVELS } from "@/lib/gamification";

const concepts = [
  "Cognitive defusion",
  "Attachment styles",
  "Loss aversion",
  "Flow states",
  "Affect labelling",
  "Implementation intentions",
  "The spotlight effect",
  "Projection",
  "Narrative transport",
  "Interoception",
];

const principles = [
  { icon: Microscope, title: "Evidence, not vibes", body: "Every lesson is built on peer-reviewed research — Kahneman, Cialdini, Gross, Hayes, Bowlby — translated for real life." },
  { icon: Brain, title: "Active, not passive", body: "Our videos stop and ask. Retrieval practice and self-reference make ideas stick far longer than watching alone." },
  { icon: Compass, title: "About you, specifically", body: "Your reflections, ratings and choices build a private map of your mind that grows with every course." },
  { icon: Flame, title: "Kind, not preachy", body: "Self-compassion outperforms self-criticism. We help you understand yourself — not optimise yourself into exhaustion." },
];

export default async function HomePage() {
  const courses = (await getCourses()).map(summarizeCourse);
  const featured = courses.filter((c) => c.featured).slice(0, 3);
  const totalMoments = courses.reduce((s, c) => s + c.interactionCount, 0);
  const totalLessons = courses.reduce((s, c) => s + c.lessonCount, 0);

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="grain relative overflow-hidden">
        <Blob className="-left-32 top-10 h-80 w-80 bg-lucid/50" />
        <Blob className="-right-20 bottom-0 h-96 w-96 bg-iris/30 [animation-delay:-3s]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:px-8 lg:pb-28">
          <div>
            <p className="eyebrow inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5">
              <Sparkles size={13} className="text-ember" /> Interactive psychology courses
            </p>
            <h1 className="text-balance mt-6 text-[3.1rem] leading-[0.95] sm:text-7xl lg:text-[5.4rem]">
              Finally understand why you <WordCycler words={["overthink.", "procrastinate.", "people-please.", "self-sabotage.", "crave approval."]} />
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">
              Pintevact teaches you the psychology of <em className="font-display">you</em> — through videos that pause, question and listen. Discover how your mind works, then use it to your advantage.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup?next=/learn/meet-your-mind" className={buttonClasses({ size: "lg" })}>
                Start the free course <ArrowRight size={18} />
              </Link>
              <Link href="/discover" className={buttonClasses({ variant: "outline", size: "lg" })}>
                Take the 2-min mind quiz
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t-2 border-ink/10 pt-6">
              {[
                [courses.length, "Courses"],
                [totalLessons, "Lessons"],
                [`${totalMoments}+`, "Interactive moments"],
              ].map(([n, label]) => (
                <div key={String(label)}>
                  <dt className="eyebrow text-ink-3">{label}</dt>
                  <dd className="mt-1 font-display text-4xl">{n}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroPlayerDemo />
        </div>
      </section>

      <Marquee items={concepts} className="border-y-2 border-ink bg-ink py-5 font-display text-2xl italic text-lucid sm:text-3xl" />

      {/* ── Interactions ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-3xl">
          <p className="eyebrow text-ember">Videos that talk back</p>
          <h2 className="text-balance mt-4 text-5xl leading-[1] sm:text-6xl">
            You don&apos;t watch a Pintevact lesson. <span className="display-italic">You take part in it.</span>
          </h2>
          <p className="mt-6 text-lg text-ink-2">Every lesson is laced with moments that pause the video and turn the research onto your own life. Try them:</p>
        </div>
        <div className="mt-14">
          <InteractionShowcase />
        </div>
      </section>

      {/* ── Featured courses ───────────────────────────────── */}
      <section className="border-y-2 border-ink bg-paper-2">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-ember">Start somewhere</p>
              <h2 className="mt-4 text-5xl leading-none sm:text-6xl">
                Courses for the <span className="display-italic">inner</span> curriculum
              </h2>
            </div>
            <Link href="/courses" className={buttonClasses({ variant: "ink" })}>
              See all {courses.length} courses <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((c, i) => (
              <CourseCard key={c.id} course={c} className={i === 1 ? "lg:translate-y-8" : undefined} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Constellation / progression ────────────────────── */}
      <section className="relative overflow-hidden bg-night text-paper">
        <Constellation className="absolute inset-0 h-full w-full text-mist" count={60} seed={21} />
        <div className="relative mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div>
            <p className="eyebrow text-lucid">Your constellation</p>
            <h2 className="mt-4 text-5xl leading-[1] sm:text-6xl">
              Every lesson lights a <span className="display-italic text-lucid">star</span> on the map of your mind.
            </h2>
            <p className="mt-6 max-w-lg text-lg text-mist">
              Earn XP for every insight, keep your streak burning, collect badges and rise through nine levels of awareness. Your dashboard draws a living constellation of everything you&apos;ve discovered about yourself.
            </p>
            <Link href="/signup" className={buttonClasses({ variant: "lucid", size: "lg", className: "mt-10" })}>
              Begin your map
            </Link>
          </div>
          <ol className="relative space-y-2 border-l border-white/15 pl-8">
            {LEVELS.map((l, i) => (
              <li key={l.level} className="relative">
                <span
                  className="absolute -left-[2.35rem] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-night"
                  style={{ background: i < 3 ? "var(--color-lucid)" : i < 6 ? "var(--color-iris)" : "var(--color-ember)" }}
                />
                <div className="flex items-baseline justify-between gap-4 rounded-2xl px-4 py-2.5 transition hover:bg-white/5">
                  <span className="font-display text-2xl italic">{l.name}</span>
                  <span className="font-mono text-xs text-mist">
                    LVL {l.level} · {l.minXp.toLocaleString()} XP
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Principles ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow text-ember">How we teach</p>
            <h2 className="mt-4 text-5xl leading-none sm:text-6xl">Built for minds that want to actually change.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {principles.map((p, i) => (
              <div key={p.title} className="rounded-[2rem] border-2 border-ink bg-white/60 p-7" style={{ transform: `rotate(${i % 2 ? 0.6 : -0.6}deg)` }}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-lucid">
                  <p.icon size={22} />
                </span>
                <h3 className="mt-5 text-2xl">{p.title}</h3>
                <p className="mt-2 text-ink-2">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border-2 border-ink bg-ember px-6 py-16 text-center shadow-hard-lg sm:px-12 sm:py-24">
          <div className="dotgrid absolute inset-0 text-ink/10" />
          <p className="eyebrow relative">Free forever · no card needed</p>
          <h2 className="text-balance relative mx-auto mt-4 max-w-4xl text-5xl leading-[0.95] sm:text-7xl">
            The most interesting subject you&apos;ll ever study is <span className="display-italic">yourself.</span>
          </h2>
          <div className="relative mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className={buttonClasses({ variant: "ink", size: "lg" })}>
              Create my free account
            </Link>
            <Link href="/pricing" className={buttonClasses({ variant: "outline", size: "lg" })}>
              See membership
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
