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
 * Unified playback controller. Streams Bunny HLS through hls.js (or native HLS on Safari),
 * or runs a simulated timeline when a lesson has no video yet — so interactive checkpoints
 * work identically in both cases.
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

  // ── Simulated clock ─────────────────────────────────────────────
  const simTime = useRef(initialTime);
  const reported = useRef(initialTime);
  const simRate = useRef(1);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);
  const running = useRef(false);

  const stopLoop = useCallback(() => {
    running.current = false;
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
    last.current = null;
  }, []);

  const frame = useRef<(now: number) => void>(() => {});
  useEffect(() => {
    frame.current = (now: number) => {
      if (last.current !== null) {
        const dt = ((now - last.current) / 1000) * simRate.current;
        simTime.current = Math.min(fallbackDuration, simTime.current + dt);
        const finished = simTime.current >= fallbackDuration;
        if (simTime.current - reported.current >= 0.2 || finished) {
          const prev = reported.current;
          reported.current = simTime.current;
          setTime(simTime.current);
          cb.current?.onTick?.(prev, simTime.current, true);
        }
        if (finished) {
          setPlaying(false);
          setEnded(true);
          stopLoop();
          cb.current?.onEnded?.();
          return;
        }
        // A callback (e.g. a checkpoint) may have paused playback.
        if (!running.current) return;
      }
      last.current = now;
      raf.current = requestAnimationFrame((t) => frame.current(t));
    };
  }, [fallbackDuration, stopLoop]);

  useEffect(() => stopLoop, [stopLoop]);

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
          if (data.fatal) setError("Streaming error — please refresh the page.");
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
    if (source.kind === "hls") {
      videoRef.current?.play().catch(() => setError("Tap play to start the video."));
      return;
    }
    if (simTime.current >= fallbackDuration) {
      simTime.current = 0;
      reported.current = 0;
    }
    setPlaying(true);
    setEnded(false);
    stopLoop();
    running.current = true;
    raf.current = requestAnimationFrame((t) => frame.current(t));
  }, [source.kind, fallbackDuration, stopLoop, videoRef]);

  const pause = useCallback(() => {
    if (source.kind === "hls") {
      videoRef.current?.pause();
      return;
    }
    const wasPlaying = running.current;
    setPlaying(false);
    stopLoop();
    if (wasPlaying) cb.current?.onPause?.();
  }, [source.kind, stopLoop, videoRef]);

  const seek = useCallback(
    (t: number) => {
      const max = (source.kind === "hls" ? duration : fallbackDuration) - 0.1;
      const target = Math.max(0, Math.min(t, max));
      if (source.kind === "hls") {
        if (videoRef.current) videoRef.current.currentTime = target;
      } else {
        simTime.current = target;
        reported.current = target;
        last.current = null;
      }
      setTime(target);
      setEnded(false);
    },
    [source.kind, duration, fallbackDuration, videoRef],
  );

  const setRate = useCallback(
    (r: number) => {
      setRateState(r);
      if (source.kind === "hls" && videoRef.current) videoRef.current.playbackRate = r;
      simRate.current = r;
    },
    [source.kind, videoRef],
  );

  const toggleMute = useCallback(() => {
    const next = !muted;
    if (videoRef.current) videoRef.current.muted = next;
    setMuted(next);
  }, [muted, videoRef]);

  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play]);

  return { kind: source.kind, time, duration, playing, ended, buffering, rate, muted, error, play, pause, toggle, seek, setRate, toggleMute };
}
