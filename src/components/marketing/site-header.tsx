import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";
import { getViewer } from "@/lib/data";
import { MobileMenu } from "./mobile-menu";

export const marketingNav = [
  { href: "/courses", label: "Courses" },
  { href: "/discover", label: "Mind Quiz" },
  { href: "/pricing", label: "Pricing" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const viewer = await getViewer().catch(() => null);
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {marketingNav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-[0.95rem] font-medium text-ink-2 transition hover:bg-ink/5 hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {viewer ? (
            <Link href="/dashboard" className={buttonClasses({ variant: "primary", size: "sm" })}>
              My dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonClasses({ variant: "ghost", size: "sm" })}>
                Sign in
              </Link>
              <Link href="/signup" className={buttonClasses({ variant: "primary", size: "sm" })}>
                Start free
              </Link>
            </>
          )}
        </div>
        <MobileMenu items={marketingNav} signedIn={Boolean(viewer)} />
      </div>
    </header>
  );
}
