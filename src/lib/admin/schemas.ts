import { z } from "zod";
import { slugify } from "@/lib/utils";

/*
 * Validation for everything the admin can write. Kept free of server imports so the same rules
 * run in unit tests and, where useful, in the browser.
 */

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Use at least 2 characters")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single dashes");

/** Picks a slug not in `taken`, adding -2, -3… as needed. */
export function uniqueSlug(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  const root = slugify(base).slice(0, 72) || "untitled";
  if (!used.has(root)) return root;
  for (let n = 2; ; n++) if (!used.has(`${root}-${n}`)) return `${root}-${n}`;
}

/** One entry per line, blanks dropped. */
const lines = (max: number, each = 300) =>
  z
    .string()
    .max(max * (each + 2))
    .transform((v) => v.split("\n").map((l) => l.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(each, `Keep each line under ${each} characters`)).max(max, `Keep it to ${max} lines`));

export const THEMES = ["ember", "iris", "lucid", "tide", "sun", "blush"] as const;
export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const newCourseSchema = z.object({
  title: z.string().trim().min(2, "Give the course a title").max(120),
});

export const courseDetailsSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(2, "Give the course a title").max(120),
  slug: slugSchema,
  subtitle: z.string().trim().max(300),
  description: z.string().trim().max(5000),
  category: z.string().trim().min(2, "Add a category").max(40),
  level: z.enum(LEVELS),
  priceCents: z.number().int().min(0).max(1_000_000),
  stripePriceId: z
    .string()
    .trim()
    .max(100)
    .refine((v) => !v || v.startsWith("price_"), "Stripe price IDs start with price_")
    .transform((v) => v || null),
  theme: z.enum(THEMES),
  outcomes: lines(12),
  instructorName: z.string().trim().max(80),
  instructorTitle: z.string().trim().max(80),
  instructorBio: z.string().trim().max(600),
  published: z.boolean(),
  featured: z.boolean(),
});
export type CourseDetails = z.infer<typeof courseDetailsSchema>;

const chapterLine = /^(?:(\d{1,3}):)?(\d{1,2}):(\d{2})\s+(.+)$/;

/** "mm:ss Title" (or "h:mm:ss Title") per line → chapters, sorted by time. */
export const chaptersSchema = z
  .string()
  .max(4000)
  .transform((v, ctx) => {
    const out: { atSeconds: number; title: string }[] = [];
    for (const [i, raw] of v.split("\n").entries()) {
      const line = raw.trim();
      if (!line) continue;
      const m = line.match(chapterLine);
      if (!m) {
        ctx.addIssue({ code: "custom", message: `Line ${i + 1}: write chapters as "2:30 Title"` });
        return z.NEVER;
      }
      const seconds = Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]);
      out.push({ atSeconds: seconds, title: m[4].slice(0, 120) });
    }
    return out.sort((a, b) => a.atSeconds - b.atSeconds);
  });

export function formatChapters(chapters: { atSeconds: number; title: string }[]) {
  return chapters.map((c) => `${formatClock(c.atSeconds)} ${c.title}`).join("\n");
}

