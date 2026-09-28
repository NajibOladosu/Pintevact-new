"use client";

import { useEffect, useRef, useState } from "react";
import { attachVideo, saveLessonDetails } from "@/app/(app)/admin/courses/actions";
import { getVideo, searchVideos, type LibraryVideo } from "@/app/(app)/admin/videos/actions";
import { Check, Film, Search, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { formatChapters } from "@/lib/admin/schemas";
import type { Lesson } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";
import { FormStatus } from "./course-editor";
import { useAdminAction } from "./use-admin-action";
import { useFormAction } from "./use-form-action";
import { useUnsavedChanges } from "./use-unsaved-changes";
import { VideoUploader } from "./video-upload";

export function LessonDetailsForm({ lesson }: { lesson: Lesson }) {
  const { state, onSubmit, pending } = useFormAction(saveLessonDetails);
  const formRef = useRef<HTMLFormElement>(null);
  const { markClean } = useUnsavedChanges(formRef);
  useEffect(() => {
    if (state.ok) markClean();
  }, [state, markClean]);
  const err = (name: string) => (state.errors?.[name] ? { "aria-invalid": true as const, "aria-describedby": `${name}-error` } : {});

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="lessonId" value={lesson.id} />
      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={lesson.title} {...err("title")} />
          <FieldError id="title-error" message={state.errors?.title} />
        </div>
        <div>
          <Label htmlFor="slug">Web address</Label>
          <Input id="slug" name="slug" defaultValue={lesson.slug} {...err("slug")} />
          <FieldError id="slug-error" message={state.errors?.slug} />
        </div>
      </div>
      <div>
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" name="summary" rows={3} defaultValue={lesson.summary} className="min-h-24" {...err("summary")} />
        <FieldError id="summary-error" message={state.errors?.summary} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="durationMinutes">Length (minutes)</Label>
          <Input id="durationMinutes" name="durationMinutes" type="number" inputMode="decimal" min={0.1} step="0.1" defaultValue={Math.round((lesson.durationSeconds / 60) * 10) / 10} {...err("durationMinutes")} />
          <p className="mt-1.5 text-xs text-subtle">Set automatically when an encoded video is attached.</p>
          <FieldError id="durationMinutes-error" message={state.errors?.durationMinutes} />
        </div>
        <label className="flex items-center gap-2.5 self-center pt-4 text-sm">
          <input type="checkbox" name="isPreview" defaultChecked={lesson.isPreview} className="h-5 w-5 accent-[var(--accent)]" /> Free preview (anyone can watch it)
        </label>
      </div>
      <div>
        <Label htmlFor="chapters">Chapters</Label>
        <Textarea id="chapters" name="chapters" rows={4} defaultValue={formatChapters(lesson.chapters)} placeholder={"0:00 The spark\n2:30 What the research says"} className="min-h-28 font-mono text-sm" {...err("chapters")} />
        <p className="mt-1.5 text-xs text-subtle">One per line: time, then title.</p>
        <FieldError id="chapters-error" message={state.errors?.chapters} />
      </div>
      <div>
        <Label htmlFor="takeaways">Key takeaways</Label>
        <Textarea id="takeaways" name="takeaways" rows={4} defaultValue={lesson.takeaways.join("\n")} className="min-h-28" {...err("takeaways")} />
        <p className="mt-1.5 text-xs text-subtle">One per line. Shown under the video.</p>
        <FieldError id="takeaways-error" message={state.errors?.takeaways} />
      </div>
      <div>
        <Label htmlFor="exercise">Try this (optional)</Label>
        <Textarea id="exercise" name="exercise" rows={3} defaultValue={lesson.exercise ?? ""} className="min-h-24" {...err("exercise")} />
      </div>
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-4 rounded-[1.1rem] bg-raised/90 py-2 backdrop-blur">
        <Button type="submit" loading={pending}>
          Save lesson
        </Button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}

function VideoThumb({ video, className }: { video: Pick<LibraryVideo, "thumbnail" | "title" | "ready" | "failed" | "statusLabel" | "progress">; className?: string }) {
  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-[0.9rem] bg-frame", className)}>
      {video.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element -- signed Bunny URLs change per request
        <img src={video.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-on-frame-muted">
          <Film size={26} aria-hidden />
        </div>
      )}
      {!video.ready ? (
        <span className={cn("absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold", video.failed ? "bg-danger text-bg" : "bg-frame/80 text-on-frame")}>
          {video.statusLabel}
          {!video.failed && video.progress ? ` ${video.progress}%` : ""}
        </span>
      ) : null}
    </div>
  );
}

