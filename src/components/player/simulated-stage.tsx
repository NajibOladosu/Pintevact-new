"use client";

import { cn } from "@/lib/utils";

/**
 * Stand-in "video" used before a lesson's Bunny video is uploaded (or when Bunny
 * isn't configured). It keeps the full interactive timeline working.
 */
export function SimulatedStage({
  title,
  courseTitle,
  chapter,
  takeaways,
  time,
  playing,
  reason,
  onClick,
}: {
  title: string;
  courseTitle: string;
  chapter: string | null;
  takeaways: string[];
  time: number;
  playing: boolean;
  reason: "no-video" | "not-configured";
  onClick: () => void;
}) {
  const caption = takeaways.length ? takeaways[Math.floor(time / 45) % takeaways.length] : "";
  return (
    <div className="absolute inset-0 cursor-pointer overflow-hidden bg-violet text-on-violet" onClick={onClick} data-testid="simulated-stage">
      <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-4 text-xs text-on-violet-muted sm:left-8 sm:right-8 sm:top-7">
        <span className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", playing ? "bg-accent" : "bg-on-violet-muted")} />
          {courseTitle}
        </span>
        <span>{reason === "not-configured" ? "Preview: video streaming not configured" : "Preview: video coming soon"}</span>
      </div>
      <div className="absolute inset-x-5 bottom-6 sm:inset-x-8 sm:bottom-10">
        {chapter ? <p className="text-sm text-on-violet-muted">{chapter}</p> : null}
        <p className="mt-1 max-w-3xl text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">{title}</p>
        {caption ? (
          <p key={caption} className="mt-3 max-w-2xl animate-enter text-sm text-on-violet-muted sm:text-base">
            {caption}
          </p>
        ) : null}
      </div>
    </div>
  );
}