/** 75 → "1:15", 3725 → "1:02:05". */
export function formatClock(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

/** "1:15", "75" or "1:02:05" → seconds. */
export function parseClock(input: string): number | null {
  const v = input.trim();
  if (/^\d+$/.test(v)) return Number(v);
  const m = v.match(/^(?:(\d+):)?(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

export const lessonDetailsSchema = z.object({
  lessonId: z.string().uuid(),
  title: z.string().trim().min(2, "Give the lesson a title").max(160),
  slug: slugSchema,
  summary: z.string().trim().max(600),
  durationSeconds: z.number().int().min(1, "Set how long the video is").max(60 * 60 * 6),
  isPreview: z.boolean(),
  chapters: chaptersSchema,
  takeaways: lines(8),
  exercise: z
    .string()
    .trim()
    .max(1000)
    .transform((v) => v || null),
});
export type LessonDetails = z.infer<typeof lessonDetailsSchema>;

/* ─── Checkpoints ──────────────────────────────────────────────────── */

const prompt = z.string().trim().min(3, "Write the question or prompt").max(500);
const optionLabel = z.string().trim().min(1, "Options can't be empty").max(200);

const base = {
  id: z.string().uuid().optional(),
  atSeconds: z.number().int().min(1, "Checkpoints start after 0:00"),
  prompt,
  xp: z.number().int().min(0).max(500),
};

export const interactionSchema = z
  .discriminatedUnion("type", [
    z.object({
      ...base,
      type: z.literal("quiz"),
      options: z
        .array(z.object({ label: optionLabel, correct: z.boolean(), feedback: z.string().trim().max(300).optional() }))
        .min(2, "Give at least two answers")
        .max(6),
      explanation: z.string().trim().max(800),
    }),
    z.object({ ...base, type: z.literal("reflection"), required: z.boolean() }),
    z.object({ ...base, type: z.literal("poll"), options: z.array(z.object({ label: optionLabel })).min(2, "Give at least two choices").max(6) }),
    z.object({ ...base, type: z.literal("insight"), body: z.string().trim().min(3, "Write the insight").max(1200) }),
    z.object({
      ...base,
      type: z.literal("scale"),
      min: z.number().int().min(0).max(10),
      max: z.number().int().min(1).max(10),
      minLabel: z.string().trim().min(1, "Label the low end").max(60),
      maxLabel: z.string().trim().min(1, "Label the high end").max(60),
    }),
  ])
  .superRefine((v, ctx) => {
    if (v.type === "quiz" && v.options.filter((o) => o.correct).length !== 1) ctx.addIssue({ code: "custom", path: ["options"], message: "Mark exactly one answer as correct" });
    if (v.type === "scale" && v.max <= v.min) ctx.addIssue({ code: "custom", path: ["max"], message: "The high end must be above the low end" });
  });
export type InteractionInput = z.infer<typeof interactionSchema>;

/** Database row for a checkpoint. Quizzes are always required; reflections only when marked. */
export function interactionRow(input: InteractionInput) {
  const row = {
    at_seconds: input.atSeconds,
    type: input.type,
    prompt: input.prompt,
    xp: input.xp,
    required: input.type === "quiz" || (input.type === "reflection" && input.required),
    options: null as unknown,
    explanation: null as string | null,
    body: null as string | null,
    scale: null as unknown,
  };
  if (input.type === "quiz") {
    row.options = input.options.map((o, i) => ({ id: `o${i + 1}`, label: o.label, correct: o.correct, ...(o.feedback ? { feedback: o.feedback } : {}) }));
    row.explanation = input.explanation || null;
  }
  if (input.type === "poll") row.options = input.options.map((o, i) => ({ id: `o${i + 1}`, label: o.label }));
  if (input.type === "insight") row.body = input.body;
  if (input.type === "scale") row.scale = { min: input.min, max: input.max, minLabel: input.minLabel, maxLabel: input.maxLabel };
  return row;
}

export const DEFAULT_XP = { quiz: 20, reflection: 15, poll: 10, insight: 5, scale: 10 } as const;

/* ─── Curriculum order ─────────────────────────────────────────────── */

export const layoutSchema = z
  .array(z.object({ id: z.string().uuid(), lessons: z.array(z.string().uuid()) }))
  .min(1)
  .refine((mods) => {
    const ids = mods.flatMap((m) => m.lessons);
    return new Set(ids).size === ids.length && new Set(mods.map((m) => m.id)).size === mods.length;
  }, "Each module and lesson can only appear once");
export type CurriculumLayout = z.infer<typeof layoutSchema>;

/* ─── Learners ─────────────────────────────────────────────────────── */

export const userProfileSchema = z.object({
  userId: z.string().uuid(),
  fullName: z
    .string()
    .trim()
    .max(80)
    .transform((v) => v || null),
  headline: z
    .string()
    .trim()
    .max(120)
    .transform((v) => v || null),
  emailOptIn: z.boolean(),
});
