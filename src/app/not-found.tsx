import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { StationLine } from "@/components/brand/station-line";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-16">
      <Logo />
      <StationLine
        className="mt-16"
        stations={[
          { id: "a", state: "done" },
          { id: "b", state: "done" },
          { id: "c", state: "ahead" },
          { id: "d", state: "ahead" },
        ]}
      />
      <h1 className="mt-10 text-4xl font-semibold tracking-tight sm:text-5xl">This station doesn&apos;t exist.</h1>
      <p className="mt-4 text-lg text-muted">The page may have moved, or the link was mistyped. Error 404.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className={buttonClasses({ variant: "secondary" })}>
          Back home
        </Link>
        <Link href="/courses" className={buttonClasses({ variant: "outline" })}>
          Browse courses
        </Link>
      </div>
    </main>
  );
}
