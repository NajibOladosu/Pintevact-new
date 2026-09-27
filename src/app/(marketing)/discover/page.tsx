import type { Metadata } from "next";
import { MindQuiz } from "@/components/marketing/mind-quiz";
import { PageIntro } from "@/components/marketing/cta-band";
import { getCourses } from "@/lib/data";

export const metadata: Metadata = { title: "Mind quiz", description: "Six questions, two minutes. Find your learning archetype and where to start." };

export default async function DiscoverPage() {
  const courses = await getCourses();
  const titles = Object.fromEntries(courses.map((c) => [c.slug, c.title]));
  return (
    <>
      <PageIntro eyebrow="The mind quiz" title="What kind of mind do you have?" lead="Six quick questions. You'll get a learning archetype and the course that will teach you the most." />
      <div className="shell mt-14 max-w-5xl sm:mt-20">
        <MindQuiz courseTitles={titles} />
      </div>
    </>
  );
}
