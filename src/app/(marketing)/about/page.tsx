import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { getCourses } from "@/lib/data";

export const metadata: Metadata = { title: "About", description: "Why Pintevact exists: psychology lessons that ask about your life." };

const beliefs = [
  { title: "Self-knowledge is a skill.", body: "It is not a trait you are born with. It can be taught, practised and noticed improving." },
  { title: "Watching is not learning.", body: "Passive video feels productive and fades fast. Answering, recalling and relating an idea to your own life is what makes it stay." },
  { title: "Psychology belongs to everyone.", body: "The research that explains your mind should not live only in journals and therapy rooms." },
  { title: "Kindness works better.", body: "Self-compassion drives change more reliably than self-criticism, so every lesson is written with that in mind." },
];

export default async function AboutPage() {
  const courses = await getCourses();
  const instructors = Array.from(new Map(courses.map((c) => [c.instructor.name, c.instructor])).values());
  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-14 sm:px-8 md:pt-20">
      <h1 className="max-w-[18ch] text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">We built the psychology class that asks about you.</h1>
      <div className="mt-10 grid max-w-4xl gap-6 text-lg leading-relaxed text-muted md:grid-cols-2">
        <p>People spend hours on psychology podcasts and videos and change very little. The insight feels good for a moment, then it is gone.</p>
        <p>Pintevact lessons stop and ask a question about your own life. Your answers become a private record you can look back on, and progress is measured by what you understand, not minutes watched.</p>
      </div>

      <section className="mt-24">
        <h2 className="text-2xl font-semibold tracking-tight">What we believe</h2>
        <dl className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {beliefs.map((b) => (
            <div key={b.title} className="border-t border-line pt-5">
              <dt className="text-lg font-semibold">{b.title}</dt>
              <dd className="mt-2 text-muted">{b.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-24">
        <h2 className="text-2xl font-semibold tracking-tight">Who teaches</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {instructors.map((i) => (
            <li key={i.name} className="flex gap-4 rounded-2xl border border-line p-5">
              <Avatar name={i.name} size={44} />
              <div>
                <p className="font-semibold">{i.name}</p>
                <p className="text-sm text-subtle">{i.title}</p>
                <p className="mt-2 text-sm text-muted">{i.bio}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-line pt-10 sm:flex-row sm:items-center">
        <p className="max-w-[28ch] text-2xl font-semibold tracking-tight">The free course takes about half an hour.</p>
        <Link href="/signup" className={buttonClasses({ size: "lg" })}>
          Start free
        </Link>
      </div>
    </div>
  );
}
