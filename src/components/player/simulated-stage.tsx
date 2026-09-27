"use client";

import { Constellation } from "@/components/brand/constellation";
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
  const hue = (time * 2) % 360;
  return (
    <div className="absolute inset-0 cursor-pointer overflow-hidden bg-night" onClick={onClick} data-testid="simulated-stage">
      <div
        className="absolute inset-0 transition-[background] duration-1000"
        style={{
          background: `radial-gradient(circle at ${30 + Math.sin(time / 9) * 15}% ${40 + Math.cos(time / 11) * 15}%, hsla(${250 + Math.sin(hue / 57) * 20}, 90%, 70%, 0.45), transparent 55%), radial-gradient(circle at ${70 + Math.cos(time / 7) * 12}% ${65 + Math.sin(time / 13) * 12}%, rgba(255,90,54,0.35), transparent 50%)`,
        }}
      />
      <Constellation className={cn("absolute inset-0 h-full w-full text-mist transition-opacity duration-700", playing ? "opacity-70" : "opacity-40")} count={40} seed={title.length * 7} />
      <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-6 sm:top-6">
        <span className={cn("h-2 w-2 rounded-full", playing ? "animate-pulse bg-ember" : "bg-mist")} />
        <span className="eyebrow text-paper/80">{courseTitle}</span>
      </div>
      <span className="absolute right-4 top-4 rounded-full border border-dashed border-white/25 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-mist sm:right-6 sm:top-6">
        {reason === "not-configured" ? "Preview stage · video streaming not configured" : "Preview stage · video coming soon"}
      </span>
      <div className="absolute inset-x-6 bottom-8 sm:inset-x-12 sm:bottom-14">
        {chapter ? <p className="eyebrow text-lucid">{chapter}</p> : null}
        <p className="mt-2 max-w-3xl font-display text-2xl leading-tight text-paper sm:text-4xl lg:text-5xl">{title}</p>
        {caption ? (
          <p key={caption} className="mt-3 max-w-2xl animate-rise text-sm text-paper/80 sm:text-lg">
            {caption}
          </p>
        ) : null}
      </div>
    </div>
  );
}
