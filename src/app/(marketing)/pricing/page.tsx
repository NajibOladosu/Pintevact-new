import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { Faq } from "@/components/marketing/faq";
import { getCourses, getStore, getViewer } from "@/lib/data";
import { hasActiveSubscription } from "@/lib/access";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start free, buy a single course, or unlock every Pintevact course with All-Access.",
};

const faqs = [
  { q: "Is the free course really free?", a: "Yes. Meet Your Mind is free forever, no card required. You also get preview lessons from every paid course." },
  { q: "What's the difference between buying a course and All-Access?", a: "Buying a course gives you lifetime access to that one course. All-Access unlocks every course we have, and every course we release, for as long as your membership is active." },
  { q: "Can I cancel my membership?", a: "Anytime, in one click from Account → Billing. You keep access until the end of your billing period, and your reflections, notes and certificates stay yours." },
  { q: "Do you offer refunds?", a: "Single-course purchases come with a 30-day money-back guarantee. Just reply to your receipt email." },
  { q: "Is this therapy?", a: "No. Pintevact is psychology education grounded in research. It can complement therapy, but it isn't a substitute for professional mental-health care. If you're struggling, please reach out to a licensed professional." },
  { q: "Do you offer team or student pricing?", a: "Yes, contact us and we'll set you up with team seats or an education discount." },
];

export default async function PricingPage() {
  const [viewer, courses] = await Promise.all([getViewer(), getCourses()]);
  const access = viewer ? await getStore().getAccess(viewer.id) : null;
  const minCoursePrice = Math.min(...courses.filter((c) => c.priceCents > 0).map((c) => c.priceCents));
  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-14 sm:px-8 md:pt-20">
      <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight sm:text-5xl">Start free. Pay when you want to go further.</h1>
      <Link href={viewer ? "/learn/meet-your-mind" : "/signup"} className="group mt-10 flex flex-col gap-2 rounded-2xl border border-line bg-raised p-6 transition-colors hover:border-line-strong sm:flex-row sm:items-center sm:justify-between">
        <span>
          <span className="block font-semibold">Meet Your Mind is free, for good.</span>
          <span className="text-sm text-muted">Four lessons, plus a free preview lesson from every other course. No card needed.</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium">
          {viewer ? "Go to the free course" : "Start free"} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
      <div className="mt-5">
        <PricingPlans signedIn={Boolean(viewer)} isMember={access ? hasActiveSubscription(access) : false} minCoursePrice={Number.isFinite(minCoursePrice) ? minCoursePrice : 0} />
      </div>
      <section className="mt-24">
        <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
        <div className="mt-6">
          <Faq items={faqs} />
        </div>
      </section>
    </div>
  );
}
