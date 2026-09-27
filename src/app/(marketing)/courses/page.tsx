import type { Metadata } from "next";
import { CourseBrowser } from "@/components/marketing/course-browser";
import { CtaBand, PageIntro } from "@/components/marketing/cta-band";
import { getCourses } from "@/lib/data";

export const metadata: Metadata = {
  title: "Courses",
  description: "Interactive psychology courses on emotions, influence, habits, relationships, focus and self-knowledge.",
};

export default async function CoursesPage() {
  const courses = await getCourses();
  return (
    <>
      <PageIntro eyebrow="Our courses" title="Understand something. Change something." lead="Practical psychology. Fresh perspectives. Video lessons that give you space to answer, reflect and grow." />
      <div className="shell mt-14 sm:mt-20">
        <CourseBrowser courses={courses} />
      </div>
      <CtaBand />
    </>
  );
}
