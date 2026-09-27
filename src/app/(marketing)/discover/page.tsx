import type { Metadata } from "next";
import { MindQuiz } from "@/components/marketing/mind-quiz";
import { getCourses } from "@/lib/data";

export const metadata: Metadata = { title: "Mind quiz", description: "Six questions, two minutes. Find your learning archetype and where to start." };

export default async function DiscoverPage() {
  const courses = await getCourses();
  const titles = Object.fromEntries(courses.map((c) => [c.slug, c.title]));
  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-14 sm:px-8 md:pt-20">
      <h1 className="max-w-[20ch] text-4xl font-semibold tracking-tight sm:text-5xl">What kind of mind do you have?</h1>
      <p className="mt-4 max-w-[50ch] text-lg text-muted">Six quick questions. You&apos;ll get a learning archetype and the course that will teach you the most.</p>
      <div className="mt-12">
        <MindQuiz courseTitles={titles} />
      </div>
    </div>
  );
}
