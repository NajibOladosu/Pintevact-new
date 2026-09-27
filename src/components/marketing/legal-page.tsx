export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { heading: string; body: string[] }[] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6">
      <p className="eyebrow text-ember">Legal</p>
      <h1 className="mt-4 text-6xl">{title}</h1>
      <p className="mt-3 font-mono text-sm text-ink-3">Last updated {updated}</p>
      <div className="mt-12 space-y-10">
        {sections.map((s, i) => (
          <section key={s.heading}>
            <h2 className="text-2xl">
              <span className="mr-3 font-mono text-base text-ember">{String(i + 1).padStart(2, "0")}</span>
              {s.heading}
            </h2>
            {s.body.map((p, j) => (
              <p key={j} className="mt-3 leading-relaxed text-ink-2">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
