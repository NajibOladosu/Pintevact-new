import type { Metadata } from "next";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { CtaBand, PageIntro } from "@/components/marketing/cta-band";
import { getCourses } from "@/lib/data";

export const metadata: Metadata = { title: "About", description: "Why Pintevact exists: psychology lessons that ask about your life." };

const beliefs = [
  { title: "Self-knowledge is a skill.", body: "It is not a trait you are born with. It can be taught, practised and noticed improving." },
  { title: "Watching is not learning.", body: "Passive video feels productive and fades fast. Answering, recalling and relating an idea to your own life is what makes it stay." },
  { title: "Psychology belongs to everyone.", body: "The research that explains your mind should not live only in journals and therapy rooms." },
  { title: "Kindness works better.", body: "Self-compassion drives change more reliably than self-criticism, so every lesson is written with that in mind." },
];

const steps = [
  { title: "Watch closely.", body: "A short video puts an idea from psychology into a situation you recognise." },
  { title: "Make your move.", body: "Answer a checkpoint, vote in a poll, rate yourself, or put a thought into words." },
  { title: "Take it with you.", body: "Get feedback, keep your reflection, and find one small way to use what you learned." },
];

export default async function AboutPage() {
  const courses = await getCourses();
  const instructors = Array.from(new Map(courses.map((c) => [c.instructor.name, c.instructor])).values());
  return (
    <>
      <PageIntro eyebrow="Why Pintevact exists" title="There is always more to understand." lead="Knowing yourself is not something you finish. It happens in everyday moments: a conversation, a decision, a new way of seeing why you do what you do." />

      <section className="shell mt-24 sm:mt-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <span className="eyebrow text-muted">Our belief</span>
            <h2 className="h-sub mt-6 max-w-[20ch]">Learning about your mind should feel like something you do. Something that is yours.</h2>
            <div className="mt-6 space-y-4 leading-relaxed text-muted">
              <p>People spend hours on psychology podcasts and videos and change very little. The insight feels good for a moment, then it is gone.</p>
              <p>Pintevact lessons stop and ask a question about your own life. Your answers become a private record you can look back on, and progress is measured by what you understand, not minutes watched.</p>
            </div>
          </div>
          <figure data-reveal="frame" className="relative overflow-hidden rounded-[2rem] shadow-frame">
            <Image src="/art/papercut.webp" alt="Layers of cut paper in orange, violet and cream" width={1536} height={1024} className="aspect-[4/5] w-full object-cover object-[80%_50%]" />
            <figcaption className="absolute inset-x-4 bottom-4 rounded-full bg-raised/85 px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-fg backdrop-blur">Make a little space for yourself.</figcaption>
          </figure>
        </div>
      </section>

      <section className="shell mt-24 sm:mt-32">
        <span className="eyebrow text-muted">How learning happens here</span>
        <h2 className="h-section mt-6">A little at a time.</h2>
        <ol data-reveal="list" className="mt-10 grid gap-3 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-[1.6rem] bg-raised p-7 ring-1 ring-line sm:p-8">
              <span className="text-xs font-semibold text-accent-ink tabular">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 text-[1.6rem] font-semibold tracking-[-0.04em]">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="shell mt-24 sm:mt-32">
        <div className="grid gap-3 lg:grid-cols-[0.56fr_1fr]">
          <div className="rounded-[2.4rem] bg-violet p-9 text-on-violet sm:p-14">
            <h2 className="h-section max-w-[9ch]">What we believe.</h2>
          </div>
          <dl className="grid gap-x-10 rounded-[2.4rem] bg-raised px-8 py-4 ring-1 ring-line sm:grid-cols-2 sm:px-12 sm:py-8">
            {beliefs.map((b, i) => (
              <div key={b.title} className="border-b border-line py-6 last:border-b-0 sm:[&:nth-child(3)]:border-b-0">
                <dt className="flex items-baseline gap-3 text-lg font-semibold tracking-[-0.02em]">
                  <span className="text-xs text-accent-ink tabular">{String(i + 1).padStart(2, "0")}</span>
                  {b.title}
                </dt>
                <dd className="mt-2 pl-7 text-sm leading-relaxed text-muted">{b.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="shell mt-24 sm:mt-32">
        <span className="eyebrow text-muted">Who teaches</span>
        <h2 className="h-section mt-6">Your guides.</h2>
        <ul data-reveal="list" className="mt-10 grid gap-3 sm:grid-cols-2">
          {instructors.map((i) => (
            <li key={i.name} className="flex gap-5 rounded-[1.6rem] bg-raised p-7 ring-1 ring-line">
              <Avatar name={i.name} size={52} />
              <div>
                <p className="text-lg font-semibold tracking-[-0.02em]">{i.name}</p>
                <p className="text-sm text-muted">{i.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{i.bio}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand />
    </>
  );
}
