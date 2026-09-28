"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteVideo, renameVideo, type LibraryVideo } from "@/app/(app)/admin/videos/actions";
import { Copy, Film, PenLine, Trash } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate, formatDuration } from "@/lib/utils";
import { ConfirmButton } from "./confirm-button";
import { useAdminAction } from "./use-admin-action";
import { VideoUploader } from "./video-upload";

export type VideoUse = { courseTitle: string; courseSlug: string; lessonId: string; lessonTitle: string };

export function LibraryUploader() {
  const router = useRouter();
  return <VideoUploader onUploaded={() => router.refresh()} />;
}

/** Keeps the page fresh while Bunny is still encoding something. */
export function EncodingWatcher({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(t);
  }, [active, router]);
  return null;
}

export function VideoCard({ video, uses }: { video: LibraryVideo; uses: VideoUse[] }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(video.title);
  const { run, pending } = useAdminAction();
  const { toast } = useToast();
  const [synced, setSynced] = useState(video.title);
  if (synced !== video.title) {
    setSynced(video.title);
    setTitle(video.title);
  }

  return (
    <article className="flex flex-col rounded-[1.4rem] bg-raised p-2.5 ring-1 ring-line" aria-label={video.title}>
      <div className="relative aspect-video overflow-hidden rounded-[1rem] bg-frame">
        {video.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed Bunny URLs change per request
          <img src={video.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-on-frame-muted">
            <Film size={28} aria-hidden />
          </div>
        )}
        <span className={cn("absolute left-2 top-2 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold", video.failed ? "bg-danger text-bg" : video.ready ? "bg-raised/90 text-fg" : "bg-violet text-on-violet")}>
          {video.statusLabel}
          {!video.ready && !video.failed && video.progress ? ` · ${video.progress}%` : ""}
        </span>
        {video.length ? <span className="tabular absolute bottom-2 right-2 rounded-full bg-frame/80 px-2 py-0.5 text-[0.7rem] font-semibold text-on-frame">{formatDuration(video.length)}</span> : null}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-3">
        {editing ? (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => renameVideo(video.guid, title)).then((r) => r.ok && setEditing(false));
            }}
          >
            <Input aria-label="Video name" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 text-sm" autoFocus maxLength={200} />
            <Button type="submit" size="sm" className="h-10" loading={pending}>
              Save
            </Button>
          </form>
        ) : (
          <h3 className="line-clamp-2 font-medium leading-snug">{video.title}</h3>
        )}
        <p className="tabular mt-1 text-xs text-subtle">{video.uploadedAt ? `Uploaded ${formatDate(video.uploadedAt)}` : null}</p>
        <div className="mt-2 flex-1 text-xs">
          {uses.length ? (
            <ul className="space-y-0.5">
              {uses.map((u) => (
                <li key={u.lessonId} className="truncate">
                  <Link href={`/admin/courses/${u.courseSlug}/lessons/${u.lessonId}`} className="text-accent-ink hover:underline">
                    {u.lessonTitle}
                  </Link>{" "}
                  <span className="text-subtle">in {u.courseTitle}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-subtle">Not used by any lesson</p>
          )}
        </div>
        <div className="mt-3 flex items-center gap-1 border-t border-line pt-2.5">
          <Button type="button" variant="ghost" size="sm" className="h-9 px-3" onClick={() => setEditing((v) => !v)}>
            <PenLine size={15} aria-hidden /> {editing ? "Cancel" : "Rename"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label={`Copy the ID of ${video.title}`}
            title="Copy video ID"
            onClick={() => navigator.clipboard.writeText(video.guid).then(() => toast({ title: "Video ID copied", tone: "success" }))}
          >
            <Copy size={15} aria-hidden />
          </Button>
          <span className="flex-1" />
          <ConfirmButton
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label={`Delete ${video.title}`}
            title={`Delete ${video.title}?`}
            body={uses.length ? "Lessons still use this video, so it can't be deleted yet. Pick another video for them first." : "The video is removed from Bunny Stream for good."}
            confirmLabel="Delete video"
            onConfirm={() => run(() => deleteVideo(video.guid))}
          >
            <Trash size={15} aria-hidden />
          </ConfirmButton>
        </div>
      </div>
    </article>
  );
}
