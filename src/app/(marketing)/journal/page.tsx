import type { Metadata } from "next";
import Link from "next/link";
import { journal } from "@/content/journal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Journal", description: "Short, research-backed essays on the psychology of everyday life." };

export default function JournalPage() {
  const [lead, ...rest] = journal;
  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-14 sm:px-8 md:pt-20">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Journal</h1>
      <p className="mt-4 max-w-[50ch] text-lg text-muted">Short essays on the psychology of everyday life, each with one thing to try.</p>

      <Link href={`/journal/${lead.slug}`} className="group mt-14 block rounded-2xl bg-violet p-7 text-on-violet sm:p-10">
        <p className="text-sm text-on-violet-muted">
          {lead.category}, {lead.readingMinutes} min read
        </p>
        <h2 className="mt-3 max-w-[22ch] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{lead.title}</h2>
        <p className="mt-4 max-w-[52ch] text-on-violet-muted">{lead.excerpt}</p>
        <p className="mt-8 text-sm">
          {lead.author}, {formatDate(lead.publishedAt)}
        </p>
      </Link>

      <ul className="mt-6">
        {rest.map((p) => (
          <li key={p.slug}>
            <Link href={`/journal/${p.slug}`} className="group grid gap-2 border-b border-line py-7 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8">
              <div>
                <h2 className="text-xl font-semibold tracking-tight group-hover:underline group-hover:decoration-line-strong">{p.title}</h2>
                <p className="mt-2 text-muted">{p.excerpt}</p>
              </div>
              <p className="tabular text-sm text-subtle">
                {p.category}, {p.readingMinutes} min
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
