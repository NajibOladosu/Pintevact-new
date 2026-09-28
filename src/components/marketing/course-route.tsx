import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { CourseArt } from "@/components/course/course-card";
import { courseCode, flattenLessons, summarizeCourse } from "@/lib/course";
import { cn, formatMinutes, formatPrice } from "@/lib/utils";
import type { Course } from "@/lib/types";

const SHOWN_LESSONS = 4;

/**
 * The home page catalogue as a route: the courses sit side by side as stops on one line,
 * each listing its first lessons as stations. On wide screens the stop you point at opens up.
 */
export function CourseRoute({ courses }: { courses: Course[] }) {
  return (
    <ol
      data-reveal="list"
      className="relative flex flex-col gap-3 lg:flex-row lg:gap-0"
    >
      {courses.map((course, i) => (
        <Stop
          key={course.id}
          course={course}
          index={i}
          total={courses.length}
        />
      ))}
    </ol>
  );
}

function Stop({
  course,
  index,
  total,
}: {
  course: Course;
  index: number;
  total: number;
}) {
  const s = summarizeCourse(course);
  const lessons = flattenLessons(course);
  const free = course.priceCents === 0;
  const signal = index === 0;
  const last = index === total - 1;
  const label = index === 0 ? "Start here" : last ? "Go deeper" : "Then";

  return (
    <li
      className={cn(
        "group/stop relative flex min-w-0 transition-[flex-grow] duration-700 ease-[var(--ease-out-expo)] lg:flex-[1_1_0%] lg:hover:flex-[1.35_1_0%] lg:focus-within:flex-[1.35_1_0%]",
        index > 0 && "lg:ml-3",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col overflow-hidden rounded-[1.8rem] ring-1",
          signal
            ? "bg-accent text-on-accent ring-accent"
            : "bg-raised text-fg ring-line",
        )}
      >
        <CourseArt
          index={course.position}
          image={course.coverImageUrl}
          className="m-2 mb-0 h-56 rounded-[1.4rem] sm:h-64"
        >
          <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
            <span className="rounded-full bg-raised/90 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-fg backdrop-blur">
              {label}
            </span>
            <span className="rounded-full bg-frame/70 px-3 py-1.5 text-[0.7rem] font-semibold tabular text-on-frame backdrop-blur">
              {free ? "Free" : formatPrice(course.priceCents, course.currency)}
            </span>
          </div>
          <span
            aria-hidden
            className="absolute bottom-2 left-5 text-[clamp(4.5rem,8vw,7rem)] font-bold leading-none tracking-[-0.07em] text-white transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/stop:-translate-y-1.5"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            aria-hidden
            className="absolute bottom-5 right-5 font-mono text-xs font-semibold tracking-[0.2em] text-white/85"
          >
            {courseCode(course)}
          </span>
        </CourseArt>

        <div className="flex flex-1 flex-col px-6 pb-6 pt-6 sm:px-8 sm:pb-8">
          <p
            className={cn(
              "text-[0.68rem] font-semibold uppercase tracking-[0.14em]",
              signal ? "text-on-accent/80" : "text-muted",
            )}
          >
            {course.category} · {course.level}
          </p>
          <h3 className="mt-3 text-[clamp(1.7rem,2.4vw,2.35rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
            {course.title}
          </h3>
          <p
            className={cn(
              "mt-3 max-w-[46ch] leading-relaxed",
              signal ? "text-on-accent/85" : "text-muted",
            )}
          >
            {course.subtitle}
          </p>

          {/* The first lessons as stations on a vertical rail. */}
          <ol
            className="relative mt-7 space-y-3.5 pl-7"
            aria-label={`First lessons in ${course.title}`}
          >
            <span
              aria-hidden
              className={cn(
                "absolute bottom-1.5 left-[0.3rem] top-1.5 w-1 rounded-full",
                signal ? "bg-on-accent/30" : "bg-line-strong",
              )}
            />
            {lessons.slice(0, SHOWN_LESSONS).map((l, li) => (
              <li
                key={l.id}
                className="relative flex items-baseline justify-between gap-4 text-[0.9375rem]"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute -left-7 top-[0.3rem] h-3.5 w-3.5 rounded-full border-2",
                    li === 0
                      ? signal
                        ? "border-on-accent bg-on-accent"
                        : "border-accent bg-accent"
                      : signal
                        ? "border-on-accent bg-accent"
                        : "border-line-strong bg-raised",
                  )}
                />
                <span className="min-w-0 truncate font-medium">{l.title}</span>
                <span
                  className={cn(
                    "shrink-0 text-xs tabular",
                    signal ? "text-on-accent/75" : "text-subtle",
                  )}
                >
                  {formatMinutes(l.durationSeconds)}
                </span>
              </li>
            ))}
            {lessons.length > SHOWN_LESSONS ? (
              <li
                className={cn(
                  "relative text-sm",
                  signal ? "text-on-accent/75" : "text-muted",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute -left-[1.6rem] top-[0.45rem] h-2 w-2 rounded-full",
                    signal ? "bg-on-accent/50" : "bg-line-strong",
                  )}
                />
                {lessons.length - SHOWN_LESSONS} more{" "}
                {lessons.length - SHOWN_LESSONS === 1 ? "lesson" : "lessons"}
              </li>
            ) : null}
          </ol>

          <div
            className={cn(
              "mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6",
              signal ? "border-on-accent/25" : "border-line",
            )}
          >
            <p
              className={cn(
                "text-[0.8125rem] tabular",
                signal ? "text-on-accent/85" : "text-muted",
              )}
            >
              {s.lessonCount} lessons · {formatMinutes(s.durationSeconds)} ·{" "}
              {s.interactionCount} checkpoints
            </p>
            <Link
              href={`/courses/${course.slug}`}
              className={cn(
                "inline-flex h-12 items-center gap-3 rounded-[0.9rem] px-5 text-[0.8125rem] font-semibold transition-colors",
                signal
                  ? "bg-raised text-accent-ink hover:bg-bg"
                  : "bg-fg text-bg hover:bg-accent hover:text-on-accent",
              )}
            >
              {free ? "Start free" : "View course"}{" "}
              <ArrowUpRight size={15} aria-hidden className="arrow-nudge" />
              <span className="sr-only">: {course.title}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* The line carries on to the next stop. */}
      {!last ? (
        <span
          aria-hidden
          className="absolute -bottom-3 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-frame ring-4 ring-frame lg:-right-6 lg:bottom-auto lg:left-auto lg:top-[8.5rem] lg:translate-x-0"
        >
          <span className="flex h-full w-full items-center justify-center rounded-full bg-accent text-on-accent">
            <ArrowUpRight size={15} className="rotate-[135deg] lg:rotate-45" />
          </span>
        </span>
      ) : null}
    </li>
  );
}
