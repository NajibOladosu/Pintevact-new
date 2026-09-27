import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Questions, team plans or just a hello. We read every message." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-5 pb-24 pt-14 sm:px-8 md:pt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Contact</h1>
        <p className="mt-4 text-lg text-muted">A person reads every message and replies within one or two working days.</p>
        <dl className="mt-10 space-y-6 text-sm">
          <div>
            <dt className="text-subtle">Email</dt>
            <dd className="mt-1">
              <a href={`mailto:${siteConfig.email}`} className="font-medium underline decoration-line-strong hover:decoration-fg">
                {siteConfig.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-subtle">Teams and organisations</dt>
            <dd className="mt-1 text-muted">Seats, onboarding and reporting for groups of five or more.</dd>
          </div>
          <div>
            <dt className="text-subtle">Stuck on a lesson?</dt>
            <dd className="mt-1 text-muted">Tell us which one and what happened.</dd>
          </div>
        </dl>
      </div>
      <ContactForm defaultTopic={topic} />
    </div>
  );
}
