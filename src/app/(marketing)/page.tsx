import Link from "next/link";
import { ArrowUpRight, Check } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { HeroDeck } from "@/components/marketing/hero-deck";
import { LessonLine } from "@/components/marketing/lesson-line";
import { CourseCard } from "@/components/course/course-card";
import { FaqSection } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";
import { Progress } from "@/components/ui/progress";
import { HeroArt } from "@/components/motion/hero-art";
import { Marquee } from "@/components/marketing/marquee";
import { getCourses } from "@/lib/data";
import { flattenLessons } from "@/lib/course";
import { MEMBERSHIP, yearlySavingsPercent } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { generalFaqs } from "@/content/faqs";

export default async function HomePage() {
  const courses = await getCourses();
  const free = courses.find((c) => c.priceCents === 0) ?? courses[0];
  const firstLesson = flattenLessons(free)[0];

  // Illustrative progress for the preview panel (labelled as an example on the page).
  const sample = courses.slice(0, 3).map((c, i) => {
    const total = flattenLessons(c).length;
    const done = [3, 1, 0][i];
    return { course: c, done, total };
  });

  return (
    <>
      {/* Hero: an image frame the header sits on, with a playable checkpoint card floating on the right. */}
      <section className="-mt-24 px-2 pt-2 sm:px-4 sm:pt-4">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-frame text-on-frame shadow-frame sm:rounded-[2.4rem]">
          <HeroArt />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(3_3_9/0.78)_0%,rgb(3_3_9/0.5)_45%,rgb(3_3_9/0.15)_100%)]" />
          <div className="mx-auto grid min-h-[min(100svh-1rem,62rem)] max-w-[90rem] items-end gap-10 px-[clamp(1.25rem,4.5vw,5rem)] pb-8 pt-32 sm:pb-12 lg:grid-cols-[1fr_minmax(0,27rem)] lg:gap-16 lg:pb-16 lg:pt-40">
            <div className="lg:pb-6">
              <h1 className="text-[clamp(3.4rem,9vw,8.4rem)] leading-[0.92] tracking-[-0.055em]">
                <span className="mask-line font-light">
                  <span>Know your</span>
                </span>{" "}
                <span className="mask-line font-light">
                  <span>
                    own <span className="text-gradient-signal text-sweep font-bold">mind.</span>
                  </span>
                </span>
              </h1>
              <p className="animate-enter [animation-delay:350ms] mt-7 max-w-[40ch] text-[clamp(1rem,0.45vw+0.82rem,1.2rem)] leading-relaxed text-on-frame-muted">
                Psychology you answer, not just watch. Short video lessons that stop to ask about your life, so the ideas land where they matter.
              </p>
              <div className="animate-enter [animation-delay:450ms] mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link href="/signup?next=/learn/meet-your-mind" data-magnetic className={buttonClasses({ size: "lg" })}>
                  Start free <ArrowUpRight size={16} aria-hidden className="arrow-nudge" />
                </Link>
                <Link href="/courses" className="link-draw pb-1 text-[0.9375rem] font-medium text-on-frame">
                  Discover the courses
                </Link>
              </div>
              <p className="animate-enter [animation-delay:550ms] mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-on-frame pt-6 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-on-frame-muted">
                Interactive video <span aria-hidden className="h-1 w-1 rounded-full bg-accent" /> Private reflections <span aria-hidden className="h-1 w-1 rounded-full bg-accent" /> Your own pace
              </p>
            </div>
            <div className="animate-enter [animation-delay:250ms]">
              <HeroDeck />
            </div>
          </div>
        </div>
      </section>

      <Marquee items={["Checkpoints", "Reflections", "Live polls", "Self-ratings", "Insights", "Certificates"]} />

      {/* The catalogue: a dark frame holding the courses. */}
      <section className="shell mt-10 sm:mt-14">
        <div data-reveal="frame" data-spotlight className="overflow-hidden rounded-[2.4rem] bg-frame py-14 text-on-frame shadow-frame sm:py-20">
          <div className="px-8 sm:px-16">
            <span className="eyebrow text-on-frame-muted">The catalogue</span>
            <div className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <h2 className="h-section max-w-[13ch]">Seven courses. Plenty to take away.</h2>
                <p className="mt-6 max-w-[52ch] leading-relaxed text-on-frame-muted">
                  Choose what sparks your curiosity: habits, emotions, relationships, focus, persuasion. Start with the free course and move at your own pace.
                </p>
              </div>
              <Link href="/courses" data-magnetic className={buttonClasses({ variant: "light", className: "shrink-0 self-start lg:self-auto" })}>
                Browse all courses <ArrowUpRight size={15} aria-hidden className="arrow-nudge" />
              </Link>
            </div>
          </div>
          <ul data-reveal="list" className="scrollbar-none relative mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-8 pb-4 pt-2 sm:px-16">
            {courses.map((c, i) => (
              <li key={c.id} className="w-[min(20rem,82vw)] shrink-0 snap-start">
                <CourseCard course={c} index={i} tone={c.id === free.id ? "signal" : "light"} className="h-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How a lesson works, from a real lesson */}
      <section className="shell mt-24 sm:mt-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div data-reveal="rise" className="lg:sticky lg:top-28 lg:self-start">
            <span className="eyebrow text-muted">How a lesson works</span>
            <h2 className="h-section mt-6 max-w-[12ch]">Every lesson stops to ask about you.</h2>
            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted">
              This is {firstLesson.title}, the first lesson of {free.title}. The video pauses at each step until you answer.
            </p>
          </div>
          <LessonLine lesson={firstLesson} />
        </div>
      </section>

      {/* Progress: answers add up */}
      <section className="shell mt-24 sm:mt-32">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div data-reveal="rise">
            <span className="eyebrow text-muted">What stays with you</span>
            <h2 className="h-section mt-6 max-w-[12ch]">Your answers add up to a map of you.</h2>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted">
              Each finished lesson moves you forward. Your reflections stay private in one place, so the patterns you keep noticing are there when you look back.
            </p>
          </div>
          <div data-reveal="list" className="grid gap-3">
            <div className="rounded-[1.6rem] bg-raised p-7 ring-1 ring-line sm:p-9">
              <span className="eyebrow text-muted">Example progress</span>
              <ul className="mt-7 space-y-6">
                {sample.map(({ course, done, total }, i) => (
                  <li key={course.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-semibold tracking-[-0.01em]">
                        <span className="mr-3 text-xs text-accent-ink tabular">{String(i + 1).padStart(2, "0")}</span>
                        {course.title}
                      </p>
                      <span className="text-[0.8125rem] text-muted tabular">
                        {done} of {total}
                      </span>
                    </div>
                    <Progress value={(done / total) * 100} label={`${course.title} example progress`} className="mt-3" />
                  </li>
                ))}
              </ul>
            </div>
            <blockquote className="rounded-[1.6rem] bg-violet p-7 text-on-violet sm:p-9">
              <span className="eyebrow text-on-violet-muted">Example reflection</span>
              <p className="mt-4 text-lg leading-relaxed">“I bought concert tickets at midnight because I felt lonely, then called it an investment in experiences.”</p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Membership */}
      <section className="mt-24 bg-[radial-gradient(60rem_30rem_at_50%_0%,rgb(238_66_23/0.08),transparent_70%)] pt-16 sm:mt-32 sm:pt-24">
        <div className="shell text-center">
          <h2 data-reveal="rise" className="h-section mx-auto max-w-[16ch]">A little more self-aware. Every time you return.</h2>
          <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">Start with the free course. When you&apos;re ready for more, one membership opens every course, including the next ones.</p>
          <div data-reveal="list" className="mx-auto mt-14 grid max-w-4xl gap-4 text-left md:grid-cols-2">
            {(["month", "year"] as const).map((i) => {
              const plan = MEMBERSHIP[i];
              return (
                <div key={i} data-tilt className="flex flex-col rounded-[2rem] bg-raised p-8 ring-1 ring-line sm:p-10">
                  <span className="eyebrow text-muted">{plan.label}</span>
                  <p className="mt-3 text-sm text-muted">{i === "month" ? "Build a little practice into everyday life." : `Give it room to become a habit. Save ${yearlySavingsPercent()}%.`}</p>
                  <p className="mt-8 flex items-baseline gap-2">
                    <span className="text-[clamp(3rem,5vw,4.2rem)] font-semibold leading-none tracking-[-0.05em] tabular">{formatPrice(plan.amountCents)}</span>
                    <span className="text-sm text-muted">/ {plan.per}</span>
                  </p>
                  <ul className="mt-8 flex-1 space-y-3 border-t border-line pt-7 text-[0.9375rem]">
                    {["All seven courses", "Every interactive lesson", "Saved progress and private notes", "Certificates as you finish"].map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check size={15} className="mt-1 shrink-0 text-accent-ink" aria-hidden /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/pricing" className="mt-9 flex h-[3.25rem] items-center justify-between rounded-[0.9rem] bg-fg px-5 text-[0.8125rem] font-semibold text-bg transition-colors hover:bg-accent hover:text-on-accent">
                    Explore membership <ArrowUpRight size={15} aria-hidden className="arrow-nudge" />
                  </Link>
                </div>
              );
            })}
          </div>
          <Link href="#faq" className="mt-10 inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
            Not sure which fits? Read the FAQ <ArrowUpRight size={14} className="text-accent-ink" aria-hidden />
          </Link>
        </div>
      </section>

      <div id="faq" className="scroll-mt-24">
        <FaqSection items={generalFaqs} />
      </div>

      <CtaBand />
    </>
  );
}
