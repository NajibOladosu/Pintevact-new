"use client";

import { useEffect, useState } from "react";

export function WordCycler({ words, interval = 2200 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);
  return (
    <span className="relative inline-grid align-baseline">
      {/* Reserve width of the longest word to avoid layout shift */}
      <span className="invisible col-start-1 row-start-1" aria-hidden>
        {words.reduce((a, b) => (b.length > a.length ? b : a))}
      </span>
      <span key={i} className="display-italic col-start-1 row-start-1 animate-rise text-ember" aria-live="polite">
        {words[i]}
      </span>
    </span>
  );
}
