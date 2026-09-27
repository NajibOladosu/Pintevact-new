import type { Metadata } from "next";
import { MindQuiz } from "@/components/marketing/mind-quiz";
import { Blob } from "@/components/brand/blob";
import { getCourses } from "@/lib/data";

export const metadata: Metadata = { title: "Mind Quiz", description: "Six questions. Two minutes. Discover your learning archetype and where to start." };

export default async function DiscoverPage() {
  const courses = await getCourses();
  const titles = Object.fromEntries(courses.map((c) => [c.slug, c.title]));
  return (
    <div className="grain relative overflow-hidden">
      <Blob className="-right-32 top-20 h-96 w-96 bg-ember/30" />
      <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6">
        <header className="max-w-2xl">
          <p className="eyebrow text-ember">The 2-minute mind quiz</p>
          <h1 className="mt-4 text-6xl leading-[0.95] sm:text-7xl">
            What kind of <span className="display-italic">mind</span> do you have?
          </h1>
          <p className="mt-5 text-lg text-ink-2">Six quick questions reveal your learning archetype — and the course that will teach you the most about yourself.</p>
        </header>
        <div className="mt-12">
          <MindQuiz courseTitles={titles} />
        </div>
      </div>
    </div>
  );
}
