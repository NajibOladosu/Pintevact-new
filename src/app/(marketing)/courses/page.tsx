import type { Metadata } from "next";
import { CourseBrowser } from "@/components/marketing/course-browser";
import { getCourses } from "@/lib/data";
import { summarizeCourse } from "@/lib/course";

export const metadata: Metadata = {
  title: "Courses",
  description: "Interactive psychology courses on emotions, influence, habits, relationships, focus and self-knowledge.",
};

export default async function CoursesPage() {
  const courses = (await getCourses()).map(summarizeCourse);
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow text-ember">The catalog</p>
        <h1 className="text-balance mt-4 text-6xl leading-[0.95] sm:text-7xl">
          Pick the part of your mind you want to <span className="display-italic">meet next.</span>
        </h1>
        <p className="mt-6 text-lg text-ink-2">Every course is interactive, evidence-based and designed to be finished. Start with the free course, or dive straight into what&apos;s calling you.</p>
      </header>
      <div className="mt-12">
        <CourseBrowser courses={courses} />
      </div>
    </div>
  );
}
