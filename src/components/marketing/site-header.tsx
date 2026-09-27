import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getViewer } from "@/lib/data";
import { MobileMenu } from "./mobile-menu";

export const marketingNav = [
  { href: "/courses", label: "Courses" },
  { href: "/discover", label: "Mind quiz" },
  { href: "/pricing", label: "Pricing" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const viewer = await getViewer().catch(() => null);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {marketingNav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-fg">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {viewer ? (
            <Link href="/dashboard" className={buttonClasses({ variant: "secondary", size: "sm" })}>
              Dashboard
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
