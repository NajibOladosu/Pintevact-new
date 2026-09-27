import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { Course } from "@/lib/types";

export type CourseAccessState = "guest" | "owned" | "locked";

/** The call-to-action block for a course, adapting to the visitor's access. */
export function PurchasePanel({ course, state, firstLessonHref }: { course: Course; state: CourseAccessState; firstLessonHref: string }) {
  const learnHref = `/learn/${course.slug}`;
  const free = course.priceCents === 0;
  return (
    <div className="rounded-[2rem] border-2 border-ink bg-paper p-6 shadow-hard-lg">
      <p className="eyebrow text-ink-3">{free ? "Free course" : "Lifetime access"}</p>
      <p className="mt-1 font-display text-5xl">{formatPrice(course.priceCents, course.currency)}</p>
      <div className="mt-6 flex flex-col gap-3">
        {state === "owned" ? (
          <Link href={learnHref} className={buttonClasses({ size: "lg" })}>
            Continue learning →
          </Link>
        ) : state === "guest" ? (
          <>
            <Link href={`/signup?next=${encodeURIComponent(free ? learnHref : `/courses/${course.slug}`)}`} className={buttonClasses({ size: "lg" })}>
              {free ? "Start free now" : `Get ${course.title}`}
            </Link>
            <Link href={`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`} className="text-center text-sm font-semibold underline underline-offset-4">
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
            <Link href="/pricing" className={buttonClasses({ variant: "outline", size: "md" })}>
              Or unlock everything with All-Access
            </Link>
            <Link href={firstLessonHref} className="text-center text-sm font-semibold underline underline-offset-4">
              Watch a free preview lesson
            </Link>
          </>
        )}
      </div>
      <ul className="mt-6 space-y-2 border-t border-ink/10 pt-5 text-sm text-ink-2">
        {["Interactive video lessons", "Private Reflection Vault", "Timestamped notes", "Certificate of completion", free ? "Free forever" : "30-day money-back guarantee"].map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check size={16} className="text-ember" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
