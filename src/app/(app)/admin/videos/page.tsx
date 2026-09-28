import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/app/admin-nav";
import { EncodingWatcher, LibraryUploader, VideoCard } from "@/components/admin/video-library";
import { Search } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { videoUsage } from "@/lib/admin/catalog";
import { isBunnyLibraryConfigured } from "@/lib/env";
import { searchVideos } from "./actions";

export const metadata: Metadata = { title: "Admin · Videos" };

const PER_PAGE = 24;

export default async function AdminVideosPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; filter?: string }> }) {
  await requireAdmin();
  const { q = "", page: pageParam, filter } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  if (!isBunnyLibraryConfigured()) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <AdminNav active="videos" title="Video library" />
        <div className="rounded-[1.6rem] bg-raised p-8 ring-1 ring-line">
          <h2 className="text-xl">Connect Bunny Stream</h2>
          <p className="mt-2 max-w-[60ch] text-muted">
            Set <code className="font-mono text-fg">BUNNY_STREAM_LIBRARY_ID</code> and <code className="font-mono text-fg">BUNNY_STREAM_API_KEY</code> (Stream → your library → API) to upload videos here and pick them for lessons.
          </p>
        </div>
      </div>
    );
  }

  const [res, usage] = await Promise.all([searchVideos(q, page), videoUsage()]);
  const all = res.ok ? res.data!.items : [];
  const videos = filter === "unused" ? all.filter((v) => !usage.get(v.guid)?.length) : all;
  const total = res.ok ? res.data!.total : 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const link = (p: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ q: q || undefined, filter, page: undefined, ...p })) if (v !== undefined && v !== "") params.set(k, String(v));
    return `/admin/videos${params.size ? `?${params}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminNav active="videos" title="Video library" />
      <EncodingWatcher active={all.some((v) => !v.ready && !v.failed)} />
      <section className="grid gap-5 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <p className="text-muted">
            Every lesson video lives in your Bunny Stream library. Uploads go straight to Bunny, which encodes them for smooth streaming on any connection. {total} {total === 1 ? "video" : "videos"} in the library.
          </p>
        </div>
        <LibraryUploader />
      </section>

      <form className="flex flex-col gap-3 sm:flex-row" role="search">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" aria-hidden />
          <input type="search" name="q" defaultValue={q} aria-label="Search videos" placeholder="Search by name" className="h-11 w-full rounded-[0.85rem] border border-line bg-raised pl-10 pr-4 focus:border-accent focus:outline-none" />
        </div>
        <select name="filter" defaultValue={filter ?? ""} aria-label="Show" className="h-11 rounded-[0.85rem] border border-line bg-raised px-3 text-sm">
          <option value="">All videos</option>
          <option value="unused">Not used by a lesson</option>
        </select>
        <button type="submit" className={buttonClasses({ variant: "secondary", size: "sm", className: "h-11" })}>
          Search
        </button>
      </form>

      {!res.ok ? <p className="rounded-[1.2rem] border border-danger/40 p-4 text-sm text-danger">{res.error}</p> : null}
      {res.ok && !videos.length ? <p className="rounded-[1.6rem] bg-raised p-8 text-center text-muted ring-1 ring-line">{q || filter ? "No videos match." : "No videos yet. Upload the first one above."}</p> : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((v) => (
          <li key={v.guid}>
            <VideoCard video={v} uses={usage.get(v.guid) ?? []} />
          </li>
        ))}
      </ul>

      {pages > 1 ? (
        <nav aria-label="Pages" className="flex items-center justify-center gap-3 text-sm">
          {page > 1 ? <Link href={link({ page: page - 1 })} className={buttonClasses({ variant: "outline", size: "sm" })}>Previous</Link> : null}
          <span className="tabular text-muted">
            Page {page} of {pages}
          </span>
          {page < pages ? <Link href={link({ page: page + 1 })} className={buttonClasses({ variant: "outline", size: "sm" })}>Next</Link> : null}
        </nav>
      ) : null}
    </div>
  );
}
