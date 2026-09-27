import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Constellation } from "@/components/brand/constellation";
import { NewsletterForm } from "./newsletter-form";
import { siteConfig } from "@/lib/site";

const columns = [
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/courses/meet-your-mind", label: "Free course" },
      { href: "/discover", label: "Mind quiz" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Pintevact",
    links: [
      { href: "/about", label: "About" },
      { href: "/journal", label: "Journal" },
      { href: "/contact", label: "Contact" },
      { href: "/contact?topic=teams", label: "For teams" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-night text-paper">
      <Constellation className="absolute inset-0 h-full w-full text-mist" count={46} seed={11} lineOpacity={0.15} />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow text-lucid">The Pintevact Letter</p>
            <h2 className="mt-4 max-w-xl text-4xl leading-[1.05] sm:text-5xl">
              One psychology insight a week. <span className="display-italic text-ember">Zero fluff.</span>
            </h2>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-mist">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-paper/80 transition hover:text-lucid">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p aria-hidden className="mt-20 select-none font-display text-[18vw] leading-[0.8] tracking-tighter text-white/[0.06] lg:text-[13rem]">
          know thyself
        </p>
        <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <Logo tone="paper" />
          <div className="flex flex-wrap items-center gap-5 text-sm text-mist">
            <a href={siteConfig.social.instagram} className="hover:text-paper">Instagram</a>
            <a href={siteConfig.social.youtube} className="hover:text-paper">YouTube</a>
            <a href={siteConfig.social.x} className="hover:text-paper">X</a>
            <span>© {new Date().getFullYear()} Pintevact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
