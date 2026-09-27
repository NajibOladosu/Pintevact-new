import type { Metadata } from "next";
import { Mail, MessageCircle, Users } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Questions, team plans or just a hello — we read every message." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  return (
    <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div>
        <p className="eyebrow text-ember">Contact</p>
        <h1 className="mt-4 text-6xl leading-[0.95] sm:text-7xl">
          Talk to a <span className="display-italic">human.</span>
        </h1>
        <p className="mt-6 text-lg text-ink-2">We read every message and reply within one or two working days.</p>
        <ul className="mt-10 space-y-5">
          {[
            { icon: Mail, title: "Email", body: siteConfig.email },
            { icon: Users, title: "Teams & organisations", body: "Seats, onboarding and reporting for groups of 5+" },
            { icon: MessageCircle, title: "Course questions", body: "Stuck on a lesson? Tell us which one." },
          ].map((i) => (
            <li key={i.title} className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-ink bg-lucid">
                <i.icon size={20} />
              </span>
              <span>
                <span className="block font-semibold">{i.title}</span>
                <span className="text-ink-2">{i.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <ContactForm defaultTopic={topic} />
    </div>
  );
}
