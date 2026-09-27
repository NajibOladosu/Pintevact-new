"use client";

import { useEffect, useState } from "react";

const quotes = [
  { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", by: "Viktor Frankl (attrib.)" },
  { text: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", by: "Carl Jung (attrib.)" },
  { text: "The curious paradox is that when I accept myself just as I am, then I can change.", by: "Carl Rogers" },
  { text: "Nothing in life is as important as you think it is, while you are thinking about it.", by: "Daniel Kahneman" },
];

export function AuthQuote() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % quotes.length), 7000);
    return () => clearInterval(id);
  }, []);
  const q = quotes[i];
  return (
    <figure key={i} className="animate-rise">
      <blockquote className="font-display text-3xl italic leading-snug text-paper xl:text-4xl">“{q.text}”</blockquote>
      <figcaption className="eyebrow mt-6 text-lucid">— {q.by}</figcaption>
    </figure>
  );
}
