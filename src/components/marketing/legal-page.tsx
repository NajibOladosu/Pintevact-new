export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { heading: string; body: string[] }[] }) {
  return (
    <div className="shell pt-8 sm:pt-14">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="eyebrow text-accent-ink">The essentials</span>
          <h1 className="h-section mt-6">{title}</h1>
          <p className="mt-5 text-sm text-muted">Last updated {updated}</p>
        </div>
        <div className="rounded-[2rem] bg-raised p-7 ring-1 ring-line sm:p-12">
          {sections.map((s, i) => (
            <section key={s.heading} className="border-b border-line py-8 first:pt-0 last:border-b-0 last:pb-0">
              <h2 className="flex items-baseline gap-4 text-xl font-semibold tracking-[-0.025em]">
                <span className="text-xs text-accent-ink tabular">{String(i + 1).padStart(2, "0")}</span>
                {s.heading}
              </h2>
              {s.body.map((p, j) => (
                <p key={j} className="mt-3 pl-8 leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
