import Link from "next/link";
import { ArrowUpRight, Clock, Lightbulb, BookOpen, Users } from "@/components/icons";
import { summarizeCourse } from "@/lib/course";
import { cn, formatMinutes, formatPrice } from "@/lib/utils";
import type { Course } from "@/lib/types";

/** Where each course's crop of the papercut artwork sits, so every card gets its own colours. */
const artPosition = ["100% 30%", "0% 60%", "55% 20%", "80% 90%", "20% 10%", "40% 75%", "70% 55%"];

/** Course artwork: the uploaded cover when there is one, otherwise this course's crop of the papercut art. */
export function CourseArt({ index, image, className, children }: { index: number; image?: string | null; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden bg-frame", className)}>
      {image ? (
        <div aria-hidden className="tilt-art absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(image)})` }} />
      ) : (
        <div aria-hidden className="tilt-art absolute inset-0 bg-[url(/art/papercut-sm.webp)] [background-size:260%_auto]" style={{ backgroundPosition: artPosition[index % artPosition.length] }} />
      )}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(3_3_9/0)_40%,rgb(3_3_9/0.55)_100%)]" />
      {children}
    </div>
  );
}

/** A programme-style course card: artwork with tags and a big number, then the facts. */
export function CourseCard({ course, index, tone = "light", href, className, headingLevel = "h3" }: { course: Course; index: number; tone?: "light" | "signal"; href?: string; className?: string; headingLevel?: "h2" | "h3" }) {
  const s = summarizeCourse(course);
  const H = headingLevel;
  const signal = tone === "signal";
  return (
    <article data-tilt className={cn("group relative flex flex-col overflow-hidden rounded-[1.6rem] ring-1", signal ? "bg-accent text-on-accent ring-accent" : "bg-raised text-fg ring-line", className)}>
      <CourseArt index={index} image={course.coverImageUrl} className="m-2 mb-0 h-44 rounded-[1.2rem]">
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-raised/90 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-fg backdrop-blur">{course.category}</span>
          <span className="rounded-full bg-raised/90 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-fg backdrop-blur">{course.level}</span>
        </div>
        <span aria-hidden className="absolute bottom-1 right-3 text-[3.4rem] font-bold leading-none tracking-[-0.06em] text-white transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1">
          {String(index + 1).padStart(2, "0")}
        </span>
      </CourseArt>
      <div className="flex flex-1 flex-col p-6">
        <p className={cn("text-[0.68rem] font-medium uppercase tracking-[0.12em]", signal ? "text-on-accent/80" : "text-muted")}>
          {s.lessonCount} lessons · {formatMinutes(s.durationSeconds)} · {course.priceCents === 0 ? "Free" : formatPrice(course.priceCents, course.currency)}
        </p>
        <H className="mt-2 text-[1.35rem] font-semibold leading-[1.1] tracking-[-0.035em]">{course.title}</H>
        <p className={cn("mt-3 line-clamp-3 text-sm leading-relaxed", signal ? "text-on-accent/85" : "text-muted")}>{course.subtitle}</p>
        <ul className={cn("mt-5 grid grid-cols-2 gap-x-3 gap-y-2 text-[0.78rem]", signal ? "text-on-accent/90" : "text-muted")}>
          <li className="flex items-center gap-2"><Clock size={14} className={signal ? undefined : "text-accent-ink"} aria-hidden /> Short lessons</li>
          <li className="flex items-center gap-2"><Lightbulb size={14} className={signal ? undefined : "text-accent-ink"} aria-hidden /> {s.interactionCount} checkpoints</li>
          <li className="flex items-center gap-2"><BookOpen size={14} className={signal ? undefined : "text-accent-ink"} aria-hidden /> Self-paced</li>
          <li className="flex items-center gap-2"><Users size={14} className={signal ? undefined : "text-accent-ink"} aria-hidden /> Private reflections</li>
        </ul>
        <Link
          href={href ?? `/courses/${course.slug}`}
          className={cn(
            "mt-6 inline-flex h-12 items-center justify-between rounded-[0.9rem] px-5 text-[0.8125rem] font-semibold transition-colors",
            signal ? "bg-raised text-accent-ink hover:bg-bg" : "bg-fg text-bg hover:bg-fg/85",
          )}
        >
          View course <ArrowUpRight size={15} aria-hidden className="arrow-nudge" />
          <span className="sr-only">: {course.title}</span>
        </Link>
      </div>
    </article>
  );
}
