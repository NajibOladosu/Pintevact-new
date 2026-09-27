"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="tablist" className="inline-flex rounded-full border border-white/10 bg-night-2 p-1">
          {(["reflections", "notes"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("rounded-full px-5 py-2 text-sm font-semibold capitalize transition", tab === t ? "bg-lucid text-ink" : "text-mist hover:text-paper")}>
              {t} <span className="ml-1 font-mono text-xs opacity-70">{t === "reflections" ? reflections.length : notes.length}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="relative flex-1 md:w-64">
            <span className="sr-only">Search your vault</span>
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search your thoughts…" className="h-11 w-full rounded-full border border-white/10 bg-night-2 pl-10 pr-4 text-paper placeholder:text-mist/60 focus:border-iris focus:outline-none" />
          </label>
          <select aria-label="Filter by course" value={course} onChange={(e) => setCourse(e.target.value)} className="h-11 max-w-40 rounded-full border border-white/10 bg-night-2 px-4 text-paper focus:border-iris focus:outline-none">
            {courses.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {tab === "reflections" ? (
        shownReflections.length ? (
          <div className="mt-8 columns-1 gap-5 md:columns-2">
            {shownReflections.map((r, i) => (
              <article key={r.id} className={cn("mb-5 break-inside-avoid rounded-3xl border border-white/10 p-6", i % 3 === 0 ? "bg-gradient-to-br from-iris/20 to-night-2" : i % 3 === 1 ? "bg-night-2" : "bg-gradient-to-br from-ember/15 to-night-2")}>
                <p className="eyebrow text-lucid">{r.courseTitle}</p>
                <p className="mt-2 text-sm italic text-mist">{r.prompt}</p>
                <p className="mt-4 whitespace-pre-wrap font-display text-xl leading-relaxed">“{r.text}”</p>
                <div className="mt-5 flex items-center justify-between text-sm text-mist">
                  <Link href={r.href} className="font-semibold text-paper underline-offset-4 hover:underline">
                    {r.lessonTitle}
                  </Link>
                  <time dateTime={r.createdAt}>{formatDate(r.createdAt)}</time>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty text={reflections.length ? "No reflections match your search." : "Reflections you write during lessons will live here — private, searchable, yours."} />
        )
      ) : shownNotes.length ? (
        <ul className="mt-8 space-y-3">
          {shownNotes.map((n) => (
            <li key={n.id} className="flex gap-4 rounded-3xl border border-white/10 bg-night-2 p-5">
              <Link href={n.href} className="h-fit shrink-0 rounded-full bg-lucid px-3 py-1 font-mono text-xs font-semibold text-ink">
                {formatDuration(n.atSeconds)}
              </Link>
              <div className="min-w-0">
                <p className="whitespace-pre-wrap">{n.body}</p>
                <p className="mt-2 text-sm text-mist">
                  {n.courseTitle} · {n.lessonTitle}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty text={notes.length ? "No notes match your search." : "Press N while watching any lesson to capture a timestamped note."} />
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mt-8 rounded-[2rem] border border-dashed border-white/15 p-12 text-center">
      <p className="font-display text-2xl italic">{text}</p>
    </div>
  );
}
