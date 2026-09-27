import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { PageIntro } from "@/components/marketing/cta-band";
import { CourseArt } from "@/components/course/course-card";
import { journal } from "@/content/journal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Journal", description: "Short, research-backed essays on the psychology of everyday life." };

export default function JournalPage() {
  const [lead, ...rest] = journal;
  return (
    <>
      <PageIntro eyebrow="The journal" title="Small ideas. Everyday minds." lead="Short essays on the psychology of everyday life, each with one thing to try." />
      <div className="shell mt-14 sm:mt-20">
        <Link href={`/journal/${lead.slug}`} className="group grid overflow-hidden rounded-[2.4rem] bg-violet text-on-violet shadow-frame lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col p-8 sm:p-14">
            <span className="eyebrow text-on-violet-muted">
              {lead.category} · {lead.readingMinutes} min read
            </span>
            <h2 className="h-section mt-6 max-w-[16ch] text-[clamp(2rem,3.6vw,3.4rem)]">{lead.title}</h2>
            <p className="mt-6 max-w-[48ch] leading-relaxed text-on-violet-muted">{lead.excerpt}</p>
            <p className="mt-auto flex items-center gap-3 pt-10 text-sm">
              {lead.author}, {formatDate(lead.publishedAt)}
              <ArrowUpRight size={16} className="text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </p>
          </div>
          <CourseArt index={3} className="m-2 min-h-64 rounded-[2rem]" />
        </Link>

        <ul className="mt-10 border-t border-line">
          {rest.map((p, i) => (
            <li key={p.slug}>
              <Link href={`/journal/${p.slug}`} className="group grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-line py-8 sm:grid-cols-[3.5rem_1fr_auto] sm:items-baseline sm:gap-x-8">
                <span className="text-lg font-semibold text-accent-ink tabular">{String(i + 2).padStart(2, "0")}</span>
                <div>
                  <h2 className="text-[1.5rem] font-semibold leading-tight tracking-[-0.035em] group-hover:text-accent-ink">{p.title}</h2>
                  <p className="mt-2 max-w-[60ch] text-muted">{p.excerpt}</p>
                </div>
                <p className="col-start-2 mt-3 text-[0.8125rem] text-muted tabular sm:col-start-auto sm:mt-0">
                  {p.category} · {p.readingMinutes} min
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
