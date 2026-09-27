import Link from "next/link";
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
    title: "Company",
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
    <footer className="overflow-hidden border-t border-line">
      <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="max-w-md">
            <h2 className="text-2xl font-semibold tracking-tight">One idea from psychology, every Thursday.</h2>
            <p className="mt-2 text-muted">A short research finding and a two-minute experiment to try on yourself.</p>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-medium text-subtle">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-muted transition-colors hover:text-fg">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-line py-6 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Pintevact</span>
          <div className="flex gap-5">
            <a href={siteConfig.social.instagram} className="hover:text-fg">Instagram</a>
            <a href={siteConfig.social.youtube} className="hover:text-fg">YouTube</a>
            <a href={siteConfig.social.x} className="hover:text-fg">X</a>
          </div>
        </div>
      </div>
      <p aria-hidden className="wordmark -mb-[0.2em] select-none text-center text-[17.5vw] leading-[0.8] tracking-[0.02em] text-fg/[0.07] lg:text-[13.6rem]">
        Pintevact
      </p>
    </footer>
  );
}
