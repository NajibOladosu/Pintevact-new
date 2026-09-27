import type { Metadata } from "next";
import Link from "next/link";
import { Award } from "@/components/icons";
import { CourseRow } from "@/components/course/course-row";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireViewer } from "@/lib/auth/session";
import { getLearnerSnapshot } from "@/lib/learner";

export const metadata: Metadata = { title: "My courses" };

export default async function LearnPage() {
  const viewer = await requireViewer();
  const snap = await getLearnerSnapshot(viewer.id);
  const available = snap.recommended.filter((c) => snap.canAccess(c));
  const locked = snap.recommended.filter((c) => !snap.canAccess(c));
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">My courses</h1>

      {snap.enrolled.length ? (
        <div className="-mx-4 mt-8 md:-mx-5">
          {snap.enrolled.map((e) => {
            const cert = snap.certificates.find((c) => c.courseId === e.course.id);
            const finished = e.progress.total > 0 && e.progress.completed === e.progress.total;
            return (
              <div key={e.course.id} className="relative">
                <CourseRow course={e.course} href={`/learn/${e.course.slug}`} completed={snap.completedLessonIds} nextId={e.resume?.id} headingLevel="h2" />
                {finished || cert ? (
                  <div className="-mt-2 flex flex-wrap items-center gap-3 px-4 pb-4 md:px-5 md:pl-[4.75rem]">
                    {finished ? <Badge tone="accent">Complete</Badge> : null}
                    {cert ? (
                      <Link href={`/certificates/${cert.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
                        <Award size={15} /> Certificate
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="text-lg font-medium">No courses yet.</p>
          <p className="mt-1 text-muted">The free course is the best place to start.</p>
          <Link href="/learn/meet-your-mind" className={buttonClasses({ className: "mt-6" })}>
            Start the free course
          </Link>
        </div>
      )}

      {available.length ? (
        <section className="mt-16">
          <h2 className="text-lg font-semibold">Included with your access</h2>
          <div className="-mx-4 mt-3 md:-mx-5">
            {available.map((c) => (
              <CourseRow key={c.id} course={c} href={`/learn/${c.slug}`} />
            ))}
          </div>
        </section>
      ) : null}

      {locked.length ? (
        <section className="mt-16">
          <h2 className="text-lg font-semibold">More courses</h2>
          <div className="-mx-4 mt-3 md:-mx-5">
            {locked.map((c) => (
              <CourseRow key={c.id} course={c} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
