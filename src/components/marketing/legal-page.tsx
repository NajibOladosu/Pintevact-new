export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { heading: string; body: string[] }[] }) {
  return (
    <div className="mx-auto max-w-[44rem] px-5 pb-24 pt-14 sm:px-8 md:pt-20">
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-subtle">Last updated {updated}</p>
      <div className="mt-12 space-y-10">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-lg font-semibold">{s.heading}</h2>
            {s.body.map((p, j) => (
              <p key={j} className="mt-3 leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
