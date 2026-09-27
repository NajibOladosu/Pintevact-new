"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Check, FastForward, Maximize, Minimize, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
import { addNoteAction, deleteNoteAction, saveProgressAction, submitResponseAction } from "@/app/(app)/learn/actions";
import { interactionMeta } from "@/components/course/interaction-icon";
import { useToast } from "@/components/ui/toast";
import { buttonClasses } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import type { Chapter, Interaction, InteractionResponse, Note, PlaybackSource } from "@/lib/types";
import type { ProgressResult } from "@/lib/lesson-service";
import { InteractionCard, type SubmitPayload } from "./interaction-card";
import { usePlayback, type Playback } from "./use-playback";
import { accumulateWatched, crossedInteraction, currentChapter, nextInteraction, PLAYBACK_RATES } from "./player-utils";
import { SimulatedStage } from "./simulated-stage";

export type LessonPlayerProps = {
  lesson: { id: string; title: string; durationSeconds: number; chapters: Chapter[]; takeaways: string[]; interactions: Interaction[] };
  courseTitle: string;
  source: PlaybackSource;
  initialTime: number;
  initialWatched: number;
  initiallyCompleted: boolean;
  responses: InteractionResponse[];
  notes: Note[];
  nextHref: string | null;
  courseHref: string;
};

const markerColor: Record<Interaction["type"], string> = {
  quiz: "bg-lucid",
  reflection: "bg-ember",
  poll: "bg-iris",
  scale: "bg-tide",
  insight: "bg-sun",
};

