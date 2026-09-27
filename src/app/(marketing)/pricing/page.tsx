import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { FaqSection } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";
import { getCourses, getStore, getViewer } from "@/lib/data";
import { hasActiveSubscription } from "@/lib/access";
import { pricingFaqs } from "@/content/faqs";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start free, buy a single course, or unlock every Pintevact course with All-Access.",
};

export default async function PricingPage() {
  const [viewer, courses] = await Promise.all([getViewer(), getCourses()]);
  const access = viewer ? await getStore().getAccess(viewer.id) : null;
  const minCoursePrice = Math.min(...courses.filter((c) => c.priceCents > 0).map((c) => c.priceCents));
  return (
    <>
      <section className="bg-[radial-gradient(60rem_30rem_at_50%_0%,rgb(238_66_23/0.08),transparent_70%)] pt-10 sm:pt-16">
        <div className="shell text-center">
          <span className="eyebrow text-accent-ink">Membership</span>
          <h1 className="h-section mx-auto mt-6 max-w-[15ch]">Start free. Go further when you want.</h1>
          <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">Begin with the free course. When you&apos;re ready for more, buy one course or open all of them with All-Access.</p>
        </div>
        <div className="shell mt-14 max-w-5xl">
          <Link
            href={viewer ? "/learn/meet-your-mind" : "/signup"}
            className="group mb-4 flex flex-col gap-3 rounded-[1.6rem] bg-accent px-7 py-6 text-on-accent transition-colors hover:bg-accent-hover sm:flex-row sm:items-center sm:justify-between"
          >
            <span>
              <span className="block text-lg font-semibold tracking-[-0.02em]">Meet Your Mind is free, for good.</span>
              <span className="text-sm text-on-accent/85">Four lessons, plus a free preview lesson from every other course. No card needed.</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold">
              {viewer ? "Go to the free course" : "Start free"} <ArrowUpRight size={15} aria-hidden className="arrow-nudge" />
            </span>
          </Link>
          <PricingPlans signedIn={Boolean(viewer)} isMember={access ? hasActiveSubscription(access) : false} minCoursePrice={Number.isFinite(minCoursePrice) ? minCoursePrice : 0} />
        </div>
      </section>
      <FaqSection items={pricingFaqs} title="Questions? Good." lead="Everything about plans, refunds and what Pintevact is (and isn't)." />
      <CtaBand />
    </>
  );
}
