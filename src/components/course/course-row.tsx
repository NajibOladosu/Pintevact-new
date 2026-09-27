import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { LineBullet, StationLine } from "@/components/brand/station-line";
import { courseCode, courseStations, summarizeCourse } from "@/lib/course";
import { cn, formatMinutes, formatPrice } from "@/lib/utils";
import type { Course } from "@/lib/types";

/** A course drawn as its line: bullet, name, one station per lesson, and the facts. */
export function CourseRow({ course, href, completed, nextId, className, headingLevel = "h3" }: { course: Course; href?: string; completed?: Set<string>; nextId?: string | null; className?: string; headingLevel?: "h2" | "h3" }) {
  const s = summarizeCourse(course);
  const H = headingLevel;
  return (
    <Link
      href={href ?? `/courses/${course.slug}`}
      className={cn("group grid grid-cols-[auto_1fr_auto] items-start gap-x-5 gap-y-4 rounded-2xl px-4 py-5 transition-colors hover:bg-fg/[0.03] md:grid-cols-[auto_minmax(0,1.1fr)_minmax(0,1fr)_auto] md:items-center md:px-5", className)}
    >
      <LineBullet code={courseCode(course)} />
      <div className="min-w-0">
        <H className="text-lg font-semibold tracking-tight">{course.title}</H>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{course.subtitle}</p>
      </div>
      <div className="col-span-3 row-start-2 md:col-span-1 md:row-start-auto">
        <StationLine stations={courseStations(course, completed ?? new Set(), nextId)} size="sm" />
        <p className="tabular mt-2.5 text-xs text-subtle">
          {s.lessonCount} lessons, {formatMinutes(s.durationSeconds)}, {s.interactionCount} checkpoints
        </p>
      </div>
      <div className="flex items-center gap-3 text-sm md:justify-end">
        <span className="tabular font-medium">{formatPrice(course.priceCents, course.currency)}</span>
        <ArrowRight size={16} className="text-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden />
      </div>
    </Link>
  );
}
