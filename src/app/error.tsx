"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow text-ember">Something slipped</p>
      <h1 className="mt-4 text-6xl italic">Even minds glitch.</h1>
      <p className="mt-4 max-w-md text-ink-2">An unexpected error occurred. Take a breath — then try again.</p>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </main>
  );
}
