import Link from "next/link";
import { Clock, Sparkles, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CourseCover } from "./course-cover";
import { cn, formatMinutes, formatPrice } from "@/lib/utils";
import type { CourseSummary } from "@/lib/types";

export function CourseCard({ course, href, className, footer }: { course: CourseSummary; href?: string; className?: string; footer?: React.ReactNode }) {
  return (
    <Link
      href={href ?? `/courses/${course.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[2rem] border-2 border-ink bg-paper transition duration-300 hover:-translate-y-1 hover:shadow-hard-lg",
        className,
      )}
    >
      <CourseCover theme={course.theme} glyph={course.glyph} className="aspect-[16/10] border-b-2 border-ink" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="outline">{course.category}</Badge>
          <Badge tone="outline">{course.level}</Badge>
        </div>
        <h3 className="mt-4 text-[1.65rem] leading-tight transition group-hover:text-ember">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-ink-2">{course.subtitle}</p>
        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-wider text-ink-3">
            <span className="inline-flex items-center gap-1.5">
              <PlayCircle size={14} /> {course.lessonCount} lessons
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} /> {formatMinutes(course.durationSeconds)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={14} /> {course.interactionCount} moments
            </span>
          </div>
          {footer ?? (
            <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
              <span className="font-display text-2xl">{formatPrice(course.priceCents, course.currency)}</span>
              <span className="text-sm font-semibold text-ink-2 transition group-hover:translate-x-1">Explore →</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
