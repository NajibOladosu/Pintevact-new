import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { HeroDeck } from "@/components/marketing/hero-deck";
import { LessonLine } from "@/components/marketing/lesson-line";
import { CourseRow } from "@/components/course/course-row";
import { LineBullet, StationLine } from "@/components/brand/station-line";
import { getCourses } from "@/lib/data";
import { courseCode, courseStations, flattenLessons } from "@/lib/course";

export default async function HomePage() {
  const courses = await getCourses();
  const free = courses.find((c) => c.priceCents === 0) ?? courses[0];
  const firstLesson = flattenLessons(free)[0];

  // Illustrative progress for the preview panel (labelled as an example on the page).
  const sample = courses.slice(0, 3).map((c, i) => {
    const lessons = flattenLessons(c);
    const done = new Set(lessons.slice(0, [3, 1, 0][i]).map((l) => l.id));
    return { course: c, stations: courseStations(c, done, lessons[[3, 1, 0][i]]?.id) };
  });

  return (
    <>
      {/* Hero: the offer on the left, a lesson you can actually play on the right */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-20 pt-6 sm:gap-14 sm:px-8 sm:pt-12 md:pt-20 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-20 lg:pb-28">
        <div className="animate-enter">
          <h1 className="max-w-[14ch] text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl">Psychology you answer, not just watch.</h1>
          <p className="mt-4 max-w-[42ch] leading-relaxed text-muted sm:mt-6 sm:text-lg">Short video lessons that stop to ask about your life. Every answer moves you one station further.</p>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-9">
            <Link href="/signup?next=/learn/meet-your-mind" className={buttonClasses({ size: "lg" })}>
              Start free
            </Link>
            <Link href="/courses" className={buttonClasses({ variant: "outline", size: "lg" })}>
              See courses
            </Link>
          </div>
        </div>
        <HeroDeck />
      </section>

      {/* How a lesson works, drawn to scale from a real lesson */}
      <section className="border-y border-line bg-sunken/60">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight sm:text-4xl">Every lesson stops to ask about you.</h2>
          <p className="mt-4 max-w-[58ch] text-muted">
            This is {firstLesson.title}, the first lesson of {free.title}. The video pauses at each station until you answer.
          </p>
          <div className="mt-12">
            <LessonLine lesson={firstLesson} />
          </div>
        </div>
      </section>

      {/* The catalog as a set of lines */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Seven courses. Each one a line.</h2>
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
            Browse the catalog <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-10 -mx-4 md:-mx-5">
          {courses.map((c) => (
            <CourseRow key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* Progress: answers add up */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-28">
          <div>
            <h2 className="max-w-[16ch] text-3xl font-semibold tracking-tight sm:text-4xl">Your answers add up to a map of you.</h2>
            <p className="mt-4 max-w-[46ch] text-muted">
              Each finished lesson fills a station. Your reflections stay private in one place, so the patterns you keep noticing are there when you look back.
            </p>
          </div>
          <div>
            <div className="rounded-2xl border border-line bg-raised p-6 sm:p-8">
              <p className="text-sm text-subtle">Example progress</p>
              <ul className="mt-6 space-y-7">
                {sample.map(({ course, stations }) => (
                  <li key={course.id} className="grid grid-cols-[auto_1fr] items-center gap-4">
                    <LineBullet code={courseCode(course)} />
                    <div>
                      <p className="text-sm font-medium">{course.title}</p>
                      <StationLine stations={stations} size="sm" className="mt-3" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <blockquote className="relative -mt-4 ml-6 rounded-2xl bg-violet p-5 text-on-violet sm:ml-12 sm:p-6">
              <p className="text-sm text-on-violet-muted">Example reflection, The Elephant and the Rider</p>
              <p className="mt-2 leading-relaxed">“I bought concert tickets at midnight because I felt lonely, then called it an investment in experiences.”</p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Close: the line ends at the first station */}
      <section className="mx-auto max-w-6xl px-5 pb-24 pt-4 sm:px-8">
        <h2 className="max-w-[18ch] text-3xl font-semibold tracking-tight sm:text-4xl">Start with {free.title}. It&apos;s free.</h2>
        <p className="mt-3 text-muted">Four lessons, about half an hour, no card needed.</p>
        <div className="mt-10 flex items-center gap-5">
          <span aria-hidden className="h-0.5 flex-1 bg-accent" />
          <span aria-hidden className="h-4 w-4 shrink-0 rounded-full border-2 border-accent bg-bg ring-4 ring-accent/20" />
          <Link href="/signup?next=/learn/meet-your-mind" className={buttonClasses({ size: "lg" })}>
            Start free
          </Link>
        </div>
      </section>
    </>
  );
}
