import { CaretDown } from "@/components/icons";

/** Numbered accordion, as on pintevact.com: orange index, question, chevron. */
export function Faq({ items, defaultOpen = 0 }: { items: { q: string; a: string }[]; defaultOpen?: number | null }) {
  return (
    <div>
      {items.map((item, i) => (
        <details key={item.q} open={i === defaultOpen} className="group border-b border-line last:border-b-0 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center gap-5 py-6 text-[1.05rem] font-medium tracking-[-0.01em] sm:text-lg">
            <span className="w-6 shrink-0 text-xs font-semibold text-accent-ink tabular">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1">{item.q}</span>
            <CaretDown size={16} className="shrink-0 text-muted transition-transform duration-300 group-open:rotate-180" aria-hidden />
          </summary>
          <p className="max-w-[62ch] pb-7 pl-11 leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Violet statement block beside a panel of questions. */
export function FaqSection({ items, title = "Curious? Good.", lead = "A few useful answers before your first lesson." }: { items: { q: string; a: string }[]; title?: string; lead?: string }) {
  return (
    <section className="shell mt-24 sm:mt-32">
      <div className="grid gap-3 lg:grid-cols-[0.56fr_1fr]">
        <div className="flex flex-col rounded-[2.4rem] bg-violet p-9 text-on-violet sm:p-14">
          <h2 className="h-section max-w-[8ch]">{title}</h2>
          <p className="mt-6 max-w-[28ch] text-lg leading-relaxed text-on-violet-muted">{lead}</p>
        </div>
        <div className="rounded-[2.4rem] bg-raised px-6 py-4 ring-1 ring-line sm:px-10 sm:py-6">
          <Faq items={items} />
        </div>
      </div>
    </section>
  );
}
