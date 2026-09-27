"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="mx-auto flex min-h-[70dvh] max-w-xl flex-col justify-center px-5">
      <span className="eyebrow text-accent-ink">Something broke</span>
      <h1 className="h-section mt-6">Something went wrong.</h1>
      <p className="mt-4 text-muted">An unexpected error stopped this page from loading. Try again, and if it keeps happening, contact us.</p>
      <Button onClick={reset} size="lg" className="mt-8 self-start">
        Try again
      </Button>
    </main>
  );
}
