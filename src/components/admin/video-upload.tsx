"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Upload as TusUpload } from "tus-js-client";
import { startUpload } from "@/app/(app)/admin/videos/actions";
import { Upload, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const MAX_BYTES = 20 * 1024 ** 3;

function niceTitle(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Untitled video";
}

function formatBytes(n: number) {
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
  if (n >= 1024 ** 2) return `${Math.round(n / 1024 ** 2)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

type State = { phase: "idle" } | { phase: "uploading"; name: string; size: number; sent: number } | { phase: "done"; name: string } | { phase: "error"; message: string };

/**
 * Uploads a video file straight from the browser to Bunny Stream over TUS (resumable, so a dropped
 * connection picks up where it left off). Our server only creates the video and signs the upload.
 */
export function VideoUploader({ onUploaded, compact }: { onUploaded?: (videoId: string, title: string) => void; compact?: boolean }) {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [over, setOver] = useState(false);
  const upload = useRef<TusUpload | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const { toast } = useToast();

  useEffect(() => () => void upload.current?.abort(), []);

  async function begin(file: File) {
    if (!file.type.startsWith("video/")) return toast({ title: "Choose a video file (MP4, MOV, WebM…)", tone: "error" });
    if (file.size > MAX_BYTES) return toast({ title: "Videos can be up to 20 GB", tone: "error" });
    const title = niceTitle(file.name);
    setState({ phase: "uploading", name: title, size: file.size, sent: 0 });
    const signed = await startUpload(title).catch(() => null);
    if (!signed?.ok || !signed.data) {
      setState({ phase: "error", message: signed && !signed.ok ? signed.error : "Couldn't start the upload" });
      return;
    }
    const { Upload: Tus } = await import("tus-js-client");
    const s = signed.data;
    const tus = new Tus(file, {
      endpoint: s.endpoint,
      retryDelays: [0, 2000, 5000, 10000, 20000],
      chunkSize: 50 * 1024 * 1024,
      headers: { AuthorizationSignature: s.signature, AuthorizationExpire: String(s.expires), VideoId: s.videoId, LibraryId: s.libraryId },
      metadata: { filetype: file.type, title },
      onProgress: (sent) => setState({ phase: "uploading", name: title, size: file.size, sent }),
      onError: (err) => setState({ phase: "error", message: err.message.includes("401") ? "The upload link expired. Try again." : "The upload stopped. Check your connection and try again." }),
      onSuccess: () => {
        setState({ phase: "done", name: title });
        toast({ title: "Uploaded", description: "Bunny is encoding it now. It can be attached right away.", tone: "success" });
        onUploaded?.(s.videoId, title);
      },
    });
    upload.current = tus;
    const previous = await tus.findPreviousUploads();
    if (previous[0]) tus.resumeFromPreviousUpload(previous[0]);
    tus.start();
  }

  function cancel() {
    void upload.current?.abort(true);
    upload.current = null;
    setState({ phase: "idle" });
  }

  const busy = state.phase === "uploading";
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!busy) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && !busy) void begin(file);
      }}
      className={cn("rounded-[1.2rem] border-2 border-dashed p-5 text-center transition-colors", over ? "border-accent bg-accent/5" : "border-line-strong", compact && "p-4")}
    >
      <input
        ref={input}
        id={inputId}
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void begin(file);
          e.target.value = "";
        }}
      />
      {state.phase === "uploading" ? (
        <div className="space-y-3 text-left" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-medium">Uploading {state.name}</p>
            <Button type="button" variant="ghost" size="sm" onClick={cancel}>
              <X size={14} aria-hidden /> Cancel
            </Button>
          </div>
          <Progress value={state.size ? (state.sent / state.size) * 100 : 0} label={`Uploading ${state.name}`} />
          <p className="tabular text-xs text-subtle">
            {formatBytes(state.sent)} of {formatBytes(state.size)} · {state.size ? Math.floor((state.sent / state.size) * 100) : 0}%. Keep this tab open.
          </p>
        </div>
      ) : (
        <>
          <Upload size={22} className="mx-auto text-accent-ink" aria-hidden />
          <p className="mt-2 text-sm font-medium">{state.phase === "done" ? `${state.name} uploaded. Add another?` : "Drop a video here"}</p>
          <p className="mt-1 text-xs text-subtle">MP4, MOV or WebM, up to 20 GB. It goes straight to Bunny Stream.</p>
          {state.phase === "error" ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              {state.message}
            </p>
          ) : null}
          <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={() => input.current?.click()}>
            Choose a file
          </Button>
        </>
      )}
    </div>
  );
}
