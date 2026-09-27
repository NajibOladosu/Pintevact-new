"use client";

import { useMemo, useState } from "react";
import { Search } from "@/components/icons";
import { CourseRow } from "@/components/course/course-row";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

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
      <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-5 flex gap-1 overflow-x-auto px-5 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
              className={cn("shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors", category === cat ? "bg-fg text-bg" : "text-muted hover:bg-fg/5 hover:text-fg")}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="relative flex-1 lg:w-64">
            <span className="sr-only">Search courses</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anxiety, habits, love"
              className="h-10 w-full rounded-[10px] border border-line-strong bg-raised pl-9 pr-3 text-sm placeholder:text-subtle focus:border-fg focus:outline-none focus-visible:outline-none"
            />
          </label>
          <select
            aria-label="Filter by level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="h-10 rounded-[10px] border border-line-strong bg-raised px-3 text-sm focus:border-fg focus:outline-none"
          >
            {["Any level", "Beginner", "Intermediate", "Advanced"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="tabular mt-6 text-sm text-subtle" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "course" : "courses"}
      </p>
      {filtered.length ? (
        <div className="-mx-4 mt-2 md:-mx-5">
          {filtered.map((c) => (
            <CourseRow key={c.id} course={c} headingLevel="h2" />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="text-lg font-medium">No courses match those filters.</p>
          <p className="mt-1 text-muted">Try another word, or clear the filters.</p>
          <button type="button" onClick={reset} className="mt-5 text-sm font-medium underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