export function LessonPlayer(props: LessonPlayerProps) {
  const { lesson, source } = props;
  const { toast } = useToast();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [answers, setAnswers] = useState<Map<string, InteractionResponse["response"]>>(() => new Map(props.responses.map((r) => [r.interactionId, r.response])));
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<Interaction | null>(null);
  const [completed, setCompleted] = useState(props.initiallyCompleted);
  const [celebration, setCelebration] = useState<ProgressResult | null>(null);
  const [notes, setNotes] = useState<Note[]>(props.notes);
  const [panel, setPanel] = useState<"moments" | "chapters" | "notes">("moments");
  const [fullscreen, setFullscreen] = useState(false);
  const [showRates, setShowRates] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const prevTime = useRef(props.initialTime);
  const watched = useRef(props.initialWatched);
  const lastSaved = useRef(0);
  const saving = useRef(false);

  const handled = useMemo(() => new Set([...answers.keys(), ...dismissed]), [answers, dismissed]);
  const requiredLeft = lesson.interactions.filter((i) => i.required && !answers.has(i.id));

  // ── Progress persistence ─────────────────────────────────────────
  const persist = useCallback(
    async (force = false) => {
      if (saving.current) return;
      const now = Date.now();
      if (!force && now - lastSaved.current < 10_000) return;
      saving.current = true;
      lastSaved.current = now;
      try {
        const res = await saveProgressAction({ lessonId: lesson.id, position: prevTime.current, watched: Math.round(watched.current) });
        if (res?.newlyCompleted) {
          setCompleted(true);
          setCelebration(res);
          router.refresh();
        } else if (res?.completed) {
          setCompleted(true);
        }
      } catch {
        /* offline — retry on next tick */
      } finally {
        saving.current = false;
      }
    },
    [lesson.id, router],
  );

  // ── Time tracking & checkpoint triggering (driven by playback events) ──
  const activeRef = useRef<Interaction | null>(null);
  const handledRef = useRef(handled);
  const pbRef = useRef<Playback | null>(null);
  useEffect(() => {
    activeRef.current = active;
    handledRef.current = handled;
  });

  const pb = usePlayback({
    videoRef,
    source,
    fallbackDuration: lesson.durationSeconds,
    initialTime: props.initialTime,
    callbacks: {
      onTick: (prev, now, playing) => {
        if (playing) watched.current = accumulateWatched(watched.current, prev, now);
        prevTime.current = now;
        if (!playing || activeRef.current) return;
        const hit = crossedInteraction(lesson.interactions, prev, now, handledRef.current);
        if (hit) {
          activeRef.current = hit;
          pbRef.current?.pause();
          setActive(hit);
          return;
        }
        void persist();
      },
      onPause: () => void persist(true),
      onEnded: () => void persist(true),
    },
  });
  useEffect(() => {
    pbRef.current = pb;
  });
  const chapter = currentChapter(lesson.chapters, pb.time);
  const upcoming = nextInteraction(lesson.interactions, pb.time, handled);

  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && void persist(true);
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [persist]);

  // ── Fullscreen ───────────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stageRef.current?.requestFullscreen?.();
  };

  // ── Keyboard shortcuts ───────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable) return;
      if (active) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          pb.toggle();
          break;
        case "ArrowRight":
        case "l":
          pb.seek(pb.time + (e.key === "l" ? 10 : 5));
          break;
        case "ArrowLeft":
        case "j":
          pb.seek(pb.time - (e.key === "j" ? 10 : 5));
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          pb.toggleMute();
          break;
        case "n":
          e.preventDefault();
          pb.pause();
          setPanel("notes");
          setTimeout(() => noteRef.current?.focus(), 50);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pb, active]);

  // ── Interactions ─────────────────────────────────────────────────
  const openInteraction = (i: Interaction) => {
    pb.pause();
    pb.seek(i.atSeconds);
    prevTime.current = i.atSeconds;
    setActive(i);
  };

  const submit = async (payload: SubmitPayload) => {
    const interaction = active!;
    const res = await submitResponseAction({ interactionId: interaction.id, ...payload });
    if (res.ok) {
      setAnswers((m) => new Map(m).set(interaction.id, payload));
      if (res.xpAwarded) {
        toast({ title: `+${res.xpAwarded} XP`, description: interactionMeta[interaction.type].label, tone: "xp" });
        router.refresh();
      }
    }
    return res;
  };

  const continueAfter = () => {
    setActive(null);
    void persist(true);
    pb.play();
  };

  const skipActive = () => {
    if (active) setDismissed((s) => new Set(s).add(active.id));
    setActive(null);
    pb.play();
  };

  // ── Notes ────────────────────────────────────────────────────────
  const [notePending, startNote] = useTransition();
  const [noteText, setNoteText] = useState("");
  const addNote = () => {
    const body = noteText.trim();
    if (!body) return;
    const at = pb.time;
    startNote(async () => {
      const res = await addNoteAction({ lessonId: lesson.id, atSeconds: at, body });
      if (res.note) {
        setNotes((n) => [...n, res.note!].sort((a, b) => a.atSeconds - b.atSeconds));
        setNoteText("");
        toast({ title: "Note saved", description: `at ${formatDuration(at)}`, tone: "success" });
      } else toast({ title: "Couldn't save note", description: res.error, tone: "error" });
    });
  };
  const removeNote = (id: string) => {
    setNotes((n) => n.filter((x) => x.id !== id));
    void deleteNoteAction(id);
  };

  // ── Timeline scrubbing ───────────────────────────────────────────
  const trackRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const timeAt = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * pb.duration;
  };
  const pct = (t: number) => `${(t / Math.max(1, pb.duration)) * 100}%`;

  const answeredCount = lesson.interactions.filter((i) => answers.has(i.id)).length;

  return (
    <div className="grid gap-6 2xl:grid-cols-[1fr_22rem]">
      {/* ── Stage ─────────────────────────────────────────── */}
      <div>
        <div ref={stageRef} className={cn("group/stage relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black", fullscreen && "flex items-center rounded-none")} data-testid="player">
          <div className="relative aspect-video w-full">
            {source.kind === "hls" ? (
              <video ref={videoRef} className="absolute inset-0 h-full w-full" poster={source.poster ?? undefined} playsInline preload="metadata" onClick={() => !active && pb.toggle()} />
            ) : (
              <SimulatedStage title={lesson.title} courseTitle={props.courseTitle} chapter={chapter?.title ?? null} takeaways={lesson.takeaways} time={pb.time} playing={pb.playing} reason={source.reason} onClick={() => !active && pb.toggle()} />
            )}

            {/* Big play button */}
            {!pb.playing && !active && !celebration ? (
              <button
                type="button"
                onClick={pb.ended ? () => { pb.seek(0); pb.play(); } : pb.play}
                aria-label={pb.ended ? "Replay" : "Play"}
                className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-lucid text-ink shadow-hard transition hover:scale-105"
              >
                <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-lucid" aria-hidden />
                {pb.ended ? <RotateCcw size={30} /> : <Play size={32} className="ml-1 fill-ink" />}
              </button>
            ) : null}

            {pb.buffering && pb.playing ? <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-4 border-white/20 border-t-lucid" aria-label="Loading" /> : null}

            {pb.error ? <p className="absolute inset-x-4 top-4 z-10 rounded-2xl bg-ember p-3 text-center text-sm font-semibold text-ink">{pb.error}</p> : null}

            {/* Interaction overlay */}
            {active ? (
              <div className="fixed inset-0 z-[60] flex overflow-y-auto bg-night/90 p-3 backdrop-blur-sm sm:absolute sm:z-20 sm:bg-night/70 sm:p-6">
                <div className="m-auto flex w-full justify-center">
                <InteractionCard key={active.id} interaction={active} previous={answers.get(active.id)} onSubmit={submit} onContinue={continueAfter} onDismiss={skipActive} />
                </div>
              </div>
            ) : null}

            {/* Completion overlay */}
            {celebration ? (
              <div className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-night/85 p-4 text-center backdrop-blur" role="dialog" aria-label="Lesson complete">
                <div className="relative animate-rise">
                  <div className="pointer-events-none absolute left-1/2 top-8 -z-10 h-40 w-40 -translate-x-1/2 animate-pulse-ring rounded-full border-4 border-lucid" aria-hidden />
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink bg-lucid text-ink shadow-hard sm:h-20 sm:w-20">
                    <Check size={36} />
                  </span>
                  <p className="eyebrow mt-4 text-lucid">{celebration.courseCompleted ? "Course complete" : "Lesson complete"}</p>
                  <p className="mt-2 font-display text-3xl italic sm:text-5xl">{celebration.courseCompleted ? "You integrated it all." : "Another star, lit."}</p>
                  {celebration.xpAwarded ? <p className="mt-2 font-mono text-lg font-semibold text-ember">+{celebration.xpAwarded} XP</p> : null}
                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    {celebration.certificateId ? (
                      <Link href={`/certificates/${celebration.certificateId}`} className={buttonClasses({ variant: "lucid" })}>
                        View certificate
                      </Link>
                    ) : props.nextHref ? (
                      <Link href={props.nextHref} className={buttonClasses({ variant: "lucid" })}>
                        Next lesson <SkipForward size={16} />
                      </Link>
                    ) : null}
                    <button type="button" onClick={() => setCelebration(null)} className={buttonClasses({ variant: "subtle" })}>
                      Stay here
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* ── Controls ─────────────────────────────────── */}
          <div className={cn("relative z-10 bg-gradient-to-t from-night via-night/95 to-night/80 px-4 pb-3 pt-3 sm:px-5", fullscreen && "absolute inset-x-0 bottom-0")}>
            <div
              ref={trackRef}
              className="relative flex h-6 cursor-pointer items-center"
              onPointerMove={(e) => setHover(timeAt(e.clientX))}
              onPointerLeave={() => setHover(null)}
              onClick={(e) => pb.seek(timeAt(e.clientX))}
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(pb.duration)}
              aria-valuenow={Math.round(pb.time)}
              aria-valuetext={`${formatDuration(pb.time)} of ${formatDuration(pb.duration)}`}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") pb.seek(pb.time + 5);
                if (e.key === "ArrowLeft") pb.seek(pb.time - 5);
              }}
            >
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-iris via-ember to-lucid" style={{ width: pct(pb.time) }} />
              </div>
              {lesson.chapters.slice(1).map((c) => (
                <span key={c.atSeconds} className="absolute h-1.5 w-0.5 bg-night" style={{ left: pct(c.atSeconds) }} aria-hidden />
              ))}
              {lesson.interactions.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openInteraction(i);
                  }}
                  title={`${interactionMeta[i.type].label} · ${formatDuration(i.atSeconds)}`}
                  aria-label={`${interactionMeta[i.type].label} at ${formatDuration(i.atSeconds)}${answers.has(i.id) ? " (answered)" : ""}`}
                  className={cn(
                    "absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-night transition hover:scale-150",
                    markerColor[i.type],
                    !answers.has(i.id) && "ring-2 ring-white/40",
                  )}
                  style={{ left: pct(i.atSeconds) }}
                />
              ))}
              {hover !== null ? (
                <span className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded-md bg-paper px-1.5 py-0.5 font-mono text-[0.65rem] text-ink" style={{ left: pct(hover) }}>
                  {formatDuration(hover)}
                </span>
              ) : null}
            </div>

            <div className="mt-2 flex items-center gap-2 sm:gap-3">
              <button type="button" onClick={pb.toggle} aria-label={pb.playing ? "Pause" : "Play"} className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink transition hover:bg-lucid">
                {pb.playing ? <Pause size={18} className="fill-ink" /> : <Play size={18} className="ml-0.5 fill-ink" />}
              </button>
              {source.kind === "hls" ? (
                <button type="button" onClick={pb.toggleMute} aria-label={pb.muted ? "Unmute" : "Mute"} className="flex h-9 w-9 items-center justify-center rounded-full text-paper hover:bg-white/10">
                  {pb.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              ) : null}
              <span className="font-mono text-xs text-paper/80" aria-live="off">
                {formatDuration(pb.time)} / {formatDuration(pb.duration)}
              </span>
              <span className="hidden truncate text-sm text-mist md:inline">{chapter ? `· ${chapter.title}` : ""}</span>
              <div className="ml-auto flex items-center gap-1 sm:gap-2">
                {upcoming ? (
                  <button type="button" onClick={() => openInteraction(upcoming)} className="hidden items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-paper hover:border-lucid sm:inline-flex" data-testid="jump-next">
                    <FastForward size={14} /> Next moment
                  </button>
                ) : null}
                <div className="relative">
                  <button type="button" onClick={() => setShowRates((v) => !v)} aria-label="Playback speed" aria-expanded={showRates} className="rounded-full px-2.5 py-1.5 font-mono text-xs font-semibold text-paper hover:bg-white/10">
                    {pb.rate}×
                  </button>
                  {showRates ? (
                    <div className="absolute bottom-10 right-0 z-30 flex flex-col rounded-2xl border border-white/10 bg-night-2 p-1">
                      {PLAYBACK_RATES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            pb.setRate(r);
                            setShowRates(false);
                          }}
                          className={cn("rounded-xl px-4 py-1.5 text-left font-mono text-sm", r === pb.rate ? "bg-lucid text-ink" : "text-paper hover:bg-white/10")}
                        >
                          {r}×
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"} className="flex h-9 w-9 items-center justify-center rounded-full text-paper hover:bg-white/10">
                  {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-mist">
          <p>
            {completed ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-lucid">
                <Check size={16} /> Lesson complete
              </span>
            ) : requiredLeft.length ? (
              `Watch to the end and complete ${requiredLeft.length} required moment${requiredLeft.length > 1 ? "s" : ""} to finish.`
            ) : (
              "Watch to the end to complete this lesson."
            )}
          </p>
          <p className="hidden font-mono text-xs sm:block">Space play · ←/→ seek · N note · F fullscreen</p>
        </div>
      </div>

      {/* ── Side panel ──────────────────────────────────── */}
      <aside className="flex max-h-[28rem] flex-col 2xl:max-h-[42rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-night-2">
        <div role="tablist" className="grid grid-cols-3 border-b border-white/10 p-1.5">
          {(
            [
              ["moments", `Moments ${answeredCount}/${lesson.interactions.length}`],
              ["chapters", "Chapters"],
              ["notes", `Notes${notes.length ? ` ${notes.length}` : ""}`],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={panel === id} onClick={() => setPanel(id)} className={cn("rounded-xl px-2 py-2 text-xs font-semibold transition sm:text-sm", panel === id ? "bg-white/10 text-paper" : "text-mist hover:text-paper")}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {panel === "moments" ? (
            <ol className="space-y-1.5">
              {lesson.interactions.map((i) => {
                const meta = interactionMeta[i.type];
                const done = answers.has(i.id);
                return (
                  <li key={i.id}>
                    <button type="button" onClick={() => openInteraction(i)} className="flex w-full items-start gap-3 rounded-2xl p-3 text-left transition hover:bg-white/5">
                      <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink text-ink", done ? "bg-lucid" : meta.color, !done && "opacity-80")}>
                        {done ? <Check size={14} /> : <meta.icon size={14} />}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-wider text-mist">
                          {formatDuration(i.atSeconds)} · {meta.label}
                          {i.required ? <span className="text-ember">· required</span> : null}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-sm text-paper">{i.prompt}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : null}
          {panel === "chapters" ? (
            <ol className="space-y-1">
              {lesson.chapters.map((c) => (
                <li key={c.atSeconds}>
                  <button type="button" onClick={() => pb.seek(c.atSeconds)} className={cn("flex w-full items-center justify-between gap-3 rounded-2xl p-3 text-left transition hover:bg-white/5", chapter?.atSeconds === c.atSeconds && "bg-lucid/10 text-lucid")}>
                    <span className="font-medium">{c.title}</span>
                    <span className="font-mono text-xs text-mist">{formatDuration(c.atSeconds)}</span>
                  </button>
                </li>
              ))}
            </ol>
          ) : null}
          {panel === "notes" ? (
            <div>
              <div className="rounded-2xl border border-white/10 bg-night p-3">
                <label htmlFor="note-input" className="font-mono text-[0.68rem] uppercase tracking-wider text-mist">
                  Note at {formatDuration(pb.time)}
                </label>
                <textarea
                  id="note-input"
                  ref={noteRef}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote();
                  }}
                  rows={3}
                  maxLength={2000}
                  placeholder="What just clicked?"
                  className="mt-1 w-full resize-none bg-transparent text-paper placeholder:text-mist/50 focus:outline-none"
                />
                <div className="flex justify-end">
                  <button type="button" onClick={addNote} disabled={notePending || !noteText.trim()} className="rounded-full bg-lucid px-4 py-1.5 text-sm font-semibold text-ink disabled:opacity-40">
                    {notePending ? "Saving…" : "Save note"}
                  </button>
                </div>
              </div>
              <ul className="mt-3 space-y-2">
                {notes.map((n) => (
                  <li key={n.id} className="group flex gap-3 rounded-2xl p-2 hover:bg-white/5">
                    <button type="button" onClick={() => pb.seek(n.atSeconds)} className="h-fit shrink-0 rounded-full bg-white/10 px-2 py-0.5 font-mono text-xs text-lucid hover:bg-lucid hover:text-ink">
                      {formatDuration(n.atSeconds)}
                    </button>
                    <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm">{n.body}</p>
                    <button type="button" onClick={() => removeNote(n.id)} aria-label="Delete note" className="text-xs text-mist opacity-0 transition hover:text-ember group-hover:opacity-100 focus:opacity-100">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
              {!notes.length ? <p className="mt-4 text-center text-sm text-mist">No notes yet. Press N anytime.</p> : null}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
