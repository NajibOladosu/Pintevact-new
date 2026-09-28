import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { StationLine } from "@/components/brand/station-line";
import { CourseArt } from "@/components/course/course-card";
import { courseStations, summarizeCourse } from "@/lib/course";
import { cn, formatMinutes, formatPrice } from "@/lib/utils";
import type { Course } from "@/lib/types";

/** A course as a row card: artwork, name, lesson progress and the facts. */
export function CourseRow({ course, href, completed, nextId, className, headingLevel = "h3" }: { course: Course; href?: string; completed?: Set<string>; nextId?: string | null; className?: string; headingLevel?: "h2" | "h3" }) {
  const s = summarizeCourse(course);
  const H = headingLevel;
  return (
    <Link
      href={href ?? `/courses/${course.slug}`}
      className={cn("group grid grid-cols-[auto_1fr_auto] items-start gap-x-5 gap-y-4 rounded-[1.6rem] bg-raised p-4 ring-1 ring-line transition-shadow hover:shadow-card md:grid-cols-[auto_minmax(0,1.1fr)_minmax(0,1fr)_auto] md:items-center md:p-5", className)}
    >
      <CourseArt index={course.position} image={course.coverImageUrl} className="h-14 w-14 rounded-[1rem] md:h-16 md:w-16" />
      <div className="min-w-0">
        <H className="text-lg font-semibold tracking-[-0.02em]">{course.title}</H>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{course.subtitle}</p>
      </div>
      <div className="col-span-3 row-start-2 md:col-span-1 md:row-start-auto">
        <StationLine stations={courseStations(course, completed ?? new Set(), nextId)} size="sm" />
        <p className="tabular mt-2.5 text-xs text-muted">
          {s.lessonCount} lessons, {formatMinutes(s.durationSeconds)}, {s.interactionCount} checkpoints
        </p>
      </div>
      <div className="flex items-center gap-3 text-sm md:justify-end">
        <span className="tabular font-medium">{formatPrice(course.priceCents, course.currency)}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fg text-bg transition-colors group-hover:bg-accent group-hover:text-on-accent"><ArrowUpRight size={15} aria-hidden className="arrow-nudge" /></span>
      </div>
    </Link>
  );
}
