import type { Metadata } from "next";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { Faq } from "@/components/marketing/faq";
import { getCourses, getStore, getViewer } from "@/lib/data";
import { hasActiveSubscription } from "@/lib/access";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start free, buy a single course, or unlock every Pintevact course with All-Access.",
};

const faqs = [
  { q: "Is the free course really free?", a: "Yes. Meet Your Mind is free forever — no card required. You also get preview lessons from every paid course." },
  { q: "What's the difference between buying a course and All-Access?", a: "Buying a course gives you lifetime access to that one course. All-Access unlocks every course we have — and every course we release — for as long as your membership is active." },
  { q: "Can I cancel my membership?", a: "Anytime, in one click from Account → Billing. You keep access until the end of your billing period, and your reflections, notes and certificates stay yours." },
  { q: "Do you offer refunds?", a: "Single-course purchases come with a 30-day money-back guarantee. Just reply to your receipt email." },
  { q: "Is this therapy?", a: "No. Pintevact is psychology education grounded in research. It can complement therapy, but it isn't a substitute for professional mental-health care. If you're struggling, please reach out to a licensed professional." },
  { q: "Do you offer team or student pricing?", a: "Yes — contact us and we'll set you up with team seats or an education discount." },
];

export default async function PricingPage() {
  const [viewer, courses] = await Promise.all([getViewer(), getCourses()]);
  const access = viewer ? await getStore().getAccess(viewer.id) : null;
  const minCoursePrice = Math.min(...courses.filter((c) => c.priceCents > 0).map((c) => c.priceCents));
  return (
    <div className="grain relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-ember">Pricing</p>
          <h1 className="text-balance mt-4 text-6xl leading-[0.95] sm:text-7xl">
            Invest in the one asset you can <span className="display-italic">never</span> sell.
          </h1>
          <p className="mt-6 text-lg text-ink-2">Start free. Go deeper when you&apos;re ready. Cancel anytime.</p>
        </header>
        <div className="mt-14">
          <PricingPlans signedIn={Boolean(viewer)} isMember={access ? hasActiveSubscription(access) : false} minCoursePrice={Number.isFinite(minCoursePrice) ? minCoursePrice : 0} />
        </div>
        <section className="mx-auto mt-28 max-w-4xl">
          <h2 className="text-center text-5xl">Questions, answered</h2>
          <div className="mt-10">
            <Faq items={faqs} />
          </div>
        </section>
      </div>
    </div>
  );
}
