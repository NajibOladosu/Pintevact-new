export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y-2 divide-ink/10 rounded-[2rem] border-2 border-ink bg-paper">
      {items.map((item) => (
        <details key={item.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between gap-6 text-lg font-semibold">
            {item.q}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink-2">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