/** The lesson's video: what's attached, its encoding state, and ways to change it. */
export function LessonVideoPanel({ lessonId, videoId, durationSeconds, libraryReady }: { lessonId: string; videoId: string | null; durationSeconds: number; libraryReady: boolean }) {
  const [video, setVideo] = useState<LibraryVideo | null>(null);
  const [missing, setMissing] = useState(false);
  const [picking, setPicking] = useState(false);
  const { run, pending } = useAdminAction();
  const synced = useRef(false);

  // Load the attached video, and keep checking while Bunny encodes it.
  useEffect(() => {
    synced.current = false;
    if (!videoId || !libraryReady) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      const res = await getVideo(videoId).catch(() => null);
      if (stop) return;
      if (!res?.ok || !res.data) return setMissing(true);
      setVideo(res.data);
      if (!res.data.ready && !res.data.failed) timer = setTimeout(load, 5000);
      else if (res.data.ready && !synced.current && res.data.length > 0 && Math.round(res.data.length) !== durationSeconds) {
        synced.current = true;
        // Encoding just finished: take the video's real length.
        void run(() => attachVideo(lessonId, videoId), { quiet: true });
      }
    };
    void load();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [videoId, lessonId, libraryReady, durationSeconds, run]);

  const choose = (guid: string) =>
    run(() => attachVideo(lessonId, guid)).then((r) => {
      if (r.ok) setPicking(false);
    });

  return (
    <div className="space-y-4">
      {videoId ? (
        <div className="space-y-3">
          {video ? <VideoThumb video={video} /> : <div className="aspect-video animate-pulse rounded-[0.9rem] bg-sunken" />}
          <div className="min-w-0">
            <p className="truncate font-medium">{video?.title ?? (missing ? "Not found in the library" : libraryReady ? "Loading…" : "Video attached")}</p>
            <p className="tabular mt-0.5 truncate font-mono text-xs text-subtle">
              {videoId}
              {video?.length ? ` · ${formatDuration(video.length)}` : ""}
            </p>
            {missing ? <p className="mt-1 text-sm text-danger">This video isn&apos;t in your Bunny library any more. Choose another.</p> : null}
          </div>
        </div>
      ) : (
        <p className="rounded-[0.9rem] bg-sunken p-4 text-sm text-muted">No video yet. Learners see a &ldquo;video coming soon&rdquo; message until you attach one.</p>
      )}
      {libraryReady ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setPicking(true)}>
            <Film size={16} aria-hidden /> {videoId ? "Change video" : "Choose or upload"}
          </Button>
          {videoId ? (
            <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => run(() => attachVideo(lessonId, null))}>
              Remove
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted">Connect Bunny Stream (BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY) to upload and pick videos.</p>
      )}
      {picking ? <VideoPicker current={videoId} onChoose={choose} onClose={() => setPicking(false)} busy={pending} /> : null}
    </div>
  );
}

function VideoPicker({ current, onChoose, onClose, busy }: { current: string | null; onChoose: (guid: string) => void; onClose: () => void; busy: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<LibraryVideo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  useEffect(() => {
    let stale = false;
    const t = setTimeout(async () => {
      const res = await searchVideos(query).catch(() => null);
      if (stale) return;
      if (!res?.ok) setError(res?.error ?? "Couldn't load the library");
      else {
        setError(null);
        setVideos(res.data!.items);
      }
    }, 250);
    return () => {
      stale = true;
      clearTimeout(t);
    };
  }, [query]);

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="picker-title" className="m-auto max-h-[88vh] w-[min(94vw,56rem)] overflow-hidden rounded-[1.8rem] bg-raised p-0 text-fg shadow-frame ring-1 ring-line backdrop:bg-frame/60 backdrop:backdrop-blur-sm">
      <div className="flex max-h-[88vh] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line p-5">
          <h2 id="picker-title" className="text-xl font-semibold tracking-[-0.03em]">
            Choose the lesson video
          </h2>
          <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={() => ref.current?.close()}>
            <X size={18} aria-hidden />
          </Button>
        </div>
        <div className="space-y-5 overflow-y-auto p-5">
          <VideoUploader compact onUploaded={(guid) => onChoose(guid)} />
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" aria-hidden />
            <Input type="search" aria-label="Search the video library" placeholder="Search the library" value={query} onChange={(e) => setQuery(e.target.value)} className="h-11 pl-10" />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {videos === null ? (
            <p className="text-sm text-muted">Loading the library…</p>
          ) : videos.length === 0 ? (
            <p className="text-sm text-muted">{query ? "No videos match." : "The library is empty. Upload the first video above."}</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <li key={v.guid}>
                  <button
                    type="button"
                    disabled={busy || v.failed}
                    onClick={() => onChoose(v.guid)}
                    aria-label={`Use ${v.title}`}
                    className={cn("group w-full rounded-[1.1rem] p-2 text-left ring-1 transition-colors disabled:opacity-50", v.guid === current ? "ring-2 ring-accent" : "ring-line hover:ring-line-strong")}
                  >
                    <VideoThumb video={v} />
                    <span className="mt-2 flex items-start justify-between gap-2 px-1">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{v.title}</span>
                        <span className="tabular block text-xs text-subtle">{v.length ? formatDuration(v.length) : v.statusLabel}</span>
                      </span>
                      {v.guid === current ? <Check size={16} className="mt-0.5 shrink-0 text-accent-ink" aria-label="Current video" /> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </dialog>
  );
}
