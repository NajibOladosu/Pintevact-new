import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";
import { siteConfig } from "@/lib/site";

const columns = [
  {
    title: "Discover",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/courses/meet-your-mind", label: "The free course" },
      { href: "/discover", label: "Mind quiz" },
      { href: "/journal", label: "Journal" },
    ],
  },
  {
    title: "Your learning",
    links: [
      { href: "/dashboard", label: "My learning" },
      { href: "/pricing", label: "Membership" },
      { href: "/about", label: "About Pintevact" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "The essentials",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/contact?topic=teams", label: "For teams" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 overflow-hidden border-t border-line sm:mt-32">
      <div className="shell">
        <p aria-hidden className="wordmark select-none whitespace-nowrap pb-6 pt-16 text-[15.2vw] font-bold uppercase leading-[0.8] tracking-[-0.045em] sm:pt-24 2xl:text-[13.4rem]">
          Pintevact
        </p>
        <div className="grid grid-cols-1 gap-12 pb-14 pt-10 lg:grid-cols-[1.1fr_1.6fr] lg:gap-20">
          <div className="max-w-sm">
            <p className="h-sub">Learn the psychology of you.</p>
            <p className="mt-4 text-muted">Short video lessons that stop to ask about your life. One idea from psychology in your inbox every Thursday.</p>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="eyebrow text-subtle">{col.title}</h2>
                <ul className="mt-6 space-y-3.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[0.9375rem] text-fg transition-colors hover:text-accent-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-line py-7 text-[0.8125rem] tracking-[0.02em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Pintevact</span>
          <div className="flex gap-6">
            <a href={siteConfig.social.instagram} className="hover:text-fg">Instagram</a>
            <a href={siteConfig.social.youtube} className="hover:text-fg">YouTube</a>
            <a href={siteConfig.social.x} className="hover:text-fg">X</a>
          </div>
          <span>A new way to know yourself.</span>
        </div>
      </div>
    </footer>
  );
}
