import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { ContactForm } from "@/components/marketing/contact-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Questions, team plans or just a hello. We read every message." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  return (
    <div className="shell grid gap-14 pt-8 sm:pt-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
      <div>
        <span className="eyebrow text-muted">Talk to us</span>
        <h1 className="h-section mt-6 max-w-[12ch]">Good things start with a conversation.</h1>
        <p className="mt-7 max-w-[40ch] text-lg leading-relaxed text-muted">A question about learning, a little help with your account, or an idea you would like to share. A person reads every message.</p>
        <div className="mt-12 max-w-sm border-t border-line pt-8">
          <span className="eyebrow text-muted">Before you write</span>
          <p className="mt-5 leading-relaxed text-muted">
            Our{" "}
            <Link href="/pricing" className="text-fg underline decoration-fg/40 underline-offset-4 hover:decoration-fg">
              frequently asked questions
            </Link>{" "}
            may have the answer you need. Teams of five or more can ask about seats and onboarding.
          </p>
          <a href={`mailto:${siteConfig.email}`} className="mt-8 inline-flex items-center gap-3 text-lg text-fg hover:text-accent-ink">
            {siteConfig.email} <ArrowUpRight size={16} className="text-accent-ink" aria-hidden />
          </a>
        </div>
      </div>
      <ContactForm defaultTopic={topic} />
    </div>
  );
}
