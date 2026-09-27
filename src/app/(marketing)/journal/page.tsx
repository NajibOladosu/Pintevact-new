import type { Metadata } from "next";
import Link from "next/link";
import { journal } from "@/content/journal";
import { themeClasses } from "@/lib/course";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Journal", description: "Short, research-backed essays on the psychology of everyday life." };

export default function JournalPage() {
  const [lead, ...rest] = journal;
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow text-ember">The Journal</p>
        <h1 className="mt-4 text-6xl leading-[0.95] sm:text-7xl">
          Field notes from the <span className="display-italic">inner</span> world.
        </h1>
      </header>
      <Link href={`/journal/${lead.slug}`} className="group mt-14 grid overflow-hidden rounded-[2rem] border-2 border-ink bg-paper transition hover:shadow-hard-lg lg:grid-cols-2">
        <div className={cn("relative min-h-64 border-b-2 border-ink lg:border-b-0 lg:border-r-2", themeClasses[lead.theme].bg)}>
          <p className="absolute bottom-6 left-6 right-6 font-display text-5xl italic leading-none sm:text-6xl">“{lead.excerpt}”</p>
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <p className="eyebrow text-ink-3">
            {lead.category} · {lead.readingMinutes} min read
          </p>
          <h2 className="mt-3 text-4xl leading-tight transition group-hover:text-ember">{lead.title}</h2>
          <p className="mt-4 text-ink-2">
            {lead.author} · {formatDate(lead.publishedAt)}
          </p>
        </div>
      </Link>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {rest.map((p) => (
          <Link key={p.slug} href={`/journal/${p.slug}`} className="group flex flex-col rounded-[2rem] border-2 border-ink bg-paper p-7 transition hover:-translate-y-1 hover:shadow-hard">
            <span className={cn("h-3 w-16 rounded-full border-2 border-ink", themeClasses[p.theme].bg)} />
            <p className="eyebrow mt-6 text-ink-3">
              {p.category} · {p.readingMinutes} min
            </p>
            <h2 className="mt-3 text-2xl leading-snug transition group-hover:text-ember">{p.title}</h2>
            <p className="mt-3 flex-1 text-ink-2">{p.excerpt}</p>
            <p className="mt-6 text-sm text-ink-3">{formatDate(p.publishedAt)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
