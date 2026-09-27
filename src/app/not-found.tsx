import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Constellation } from "@/components/brand/constellation";

export default function NotFound() {
  return (
    <main id="main" className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-night px-4 text-center text-paper">
      <Constellation className="absolute inset-0 h-full w-full text-mist" count={50} seed={404} />
      <p className="eyebrow relative text-lucid">Error 404 · Uncharted territory</p>
      <h1 className="relative mt-6 text-7xl italic sm:text-9xl">Lost in thought?</h1>
      <p className="relative mt-6 max-w-md text-lg text-mist">This page doesn&apos;t exist — but the feeling of being lost is usually the start of finding something.</p>
      <div className="relative mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonClasses({ variant: "lucid" })}>
          Back home
        </Link>
        <Link href="/courses" className={buttonClasses({ variant: "outline", className: "text-paper" })}>
          Browse courses
        </Link>
      </div>
    </main>
  );
}
