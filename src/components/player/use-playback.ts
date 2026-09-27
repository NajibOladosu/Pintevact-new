"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaybackSource } from "@/lib/types";

export type PlaybackCallbacks = {
  /** Called on every time update with the previous and current position. */
  onTick?: (prev: number, now: number, playing: boolean) => void;
  onPause?: () => void;
  onEnded?: () => void;
};

export type Playback = {
  kind: PlaybackSource["kind"];
  time: number;
  duration: number;
  playing: boolean;
  ended: boolean;
  buffering: boolean;
  rate: number;
  muted: boolean;
  error: string | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (t: number) => void;
  setRate: (r: number) => void;
  toggleMute: () => void;
};

/**
 * Playback controller for Bunny HLS streams, through hls.js (or native HLS on Safari).
 * When a lesson has no video yet the controls are inert.
 */
export function usePlayback({
  videoRef,
  source,
  fallbackDuration,
  initialTime = 0,
  callbacks,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  source: PlaybackSource;
  /** Lesson length from the catalog, used until the stream reports its own duration. */
  fallbackDuration: number;
  initialTime?: number;
  callbacks?: PlaybackCallbacks;
}): Playback {
  const [time, setTime] = useState(initialTime);
  const [duration, setDuration] = useState(fallbackDuration);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [rate, setRateState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cb = useRef<PlaybackCallbacks | undefined>(callbacks);
  useEffect(() => {
    cb.current = callbacks;
  });

  // ── HLS attach ──────────────────────────────────────────────────
  useEffect(() => {
    if (source.kind !== "hls") return;
    const video = videoRef.current;
    if (!video) return;
    let destroyed = false;
    let hls: { destroy: () => void } | null = null;
    let prev = initialTime;

    const onTime = () => {
      const now = video.currentTime;
      setTime(now);
      cb.current?.onTick?.(prev, now, !video.paused);
      prev = now;
    };
    const onSeeked = () => {
      prev = video.currentTime;
    };
    const onMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
      if (initialTime > 0) video.currentTime = initialTime;
    };
    const onPlay = () => {
      setPlaying(true);
      setEnded(false);
    };
    const onPause = () => {
      setPlaying(false);
      cb.current?.onPause?.();
    };
    const onEnded = () => {
      setPlaying(false);
      setEnded(true);
      cb.current?.onEnded?.();
    };
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    const onError = () => setError("We couldn't load this video. Check your connection and try again.");

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source.src;
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (destroyed) return;
        if (!Hls.isSupported()) {
          setError("Your browser can't play this stream.");
          return;
        }
        const instance = new Hls({ enableWorker: true, capLevelToPlayerSize: true });
        instance.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) setError("Streaming error, please refresh the page.");
        });
        instance.loadSource(source.src);
        instance.attachMedia(video);
        hls = instance;
      });
    }

    return () => {
      destroyed = true;
      hls?.destroy();
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
    };
    // initialTime is intentionally read once, when the stream attaches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, videoRef]);

  // ── Controls ────────────────────────────────────────────────────
  const play = useCallback(() => {
    videoRef.current?.play().catch(() => setError("Tap play to start the video."));
  }, [videoRef]);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, [videoRef]);

  const seek = useCallback(
    (t: number) => {
      const target = Math.max(0, Math.min(t, duration - 0.1));
      if (videoRef.current) videoRef.current.currentTime = target;
      setTime(target);
      setEnded(false);
    },
    [duration, videoRef],
  );

  const setRate = useCallback(
    (r: number) => {
      setRateState(r);
      if (videoRef.current) videoRef.current.playbackRate = r;
    },
    [videoRef],
  );

  const toggleMute = useCallback(() => {
    const next = !muted;
    if (videoRef.current) videoRef.current.muted = next;
    setMuted(next);
  }, [muted, videoRef]);

  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play]);

  return { kind: source.kind, time, duration, playing, ended, buffering, rate, muted, error, play, pause, toggle, seek, setRate, toggleMute };
}
