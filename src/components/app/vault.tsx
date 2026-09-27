"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "@/components/icons";
import { cn, formatDate, formatDuration } from "@/lib/utils";

export type VaultReflection = { id: string; prompt: string; text: string; lessonTitle: string; courseTitle: string; href: string; createdAt: string };
export type VaultNote = { id: string; body: string; atSeconds: number; lessonTitle: string; courseTitle: string; href: string; createdAt: string };

export function Vault({ reflections, notes }: { reflections: VaultReflection[]; notes: VaultNote[] }) {
  const [tab, setTab] = useState<"reflections" | "notes">("reflections");
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("All");
  const courses = useMemo(() => ["All", ...Array.from(new Set([...reflections, ...notes].map((r) => r.courseTitle)))], [reflections, notes]);
  const q = query.trim().toLowerCase();
  const match = (hay: string, c: string) => (course === "All" || c === course) && (!q || hay.toLowerCase().includes(q));
  const shownReflections = reflections.filter((r) => match(`${r.prompt} ${r.text} ${r.lessonTitle}`, r.courseTitle));
  const shownNotes = notes.filter((n) => match(`${n.body} ${n.lessonTitle}`, n.courseTitle));

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
        <div role="tablist" className="inline-flex self-start rounded-[0.85rem] bg-sunken p-1">
          {(["reflections", "notes"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("rounded-lg px-4 py-1.5 text-sm capitalize transition-colors", tab === t ? "bg-raised font-medium text-fg shadow-[0_1px_2px_rgb(17_16_28/0.12)]" : "text-muted hover:text-fg")}>
              {t} <span className="tabular ml-1 text-xs text-subtle">{t === "reflections" ? reflections.length : notes.length}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="relative flex-1 md:w-64">
            <span className="sr-only">Search your vault</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search your writing" className="h-10 w-full rounded-[0.85rem] border border-line-strong bg-raised pl-9 pr-3 text-sm placeholder:text-subtle focus:border-accent focus:outline-none focus-visible:outline-none" />
          </label>
          <select aria-label="Filter by course" value={course} onChange={(e) => setCourse(e.target.value)} className="h-10 max-w-44 rounded-[0.85rem] border border-line bg-raised px-3 text-sm focus:border-accent focus:outline-none">
            {courses.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {tab === "reflections" ? (
        shownReflections.length ? (
          <div className="mt-8 columns-1 gap-4 md:columns-2">
            {shownReflections.map((r) => (
              <article key={r.id} className="mb-4 break-inside-avoid rounded-[1.6rem] bg-raised ring-1 ring-line p-6">
                <p className="text-sm text-subtle">{r.prompt}</p>
                <p className="mt-3 whitespace-pre-wrap text-lg leading-relaxed">“{r.text}”</p>
                <div className="mt-5 flex items-center justify-between gap-4 text-sm text-subtle">
                  <Link href={r.href} className="truncate hover:text-fg">
                    {r.courseTitle}, {r.lessonTitle}
                  </Link>
                  <time dateTime={r.createdAt} className="tabular shrink-0">
                    {formatDate(r.createdAt)}
                  </time>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty text={reflections.length ? "No reflections match your search." : "Reflections you write during lessons will collect here. Private, searchable, yours."} />
        )
      ) : shownNotes.length ? (
        <ul className="mt-6">
          {shownNotes.map((n) => (
            <li key={n.id} className="flex gap-4 border-b border-line py-4">
              <Link href={n.href} className="tabular h-fit shrink-0 rounded-md bg-fg/[0.07] px-1.5 py-0.5 text-xs font-medium hover:bg-accent hover:text-on-accent">
                {formatDuration(n.atSeconds)}
              </Link>
              <div className="min-w-0">
                <p className="whitespace-pre-wrap">{n.body}</p>
                <p className="mt-1.5 text-sm text-subtle">
                  {n.courseTitle}, {n.lessonTitle}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty text={notes.length ? "No notes match your search." : "Press N while watching any lesson to save a timestamped note."} />
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mt-8 rounded-[1.6rem] border border-dashed border-line-strong px-6 py-14 text-center">
      <p className="text-muted">{text}</p>
    </div>
  );
}
