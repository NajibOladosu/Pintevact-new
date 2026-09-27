import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { Constellation } from "@/components/brand/constellation";
import { getCourses } from "@/lib/data";

export const metadata: Metadata = { title: "About", description: "Why we built Pintevact: psychology education that talks back." };

const beliefs = [
  { n: "01", title: "Self-knowledge is a skill.", body: "Not a personality trait you're born with. It can be taught, practised and measured — so we built a place to do exactly that." },
  { n: "02", title: "Watching isn't learning.", body: "Passive video creates the illusion of competence. Retrieval, reflection and self-reference create the real thing." },
  { n: "03", title: "Psychology belongs to everyone.", body: "The research that explains your mind shouldn't be locked in journals or therapy rooms. It should be in your pocket." },
  { n: "04", title: "Kindness is a performance strategy.", body: "The data is clear: self-compassion drives growth better than self-criticism. We design every lesson with that in mind." },
];

export default async function AboutPage() {
  const courses = await getCourses();
  const instructors = Array.from(new Map(courses.map((c) => [c.instructor.name, c.instructor])).values());
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8">
        <p className="eyebrow text-ember">About Pintevact</p>
        <h1 className="text-balance mt-4 max-w-5xl text-6xl leading-[0.92] sm:text-8xl">
          We believe the most important course you&apos;ll ever take is <span className="display-italic text-ember">you.</span>
        </h1>
        <div className="mt-12 grid gap-10 text-lg leading-relaxed text-ink-2 lg:grid-cols-2">
          <p>
            Pintevact (from <em>pint</em>, to paint, and <em>evact</em>, to draw out) started with a frustration: people were spending hours watching psychology content and changing nothing. The insight felt good in the moment, then evaporated.
          </p>
          <p>
            So we built a different kind of classroom — one where the video stops and asks you a question, where your answers become a private map of your mind, and where progress is measured in understanding, not minutes watched.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night text-paper">
        <Constellation className="absolute inset-0 h-full w-full text-mist" count={40} seed={5} />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <h2 className="text-5xl sm:text-6xl">What we believe</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 md:grid-cols-2">
            {beliefs.map((b) => (
              <div key={b.n} className="bg-night p-8 sm:p-10">
                <p className="font-mono text-lucid">{b.n}</p>
                <h3 className="mt-4 text-3xl italic">{b.title}</h3>
                <p className="mt-3 text-mist">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <p className="eyebrow text-ember">The guides</p>
        <h2 className="mt-4 text-5xl sm:text-6xl">Researchers who can actually teach.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {instructors.map((i) => (
            <div key={i.name} className="rounded-[2rem] border-2 border-ink bg-paper p-6">
              <Avatar name={i.name} size={72} />
              <h3 className="mt-5 text-2xl">{i.name}</h3>
              <p className="eyebrow mt-1 text-ink-3">{i.title}</p>
              <p className="mt-3 text-ink-2">{i.bio}</p>
            </div>
          ))}
        </div>
        <div className="mt-20 flex flex-col items-start justify-between gap-6 rounded-[2rem] border-2 border-ink bg-lucid p-8 sm:flex-row sm:items-center sm:p-12">
          <p className="max-w-xl font-display text-4xl leading-tight">Ready to meet the most interesting person you know?</p>
          <Link href="/signup" className={buttonClasses({ variant: "ink", size: "lg" })}>
            Start free
          </Link>
        </div>
      </section>
    </>
  );
}
