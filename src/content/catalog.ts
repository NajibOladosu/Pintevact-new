import { stableUuid } from "@/lib/ids";
import type { Chapter, Course, CourseTheme, Instructor, Interaction, Lesson, Module } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Authoring helpers, compact definitions, expanded into full types  */
/* ------------------------------------------------------------------ */

type Opt = [label: string, correct?: boolean, feedback?: string];

type InteractionDef =
  | { at: number; type: "quiz"; prompt: string; options: Opt[]; explanation: string }
  | { at: number; type: "reflection"; prompt: string; required?: boolean }
  | { at: number; type: "poll"; prompt: string; options: string[] }
  | { at: number; type: "insight"; prompt: string; body: string }
  | { at: number; type: "scale"; prompt: string; min?: number; max?: number; minLabel: string; maxLabel: string };

type LessonDef = {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  preview?: boolean;
  chapters?: [number, string][];
  takeaways: string[];
  exercise?: string;
  interactions: InteractionDef[];
};

type ModuleDef = { title: string; lessons: LessonDef[] };

type CourseDef = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: Course["level"];
  priceCents: number;
  theme: CourseTheme;
  glyph: string;
  instructor: Instructor;
  outcomes: string[];
  featured?: boolean;
  modules: ModuleDef[];
};

const XP: Record<Interaction["type"], number> = { quiz: 20, reflection: 15, poll: 10, insight: 5, scale: 10 };

function buildInteraction(courseSlug: string, lessonSlug: string, lessonId: string, def: InteractionDef, i: number): Interaction {
  const key = `${courseSlug}/${lessonSlug}/i${i}`;
  const base = {
    id: stableUuid(`interaction:${key}`),
    lessonId,
    atSeconds: def.at,
    type: def.type,
    prompt: def.prompt,
    xp: XP[def.type],
    required: def.type === "quiz" || (def.type === "reflection" && def.required === true),
  };
  switch (def.type) {
    case "quiz":
      return {
        ...base,
        explanation: def.explanation,
        options: def.options.map(([label, correct, feedback], j) => ({ id: `o${j + 1}`, label, correct: !!correct, feedback })),
      };
    case "poll":
      return { ...base, options: def.options.map((label, j) => ({ id: `o${j + 1}`, label })) };
    case "insight":
      return { ...base, body: def.body };
    case "scale":
      return { ...base, scale: { min: def.min ?? 1, max: def.max ?? 10, minLabel: def.minLabel, maxLabel: def.maxLabel } };
    default:
      return base;
  }
}

function defaultChapters(durationSeconds: number): Chapter[] {
  return [
    { atSeconds: 0, title: "The spark" },
    { atSeconds: Math.round(durationSeconds * 0.3), title: "What the research says" },
    { atSeconds: Math.round(durationSeconds * 0.68), title: "Make it yours" },
  ];
}

function buildCourse(def: CourseDef, position: number): Course {
  const courseId = stableUuid(`course:${def.slug}`);
  let lessonPos = 0;
  const modules: Module[] = def.modules.map((m, mi) => {
    const moduleId = stableUuid(`module:${def.slug}/${mi}`);
    return {
      id: moduleId,
      courseId,
      title: m.title,
      position: mi,
      lessons: m.lessons.map((l): Lesson => {
        const lessonId = stableUuid(`lesson:${def.slug}/${l.slug}`);
        const durationSeconds = l.minutes * 60;
        return {
          id: lessonId,
          courseId,
          moduleId,
          slug: l.slug,
          title: l.title,
          summary: l.summary,
          durationSeconds,
          bunnyVideoId: null,
          isPreview: !!l.preview,
          position: lessonPos++,
          chapters: l.chapters ? l.chapters.map(([atSeconds, title]) => ({ atSeconds, title })) : defaultChapters(durationSeconds),
          takeaways: l.takeaways,
          exercise: l.exercise ?? null,
          interactions: l.interactions
            .map((d, i) => buildInteraction(def.slug, l.slug, lessonId, d, i))
            .sort((a, b) => a.atSeconds - b.atSeconds),
        };
      }),
    };
  });
  return {
    id: courseId,
    slug: def.slug,
    title: def.title,
    subtitle: def.subtitle,
    description: def.description,
    category: def.category,
    level: def.level,
    priceCents: def.priceCents,
    currency: "usd",
    stripePriceId: null,
    theme: def.theme,
    glyph: def.glyph,
    coverImageUrl: null,
    instructor: def.instructor,
    outcomes: def.outcomes,
    published: true,
    featured: !!def.featured,
    position,
    modules,
  };
}

