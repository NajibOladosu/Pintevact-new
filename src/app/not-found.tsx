import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { Logo } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh p-2 sm:p-4">
      <div className="relative isolate flex flex-col overflow-hidden rounded-[2rem] bg-frame px-6 py-8 text-on-frame sm:rounded-[2.4rem] sm:px-14 sm:py-12">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[url(/art/papercut.webp)] bg-cover bg-[position:20%_50%] opacity-70" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(3_3_9/0.85)_0%,rgb(3_3_9/0.4)_100%)]" />
        <Logo className="text-on-frame" />
        <div className="my-auto py-16">
          <span className="eyebrow text-on-frame-muted">Error 404</span>
          <h1 className="mt-6 max-w-[14ch] text-[clamp(2.8rem,7vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.055em]">This station doesn&apos;t exist.</h1>
          <p className="mt-6 max-w-[42ch] text-lg text-on-frame-muted">The page may have moved, or the link was mistyped.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/" className={buttonClasses({ size: "lg" })}>
              Back home <ArrowUpRight size={15} aria-hidden />
            </Link>
            <Link href="/courses" className={buttonClasses({ variant: "light", size: "lg", className: "rounded-full" })}>
              Browse courses
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
