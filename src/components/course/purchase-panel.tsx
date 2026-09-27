import Link from "next/link";
import { Check, Lock } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { Course } from "@/lib/types";

export type CourseAccessState = "guest" | "owned" | "locked";

/** The call to action for a course, adapting to the visitor's access. */
export function PurchasePanel({ course, state, firstLessonHref }: { course: Course; state: CourseAccessState; firstLessonHref: string }) {
  const learnHref = `/learn/${course.slug}`;
  const free = course.priceCents === 0;
  return (
    <div className="rounded-2xl border border-line bg-raised p-6">
      <p className="text-sm text-subtle">{free ? "Free course" : "One-time purchase, yours to keep"}</p>
      <p className="tabular mt-1 text-4xl font-semibold tracking-tight">{formatPrice(course.priceCents, course.currency)}</p>
      <div className="mt-6 grid gap-2.5">
        {state === "owned" ? (
          <Link href={learnHref} className={buttonClasses({ size: "lg" })}>
            Continue learning
          </Link>
        ) : state === "guest" ? (
          <>
            <Link href={`/signup?next=${encodeURIComponent(free ? learnHref : `/courses/${course.slug}`)}`} className={buttonClasses({ size: "lg" })}>
              {free ? "Start free" : `Get ${course.title}`}
            </Link>
            <Link href={`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`} className="py-2 text-center text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
              Already a member? Sign in
            </Link>
          </>
        ) : (
          <>
            <form action="/api/stripe/checkout" method="post">
              <input type="hidden" name="mode" value="course" />
              <input type="hidden" name="courseSlug" value={course.slug} />
              <button type="submit" className={buttonClasses({ size: "lg", className: "w-full" })}>
                <Lock size={16} /> Buy for {formatPrice(course.priceCents, course.currency)}
              </button>
            </form>
            <Link href="/pricing" className={buttonClasses({ variant: "outline" })}>
              Or get every course with All-Access
            </Link>
            <Link href={firstLessonHref} className="py-2 text-center text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
              Watch the free preview lesson
            </Link>
          </>
        )}
      </div>
      <ul className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm text-muted">
        {["Interactive video lessons", "Private reflection vault", "Timestamped notes", "Certificate when you finish", free ? "Free forever" : "30-day money-back guarantee"].map((f) => (
          <li key={f} className="flex items-center gap-2.5">
            <Check size={15} className="text-accent-ink" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
