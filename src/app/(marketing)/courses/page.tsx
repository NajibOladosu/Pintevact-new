import type { Metadata } from "next";
import { CourseBrowser } from "@/components/marketing/course-browser";
import { getCourses } from "@/lib/data";

export const metadata: Metadata = {
  title: "Courses",
  description: "Interactive psychology courses on emotions, influence, habits, relationships, focus and self-knowledge.",
};

export default async function CoursesPage() {
  const courses = await getCourses();
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-14 sm:px-8 md:pt-20">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Courses</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-muted">Each course is a line of short lessons. Start with the free one, or go straight to what you want to understand.</p>
      <div className="mt-12">
        <CourseBrowser courses={courses} />
      </div>
    </div>
  );
}
