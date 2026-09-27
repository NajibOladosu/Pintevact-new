import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { CourseCover } from "@/components/course/course-cover";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth/session";
import { getLearnerSnapshot } from "@/lib/learner";
import { summarizeCourse } from "@/lib/course";
import { formatMinutes, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "My courses" };

export default async function LearnPage() {
  const viewer = await requireViewer();
  const snap = await getLearnerSnapshot(viewer.id);
  const available = snap.recommended.filter((c) => snap.canAccess(c));
  const locked = snap.recommended.filter((c) => !snap.canAccess(c));
  return (
    <div className="mx-auto max-w-6xl">
      <p className="eyebrow text-lucid">Library</p>
      <h1 className="mt-2 text-5xl sm:text-6xl">My courses</h1>

      {snap.enrolled.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {snap.enrolled.map((e) => {
            const done = e.progress.total > 0 && e.progress.completed === e.progress.total;
            const cert = snap.certificates.find((c) => c.courseId === e.course.id);
            return (
              <div key={e.course.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-night-2">
                <CourseCover theme={e.course.theme} glyph={e.course.glyph} className="h-36" />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-2xl">{e.course.title}</h2>
                    {done ? <Badge tone="lucid">Complete</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-mist">
                    {e.progress.completed}/{e.progress.total} lessons · {e.progress.percent}%
                  </p>
                  <Progress value={e.progress.percent} className="mt-3" label={`${e.course.title} progress`} />
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={`/learn/${e.course.slug}`} className={buttonClasses({ variant: done ? "subtle" : "lucid", size: "sm" })}>
                      {done ? "Review course" : e.progress.completed ? "Continue" : "Start"} <ArrowRight size={14} />
                    </Link>
                    {cert ? (
                      <Link href={`/certificates/${cert.id}`} className={buttonClasses({ variant: "subtle", size: "sm" })}>
                        <Award size={14} /> Certificate
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-[2rem] border border-dashed border-white/15 p-10 text-center">
          <p className="font-display text-3xl italic">Your library is empty — for now.</p>
          <Link href="/learn/meet-your-mind" className={buttonClasses({ variant: "lucid", className: "mt-6" })}>
            Start the free course
          </Link>
        </div>
      )}

      {available.length ? (
        <section className="mt-16">
          <h2 className="text-3xl">Ready when you are</h2>
          <p className="mt-1 text-mist">Included with your access — start any time.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {available.map((c) => (
              <Link key={c.id} href={`/learn/${c.slug}`} className="group rounded-3xl border border-white/10 bg-night-2 p-5 transition hover:border-lucid/40">
                <CourseCover theme={c.theme} glyph={c.glyph} size="sm" className="h-24 rounded-2xl" />
                <p className="mt-4 text-xl font-semibold group-hover:text-lucid">{c.title}</p>
                <p className="mt-1 text-sm text-mist">{formatMinutes(summarizeCourse(c).durationSeconds)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {locked.length ? (
        <section className="mt-16">
          <h2 className="text-3xl">Explore more</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {locked.map((c) => (
              <Link key={c.id} href={`/courses/${c.slug}`} className="group rounded-3xl border border-white/10 bg-night-2 p-5 transition hover:border-lucid/40">
                <CourseCover theme={c.theme} glyph={c.glyph} size="sm" className="h-24 rounded-2xl opacity-80" />
                <p className="mt-4 text-xl font-semibold group-hover:text-lucid">{c.title}</p>
                <p className="mt-1 text-sm text-mist">
                  {c.category} · {formatPrice(c.priceCents)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