/* ------------------------------------------------------------------ */
/*  Instructors                                                         */
/* ------------------------------------------------------------------ */

const amara: Instructor = {
  name: "Dr. Amara Okafor",
  title: "Clinical Psychologist",
  bio: "Amara spent twelve years in private practice translating CBT and ACT research into tools people actually use on a Tuesday afternoon.",
};

/* ------------------------------------------------------------------ */
/*  Courses                                                             */
/* ------------------------------------------------------------------ */

const courseDefs: CourseDef[] = [
  {
    slug: "meet-your-mind",
    title: "Meet Your Mind",
    subtitle: "A free, interactive tour of the machinery behind every thought you have.",
    description:
      "Before you can use psychology to your advantage, you need a working map of your own mind. In this free starter course you'll meet your two thinking systems, learn why your brain lies to you (kindly), and complete your first self-portrait, all through videos that pause, ask, and listen.",
    category: "Foundations",
    level: "Beginner",
    priceCents: 0,
    theme: "lucid",
    glyph: "◐",
    instructor: amara,
    featured: true,
    outcomes: [
      "Name your two modes of thinking and catch them in action",
      "Spot three everyday mental shortcuts steering your choices",
      "Build a first 'self-portrait' you'll refine across Pintevact",
    ],
    modules: [
      {
        title: "Your Two Minds",
        lessons: [
          {
            slug: "the-elephant-and-the-rider",
            title: "The Elephant and the Rider",
            summary: "Meet the fast, emotional you and the slow, deliberate you, and learn who's really driving.",
            minutes: 7,
            preview: true,
            takeaways: [
              "System 1 is fast, automatic and emotional; System 2 is slow, effortful and logical.",
              "Most daily decisions are made by System 1 and justified afterwards by System 2.",
              "Change sticks when you direct the rider AND motivate the elephant.",
            ],
            exercise: "Today, catch one decision you made in under a second. Write down what your 'elephant' wanted and what your 'rider' said about it afterwards.",
            interactions: [
              { at: 45, type: "poll", prompt: "Right now, which one feels more in charge of your life?", options: ["The elephant (feelings, impulses)", "The rider (plans, logic)", "They take turns", "Honestly? Nobody"] },
              {
                at: 180,
                type: "quiz",
                prompt: "A bat and a ball cost $1.10. The bat costs $1.00 more than the ball. How much is the ball?",
                options: [["10 cents", false, "That's System 1 talking, fast, confident, wrong."], ["5 cents", true, "Your rider stepped in. $0.05 + $1.05 = $1.10."], ["1 cent"], ["15 cents"]],
                explanation: "Over 50% of students at elite universities answer 10 cents. The intuitive answer arrives first and feels right, that's System 1.",
              },
              { at: 300, type: "reflection", prompt: "Describe a recent moment where your elephant overpowered your rider. What happened just before?" },
            ],
          },
          {
            slug: "your-brain-is-a-prediction-machine",
            title: "Your Brain Is a Prediction Machine",
            summary: "You don't see the world as it is, you see what your brain expects. Here's how to use that.",
            minutes: 8,
            takeaways: [
              "Perception is a controlled hallucination: the brain predicts, then checks.",
              "Expectations literally change experience (placebo, pain, taste).",
              "Updating predictions is the essence of learning about yourself.",
            ],
            exercise: "Pick one recurring situation you dread. Write your prediction for it, then after it happens, grade how accurate it was.",
            interactions: [
              { at: 60, type: "insight", prompt: "Mind fact", body: "Your brain uses about 20% of your energy while being only 2% of your body weight. Predicting is cheaper than perceiving, so it predicts constantly." },
              {
                at: 220,
                type: "quiz",
                prompt: "Why does the same wine taste better when people are told it's expensive?",
                options: [["Expensive wine is always better"], ["Expectation changes how the brain processes the taste", true], ["People lie to seem sophisticated"], ["Price changes the chemistry of wine"]],
                explanation: "fMRI studies show higher activity in pleasure-related regions when people believe the wine costs more, expectation shapes experience itself.",
              },
              { at: 380, type: "scale", prompt: "How often do your predictions about social situations turn out worse than reality?", minLabel: "Never", maxLabel: "Almost always" },
            ],
          },
        ],
      },
      {
        title: "Your First Self-Portrait",
        lessons: [
          {
            slug: "the-shortcuts-that-run-your-day",
            title: "The Shortcuts That Run Your Day",
            summary: "Anchoring, availability and the spotlight effect, three biases you can start catching today.",
            minutes: 9,
            takeaways: [
              "Anchoring: the first number you hear bends every estimate after it.",
              "Availability: vivid memories feel more frequent than they are.",
              "Spotlight effect: people notice you far less than you think.",
            ],
            exercise: "For 24 hours, tally every time you catch yourself thinking 'everyone will notice'. Then ask: who actually did?",
            interactions: [
              {
                at: 120,
                type: "quiz",
                prompt: "After seeing a plane crash on the news, people overestimate the risk of flying. Which bias is this?",
                options: [["Anchoring"], ["Availability heuristic", true], ["Confirmation bias"], ["Sunk cost fallacy"]],
                explanation: "Vivid, recent, emotional examples come to mind easily, so our brain treats them as common.",
              },
              { at: 300, type: "poll", prompt: "Which shortcut do you suspect trips you up most?", options: ["Anchoring", "Availability", "Spotlight effect", "All of them, frankly"] },
              { at: 450, type: "reflection", prompt: "Where has the spotlight effect made you play small? What would you do if nobody was watching?" },
            ],
          },
          {
            slug: "drawing-your-inner-map",
            title: "Drawing Your Inner Map",
            summary: "Values, energizers and drainers, sketch the first version of who you are right now.",
            minutes: 8,
            takeaways: [
              "Values are directions, not destinations, you never 'finish' them.",
              "Energy audits reveal your values faster than introspection alone.",
              "Your self-portrait is a draft. Pintevact is where you revise it.",
            ],
            exercise: "List five activities from last week. Mark each + (energizing) or - (draining). What do the pluses have in common?",
            interactions: [
              { at: 90, type: "scale", prompt: "How clearly could you name your top three values today?", minLabel: "No idea", maxLabel: "Crystal clear" },
              { at: 260, type: "reflection", prompt: "Name one activity that makes you lose track of time. What value might it be honoring?", required: true },
              { at: 420, type: "insight", prompt: "Carry this forward", body: "Your reflections are saved in your Reflection Vault. Every course adds a new layer to your inner map." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "emotional-alchemy",
    title: "Emotional Alchemy",
    subtitle: "Turn anxiety, anger and overwhelm into information, and then into action.",
    description:
      "Emotions aren't problems to fix; they're data to decode. Drawing on CBT, ACT and affect-labelling research, Emotional Alchemy teaches you to name what you feel with precision, defuse spiralling thoughts, and respond instead of react. Every lesson pauses to have you practice on your own real feelings.",
    category: "Emotions",
    level: "Beginner",
    priceCents: 7900,
    theme: "ember",
    glyph: "✺",
    instructor: amara,
    featured: true,
    outcomes: [
      "Expand your emotional vocabulary beyond 'fine', 'stressed' and 'tired'",
      "Use cognitive defusion to unhook from sticky thoughts in under a minute",
      "Build a personal regulation toolkit for high-pressure moments",
    ],
    modules: [
      {
        title: "Name It to Tame It",
        lessons: [
          {
            slug: "emotional-granularity",
            title: "Emotional Granularity",
            summary: "People who describe feelings precisely recover faster. Let's upgrade your vocabulary.",
            minutes: 10,
            preview: true,
            takeaways: [
              "Emotional granularity predicts better regulation and less binge behaviour.",
              "Labelling a feeling reduces amygdala activity (affect labelling).",
              "Aim for two-word labels: 'disappointed and relieved' beats 'meh'.",
            ],
            exercise: "Three times today, stop and name what you feel using at least two precise words from the emotion wheel.",
            interactions: [
              { at: 70, type: "poll", prompt: "What's the most common answer you give to 'How are you?'", options: ["Fine / good", "Busy", "Tired", "I actually tell the truth"] },
              {
                at: 240,
                type: "quiz",
                prompt: "In UCLA studies, what happened when people put feelings into words while viewing distressing images?",
                options: [["Distress increased"], ["Amygdala activity decreased", true], ["Nothing measurable"], ["They forgot the images"]],
                explanation: "Affect labelling engages the prefrontal cortex, which dampens the amygdala's alarm response.",
              },
              { at: 420, type: "reflection", prompt: "Right now, in two precise words, what are you feeling? What might it be telling you?", required: true },
            ],
          },
          {
            slug: "the-body-keeps-the-score-card",
            title: "The Body Keeps the Scorecard",
            summary: "Interoception: reading the signals your body sends before your mind catches up.",
            minutes: 9,
            takeaways: [
              "Emotions show up in the body before they show up in words.",
              "Interoceptive awareness is trainable in as little as a few weeks.",
              "A 60-second body scan is a regulation tool you can use anywhere.",
            ],
            exercise: "Set three random alarms. When each rings, locate where in your body you feel something and rate its intensity 1-10.",
            interactions: [
              { at: 100, type: "scale", prompt: "How well can you usually feel your own heartbeat without touching your pulse?", minLabel: "Not at all", maxLabel: "Very clearly" },
              { at: 300, type: "insight", prompt: "Try it now", body: "Close your eyes for 15 seconds. Notice your jaw, shoulders and stomach. Tension in any of them is information, not a verdict." },
              {
                at: 450,
                type: "quiz",
                prompt: "What is interoception?",
                options: [["Reading other people's emotions"], ["Sensing the internal state of your body", true], ["A type of meditation"], ["Suppressing physical sensations"]],
                explanation: "Interoception is the perception of internal bodily signals, heartbeat, breath, hunger, tension.",
              },
            ],
          },
        ],
      },
      {
        title: "Unhooking From Your Thoughts",
        lessons: [
          {
            slug: "you-are-not-your-thoughts",
            title: "You Are Not Your Thoughts",
            summary: "Cognitive defusion: watch thoughts like passing cars instead of jumping in front of them.",
            minutes: 11,
            takeaways: [
              "Thoughts are mental events, not facts or commands.",
              "Prefixing 'I'm having the thought that…' creates instant distance.",
              "Fighting a thought often strengthens it (ironic process theory).",
            ],
            exercise: "Write your harshest recurring self-criticism. Now rewrite it as 'I notice I'm having the thought that…'. Read both aloud.",
            interactions: [
              {
                at: 150,
                type: "quiz",
                prompt: "Try not to think of a white bear. According to Wegner's research, what happens?",
                options: [["You easily avoid it"], ["You think of it more", true], ["You think of a black bear"], ["The thought fades immediately"]],
                explanation: "Thought suppression triggers a monitoring process that keeps checking for the forbidden thought, bringing it back.",
              },
              { at: 330, type: "reflection", prompt: "Write one sticky thought, then rewrite it starting with 'I notice I'm having the thought that…'. What changed?" },
              { at: 520, type: "scale", prompt: "After defusion, how much does that thought grip you now?", minLabel: "Barely", maxLabel: "Still intensely" },
            ],
          },
          {
            slug: "reframing-without-toxic-positivity",
            title: "Reframing Without Toxic Positivity",
            summary: "Cognitive reappraisal that's honest: find the more useful true story.",
            minutes: 10,
            takeaways: [
              "Reappraisal changes the meaning, not the facts.",
              "Useful reframes are believable, forced positivity backfires.",
              "Anxiety reappraised as excitement improves performance.",
            ],
            exercise: "Before your next nervous moment, say out loud 'I am excited'. Notice what changes.",
            interactions: [
              { at: 120, type: "poll", prompt: "When someone says 'just think positive', you feel…", options: ["Helped", "Annoyed", "Invalidated", "Depends who says it"] },
              {
                at: 340,
                type: "quiz",
                prompt: "In Alison Wood Brooks' study, people who said 'I am excited' before singing karaoke…",
                options: [["Performed worse"], ["Performed better than those who said 'I am calm'", true], ["Refused to sing"], ["Performed the same"]],
                explanation: "Anxiety and excitement are both high-arousal states, relabelling is easier than calming down.",
              },
              { at: 480, type: "reflection", prompt: "Take a current worry. What's a reframe that is both TRUE and more useful?" },
            ],
          },
        ],
      },
      {
        title: "Your Regulation Toolkit",
        lessons: [
          {
            slug: "the-physiological-sigh",
            title: "The Physiological Sigh",
            summary: "The fastest known real-time stress reset, and why it works.",
            minutes: 6,
            takeaways: [
              "Double inhale + long exhale offloads CO₂ and slows heart rate.",
              "Exhale-emphasised breathing outperformed mindfulness for mood in a Stanford trial.",
              "Physiology is the quickest door into psychology.",
            ],
            exercise: "Do five physiological sighs right now and once more before bed. Rate your calm before and after.",
            interactions: [
              { at: 60, type: "scale", prompt: "Rate your current stress level.", minLabel: "Serene", maxLabel: "Frazzled" },
              { at: 200, type: "insight", prompt: "Practice", body: "Inhale through the nose. Top up with a second short inhale. Then exhale slowly through the mouth. Repeat three times." },
              { at: 300, type: "scale", prompt: "Rate your stress level again after three sighs.", minLabel: "Serene", maxLabel: "Frazzled" },
            ],
          },
          {
            slug: "building-your-emotional-first-aid-kit",
            title: "Building Your Emotional First-Aid Kit",
            summary: "Match the right tool to the right feeling, and pre-commit before the storm hits.",
            minutes: 9,
            takeaways: [
              "Different emotions need different tools, no single fix works for all.",
              "If-then plans make regulation automatic under stress.",
              "Your kit should live somewhere you'll see it when flooded.",
            ],
            exercise: "Write three if-then plans: 'If I feel ___, then I will ___.' Save them as your phone lock screen.",
            interactions: [
              { at: 150, type: "poll", prompt: "Which emotion hijacks you most often?", options: ["Anxiety", "Anger", "Sadness", "Shame"] },
              {
                at: 330,
                type: "quiz",
                prompt: "Why are if-then plans (implementation intentions) so effective?",
                options: [["They rely on willpower"], ["They hand the decision to an automatic cue", true], ["They make goals bigger"], ["They remove emotions"]],
                explanation: "Implementation intentions delegate control to the situation, so you act without deliberating when stressed.",
              },
              { at: 480, type: "reflection", prompt: "Write your first if-then plan for the emotion that hijacks you most.", required: true },
            ],
          },
        ],
      },
    ],
  },
];

export const catalog: Course[] = courseDefs.map(buildCourse);

export const categories = Array.from(new Set(catalog.map((c) => c.category)));

export function findCourse(slug: string) {
  return catalog.find((c) => c.slug === slug) ?? null;
}
