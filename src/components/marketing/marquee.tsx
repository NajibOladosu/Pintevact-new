/** A slow band of what's inside a lesson. Pauses on hover; still under reduced motion. */
export function Marquee({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-10 whitespace-nowrap">
          <span className="text-[clamp(2.2rem,5vw,4.4rem)] font-semibold tracking-[-0.045em] text-transparent [-webkit-text-stroke:1.5px_var(--fg)] transition-colors duration-300 hover:text-fg">{item}</span>
          <span aria-hidden className="h-3 w-3 shrink-0 rounded-full bg-accent" />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Inside every lesson" className="marquee mt-12 overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] sm:mt-16">
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
