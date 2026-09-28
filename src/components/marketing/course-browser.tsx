"use client";

import { useMemo, useState } from "react";
import { Search } from "@/components/icons";
import { CourseCard } from "@/components/course/course-card";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

/** Column span for card `i` of `n`, so a short last row stretches to fill the width (2 cols on sm, 3 on lg via a 6-col grid). */
function spanFor(i: number, n: number) {
  const lgRemainder = n % 3;
  const lgSpan = lgRemainder && i >= n - lgRemainder ? (lgRemainder === 1 ? "lg:col-span-6" : "lg:col-span-3") : "lg:col-span-2";
  return cn(n % 2 === 1 && i === n - 1 && "sm:col-span-2", lgSpan);
}

export function CourseBrowser({ courses }: { courses: Course[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(courses.map((c) => c.category)))], [courses]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<string>("Any level");

  const filtered = courses.filter((c) => {
    if (category !== "All" && c.category !== category) return false;
    if (level !== "Any level" && c.level !== level) return false;
    const q = query.trim().toLowerCase();
    if (q && !`${c.title} ${c.subtitle} ${c.description} ${c.category}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const reset = () => {
    setQuery("");
    setCategory("All");
    setLevel("Any level");
  };

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "h-10 shrink-0 rounded-full px-4 text-[0.8125rem] font-medium ring-1 transition-colors",
                category === cat ? "bg-fg text-bg ring-fg" : "bg-raised text-muted ring-line hover:text-fg hover:ring-line-strong",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="relative flex-1 lg:w-72">
            <span className="sr-only">Search courses</span>
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anxiety, habits, love"
              className="h-11 w-full rounded-full border border-line bg-raised pl-10 pr-4 text-sm placeholder:text-muted/65 focus:border-accent focus:outline-none focus-visible:outline-none"
            />
          </label>
          <select aria-label="Filter by level" value={level} onChange={(e) => setLevel(e.target.value)} className="h-11 rounded-full border border-line bg-raised px-4 text-sm focus:border-accent focus:outline-none">
            {["Any level", "Beginner", "Intermediate", "Advanced"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="tabular mt-8 text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "course" : "courses"}
      </p>
      {filtered.length ? (
        <div data-reveal="frame" className="mt-5 rounded-[2.4rem] bg-frame p-2.5 shadow-frame sm:p-3">
          <ul className="grid gap-3 rounded-[2rem] bg-raised p-3 sm:grid-cols-2 lg:grid-cols-6">
            {filtered.map((c, i) => (
              <li key={c.id} className={spanFor(i, filtered.length)}>
                <CourseCard course={c} index={courses.indexOf(c)} headingLevel="h2" className="h-full bg-bg ring-0" />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-5 rounded-[2rem] border border-dashed border-line-strong px-6 py-16 text-center">
          <p className="text-xl font-semibold tracking-[-0.02em]">No courses match those filters.</p>
          <p className="mt-2 text-muted">Try another word, or clear the filters.</p>
          <button type="button" onClick={reset} className="mt-6 rounded-full bg-fg px-5 py-2.5 text-[0.8125rem] font-semibold text-bg">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
