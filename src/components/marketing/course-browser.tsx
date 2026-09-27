"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import { cn } from "@/lib/utils";
import type { CourseSummary } from "@/lib/types";

export function CourseBrowser({ courses }: { courses: CourseSummary[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(courses.map((c) => c.category)))], [courses]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<string>("Any");

  const filtered = courses.filter((c) => {
    if (category !== "All" && c.category !== category) return false;
    if (level !== "Any" && c.level !== level) return false;
    const q = query.trim().toLowerCase();
    if (q && !`${c.title} ${c.subtitle} ${c.description} ${c.category}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "shrink-0 rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold transition",
                category === cat ? "bg-ink text-paper" : "bg-paper hover:bg-lucid",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="relative flex-1 lg:w-72">
            <span className="sr-only">Search courses</span>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anxiety, habits, love…"
              className="h-11 w-full rounded-full border-2 border-ink bg-white pl-11 pr-4 focus:outline-none focus:ring-4 focus:ring-lucid/60"
            />
          </label>
          <select
            aria-label="Filter by level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="h-11 rounded-full border-2 border-ink bg-white px-4 font-semibold focus:outline-none focus:ring-4 focus:ring-lucid/60"
          >
            {["Any", "Beginner", "Intermediate", "Advanced"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-ink-3" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "course" : "courses"}
      </p>
      {filtered.length ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[2rem] border-2 border-dashed border-ink/30 p-12 text-center">
          <p className="font-display text-3xl italic">Nothing matches — yet.</p>
          <p className="mt-2 text-ink-2">Try another word, or clear your filters.</p>
          <button type="button" onClick={() => { setQuery(""); setCategory("All"); setLevel("Any"); }} className="mt-4 font-semibold underline underline-offset-4">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
