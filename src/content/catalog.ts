import { stableUuid } from "@/lib/ids";
import type { Chapter, Course, CourseTheme, Instructor, Interaction, Lesson, Module } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Authoring helpers — compact definitions, expanded into full types  */
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
const theo: Instructor = {
  name: "Theo Lindqvist",
  title: "Behavioral Scientist",
  bio: "Theo designs habit and decision systems for health start-ups and teaches behavioral economics without the jargon.",
};
const noor: Instructor = {
  name: "Noor Haddad, MA",
  title: "Relationship & Attachment Researcher",
  bio: "Noor studies how early bonds shape adult love, friendship and work — and how people rewrite those patterns.",
};
const kenji: Instructor = {
  name: "Kenji Moreau",
  title: "Cognitive Performance Coach",
  bio: "A former competitive chess player turned attention researcher, Kenji coaches founders and athletes on deep focus.",
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
      "Before you can use psychology to your advantage, you need a working map of your own mind. In this free starter course you'll meet your two thinking systems, learn why your brain lies to you (kindly), and complete your first self-portrait — all through videos that pause, ask, and listen.",
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
            summary: "Meet the fast, emotional you and the slow, deliberate you — and learn who's really driving.",
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
                options: [["10 cents", false, "That's System 1 talking — fast, confident, wrong."], ["5 cents", true, "Your rider stepped in. $0.05 + $1.05 = $1.10."], ["1 cent"], ["15 cents"]],
                explanation: "Over 50% of students at elite universities answer 10 cents. The intuitive answer arrives first and feels right — that's System 1.",
              },
              { at: 300, type: "reflection", prompt: "Describe a recent moment where your elephant overpowered your rider. What happened just before?" },
            ],
          },
          {
            slug: "your-brain-is-a-prediction-machine",
            title: "Your Brain Is a Prediction Machine",
            summary: "You don't see the world as it is — you see what your brain expects. Here's how to use that.",
            minutes: 8,
            takeaways: [
              "Perception is a controlled hallucination: the brain predicts, then checks.",
              "Expectations literally change experience (placebo, pain, taste).",
              "Updating predictions is the essence of learning about yourself.",
            ],
            exercise: "Pick one recurring situation you dread. Write your prediction for it, then after it happens, grade how accurate it was.",
            interactions: [
              { at: 60, type: "insight", prompt: "Mind fact", body: "Your brain uses about 20% of your energy while being only 2% of your body weight. Predicting is cheaper than perceiving — so it predicts constantly." },
              {
                at: 220,
                type: "quiz",
                prompt: "Why does the same wine taste better when people are told it's expensive?",
                options: [["Expensive wine is always better"], ["Expectation changes how the brain processes the taste", true], ["People lie to seem sophisticated"], ["Price changes the chemistry of wine"]],
                explanation: "fMRI studies show higher activity in pleasure-related regions when people believe the wine costs more — expectation shapes experience itself.",
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
            summary: "Anchoring, availability and the spotlight effect — three biases you can start catching today.",
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
            summary: "Values, energizers and drainers — sketch the first version of who you are right now.",
            minutes: 8,
            takeaways: [
              "Values are directions, not destinations — you never 'finish' them.",
              "Energy audits reveal your values faster than introspection alone.",
              "Your self-portrait is a draft. Pintevact is where you revise it.",
            ],
            exercise: "List five activities from last week. Mark each + (energizing) or – (draining). What do the pluses have in common?",
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
    subtitle: "Turn anxiety, anger and overwhelm into information — and then into action.",
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
            exercise: "Set three random alarms. When each rings, locate where in your body you feel something and rate its intensity 1–10.",
            interactions: [
              { at: 100, type: "scale", prompt: "How well can you usually feel your own heartbeat without touching your pulse?", minLabel: "Not at all", maxLabel: "Very clearly" },
              { at: 300, type: "insight", prompt: "Try it now", body: "Close your eyes for 15 seconds. Notice your jaw, shoulders and stomach. Tension in any of them is information, not a verdict." },
              {
                at: 450,
                type: "quiz",
                prompt: "What is interoception?",
                options: [["Reading other people's emotions"], ["Sensing the internal state of your body", true], ["A type of meditation"], ["Suppressing physical sensations"]],
                explanation: "Interoception is the perception of internal bodily signals — heartbeat, breath, hunger, tension.",
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
                explanation: "Thought suppression triggers a monitoring process that keeps checking for the forbidden thought — bringing it back.",
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
              "Useful reframes are believable — forced positivity backfires.",
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
                explanation: "Anxiety and excitement are both high-arousal states — relabelling is easier than calming down.",
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
            summary: "The fastest known real-time stress reset — and why it works.",
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
              "Different emotions need different tools — no single fix works for all.",
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
  {
    slug: "the-persuasion-lab",
    title: "The Persuasion Lab",
    subtitle: "The ethical science of influence — how to be heard, trusted and followed.",
    description:
      "Influence isn't manipulation when it helps people make choices they'll thank you for. In The Persuasion Lab you'll run live experiments on yourself and others using the principles of reciprocity, social proof, framing and narrative — and learn to spot when they're being used on you.",
    category: "Influence",
    level: "Intermediate",
    priceCents: 9900,
    theme: "iris",
    glyph: "◆",
    instructor: theo,
    featured: true,
    outcomes: [
      "Apply the seven principles of influence ethically at work and home",
      "Frame requests so people want to say yes",
      "Recognise and defuse manipulation tactics used on you",
    ],
    modules: [
      {
        title: "The Principles",
        lessons: [
          {
            slug: "reciprocity-and-the-gift-effect",
            title: "Reciprocity & the Gift Effect",
            summary: "Why a mint with the bill raises tips — and how to give first without keeping score.",
            minutes: 9,
            preview: true,
            takeaways: [
              "People feel compelled to return favours, even unrequested ones.",
              "Personalised, unexpected gifts trigger reciprocity most strongly.",
              "Ethical reciprocity gives value first with no strings attached.",
            ],
            exercise: "Give one unexpected, personalised bit of help today with zero expectation. Note how the relationship shifts over the week.",
            interactions: [
              {
                at: 140,
                type: "quiz",
                prompt: "In the restaurant mint study, which gesture increased tips the most?",
                options: [["One mint with the bill"], ["Two mints with the bill"], ["One mint, then the server returns with a second 'just for you'", true], ["No mints but a smile"]],
                explanation: "Tips rose ~23% when the server returned with an extra mint — personalised and unexpected beats bigger.",
              },
              { at: 320, type: "poll", prompt: "When someone does you a favour, you feel…", options: ["Grateful", "Indebted", "Suspicious", "It depends on who"] },
              { at: 470, type: "reflection", prompt: "Who could you give something unexpected and personal to this week?" },
            ],
          },
          {
            slug: "social-proof-and-the-herd",
            title: "Social Proof & the Herd",
            summary: "We look to others when we're uncertain. Use it to lead, and resist it when it misleads.",
            minutes: 10,
            takeaways: [
              "Uncertainty + similarity = maximum social-proof power.",
              "Highlighting how many people do the wrong thing can backfire.",
              "Pluralistic ignorance keeps groups silent — someone has to move first.",
            ],
            exercise: "Notice three decisions today you made because 'everyone does it'. Would you make them alone?",
            interactions: [
              { at: 110, type: "scale", prompt: "How influenced are you by reviews and ratings when buying something?", minLabel: "Not at all", maxLabel: "Completely" },
              {
                at: 300,
                type: "quiz",
                prompt: "Which hotel towel sign got the most guests to reuse towels?",
                options: [["'Help save the environment'"], ["'Most guests reuse their towels'"], ["'Most guests who stayed in THIS room reuse their towels'", true], ["'Towel reuse saves us money'"]],
                explanation: "The more similar the reference group, the stronger the norm — even a shared room number counts.",
              },
              { at: 500, type: "insight", prompt: "Watch for the reverse", body: "'Thousands of people are still not saving for retirement!' normalises the bad behaviour. Show the norm you want." },
            ],
          },
        ],
      },
      {
        title: "Framing & Story",
        lessons: [
          {
            slug: "the-frame-is-the-message",
            title: "The Frame Is the Message",
            summary: "Gain vs loss, 90% vs 10% — how identical facts produce opposite decisions.",
            minutes: 10,
            takeaways: [
              "Losses loom roughly twice as large as equivalent gains.",
              "Attribute framing ('90% lean') changes judgement of identical facts.",
              "Choose frames that make the true benefits vivid.",
            ],
            exercise: "Rewrite one request you need to make this week in both a gain and a loss frame. Which feels more honest and more persuasive?",
            interactions: [
              { at: 90, type: "poll", prompt: "Which surgery would you choose?", options: ["90% survival rate", "10% mortality rate", "They're identical — no preference"] },
              {
                at: 280,
                type: "quiz",
                prompt: "Loss aversion suggests losing $100 feels about as intense as gaining…",
                options: [["$50"], ["$100"], ["$200", true], ["$1,000"]],
                explanation: "Kahneman & Tversky estimated losses weigh about twice as much as gains.",
              },
              { at: 460, type: "reflection", prompt: "Reframe a request you need to make this week. Write both versions." },
            ],
          },
          {
            slug: "narrative-transport",
            title: "Narrative Transport",
            summary: "Stories bypass counter-arguing. Learn a simple structure for persuasive stories.",
            minutes: 11,
            takeaways: [
              "When people are 'transported' into a story, they argue back less.",
              "A good persuasive story: character, struggle, turning point, change.",
              "Specific sensory details make stories believable.",
            ],
            exercise: "Tell a 60-second story about why you care about your work. Record it. Listen back for one sensory detail.",
            interactions: [
              { at: 160, type: "insight", prompt: "Story skeleton", body: "Someone wanted something → something got in the way → they discovered something → they changed. That's it." },
              {
                at: 360,
                type: "quiz",
                prompt: "Why are stories so persuasive?",
                options: [["They contain more facts"], ["Transportation reduces counter-arguing", true], ["People trust storytellers more"], ["They're shorter"]],
                explanation: "Green & Brock showed absorbed readers critique claims less and adopt story-consistent beliefs.",
              },
              { at: 560, type: "reflection", prompt: "Draft your 60-second story using the skeleton: want → obstacle → discovery → change." },
            ],
          },
        ],
      },
      {
        title: "Defence Against the Dark Arts",
        lessons: [
          {
            slug: "spotting-manipulation",
            title: "Spotting Manipulation",
            summary: "False scarcity, foot-in-the-door and guilt trips — and scripts to calmly decline.",
            minutes: 9,
            takeaways: [
              "Manufactured urgency is the most common manipulation tactic.",
              "Ask: 'Would I say yes if this offer were available tomorrow?'",
              "A calm, repeated 'That doesn't work for me' is a complete answer.",
            ],
            exercise: "Unsubscribe from one marketing list that relies on fake urgency. Notice how you feel a week later.",
            interactions: [
              { at: 120, type: "poll", prompt: "Which tactic gets you most often?", options: ["'Only 2 left!'", "Small ask, then big ask", "Guilt", "Flattery"] },
              {
                at: 330,
                type: "quiz",
                prompt: "A salesperson gets you to agree to a tiny request, then asks for a bigger one. This is…",
                options: [["Door-in-the-face"], ["Foot-in-the-door", true], ["Anchoring"], ["Reciprocity"]],
                explanation: "Agreeing to small requests shifts your self-image ('I'm someone who helps'), making larger requests easier.",
              },
              { at: 480, type: "reflection", prompt: "Recall a time you were pressured into a yes. What script would you use now?" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "habit-architecture",
    title: "Habit Architecture",
    subtitle: "Design your environment so the right behaviour becomes the easy behaviour.",
    description:
      "Willpower is a terrible strategy. Habit Architecture teaches you to engineer cues, friction and identity so good habits run on autopilot and bad ones quietly starve. You'll leave with a working habit system you designed yourself, tested live inside the lessons.",
    category: "Habits",
    level: "Beginner",
    priceCents: 6900,
    theme: "tide",
    glyph: "▲",
    instructor: theo,
    outcomes: [
      "Map the cue–routine–reward loops behind your current habits",
      "Use friction and defaults to make change effortless",
      "Build identity-based habits that survive bad weeks",
    ],
    modules: [
      {
        title: "How Habits Really Form",
        lessons: [
          {
            slug: "the-habit-loop",
            title: "The Habit Loop",
            summary: "Cue, routine, reward — and the craving that powers the whole engine.",
            minutes: 8,
            preview: true,
            takeaways: [
              "About 40% of daily actions are habits, not decisions.",
              "Habits form through repetition in a stable context.",
              "Change the cue or the reward and the routine follows.",
            ],
            exercise: "Track one habit you want to change for 3 days. Log the cue (time, place, emotion, people, preceding action) each time.",
            interactions: [
              { at: 80, type: "scale", prompt: "How much of your day do you think runs on autopilot?", min: 0, max: 100, minLabel: "0%", maxLabel: "100%" },
              {
                at: 250,
                type: "quiz",
                prompt: "On average, how long did it take participants to form a new habit in Lally's UCL study?",
                options: [["21 days"], ["66 days", true], ["7 days"], ["1 year"]],
                explanation: "The average was 66 days, with a huge range (18–254). The 21-day myth comes from a 1960s plastic surgery book.",
              },
              { at: 400, type: "reflection", prompt: "Pick one habit to change. What are its cue, routine and reward?", required: true },
            ],
          },
          {
            slug: "friction-is-a-superpower",
            title: "Friction Is a Superpower",
            summary: "Twenty seconds of effort can make or break a habit. Move the friction.",
            minutes: 9,
            takeaways: [
              "Small increases in effort drastically reduce behaviour.",
              "Add friction to bad habits; remove it from good ones.",
              "Defaults are the most powerful form of friction design.",
            ],
            exercise: "Make one bad habit 20 seconds harder and one good habit 20 seconds easier. Report back in your reflection vault.",
            interactions: [
              { at: 120, type: "poll", prompt: "Where's your phone when you sleep?", options: ["Next to my pillow", "On the nightstand", "Across the room", "Another room"] },
              {
                at: 300,
                type: "quiz",
                prompt: "Countries where organ donation is opt-out have donor rates of…",
                options: [["About the same as opt-in"], ["Slightly higher"], ["Often above 90%", true], ["Lower, due to backlash"]],
                explanation: "Defaults are powerful: opt-out countries like Austria saw ~99% consent vs ~12% in opt-in Germany (Johnson & Goldstein, 2003).",
              },
              { at: 460, type: "reflection", prompt: "What's one piece of friction you'll add, and one you'll remove, this week?" },
            ],
          },
        ],
      },
      {
        title: "Designing for Your Future Self",
        lessons: [
          {
            slug: "identity-based-habits",
            title: "Identity-Based Habits",
            summary: "Every action is a vote for the type of person you're becoming.",
            minutes: 10,
            takeaways: [
              "Outcome goals fade; identity statements persist.",
              "'I'm a runner' outperforms 'I'm trying to run'.",
              "Small wins are evidence that rewrites self-image.",
            ],
            exercise: "Write the identity you want in one sentence: 'I am the kind of person who…'. Do one tiny action today that proves it.",
            interactions: [
              {
                at: 180,
                type: "quiz",
                prompt: "In Bryan et al.'s voting study, which phrasing increased turnout more?",
                options: [["'How important is it to vote?'"], ["'How important is it to be a voter?'", true], ["Both equally"], ["Neither changed turnout"]],
                explanation: "Framing the behaviour as an identity (noun) rather than an action (verb) increased turnout by over 10 percentage points.",
              },
              { at: 380, type: "reflection", prompt: "Complete: 'I am the kind of person who…'", required: true },
              { at: 520, type: "insight", prompt: "Two-minute rule", body: "Scale any new habit down until it takes under two minutes. Master showing up before you optimise." },
            ],
          },
          {
            slug: "surviving-the-bad-week",
            title: "Surviving the Bad Week",
            summary: "Never miss twice, habit recovery plans and self-compassion that actually works.",
            minutes: 8,
            takeaways: [
              "Missing once doesn't break a habit; missing twice starts a new one.",
              "Self-compassion predicts faster recovery than self-criticism.",
              "Plan for failure before it happens.",
            ],
            exercise: "Write your 'bad week' minimum version of your key habit — the smallest action that still counts.",
            interactions: [
              { at: 140, type: "scale", prompt: "When you slip up, how harsh is your inner voice?", minLabel: "Kind", maxLabel: "Brutal" },
              { at: 320, type: "insight", prompt: "Self-compassion isn't soft", body: "In studies by Breines & Chen, self-compassionate participants studied longer after failing a test than self-critical ones." },
              { at: 420, type: "reflection", prompt: "What's the minimum version of your habit for a terrible week?" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "attachment-and-you",
    title: "Attachment & You",
    subtitle: "Understand the invisible blueprint behind how you love, trust and connect.",
    description:
      "Why do some people text back instantly while you spiral? Why do you pull away when things get close? Attachment & You explores the science of attachment styles, helps you identify your own patterns, and gives you practical ways to build more secure relationships — romantic, platonic and professional.",
    category: "Relationships",
    level: "Intermediate",
    priceCents: 8900,
    theme: "blush",
    glyph: "❦",
    instructor: noor,
    outcomes: [
      "Identify your attachment tendencies and their triggers",
      "Communicate needs clearly without protest behaviours",
      "Practise earned security with small, repeatable actions",
    ],
    modules: [
      {
        title: "Your Attachment Blueprint",
        lessons: [
          {
            slug: "the-four-styles",
            title: "The Four Styles",
            summary: "Secure, anxious, avoidant and fearful-avoidant — a map, not a label.",
            minutes: 11,
            preview: true,
            takeaways: [
              "Attachment styles are tendencies on two dimensions: anxiety and avoidance.",
              "About half of adults are broadly secure.",
              "Styles can shift over time — 'earned security' is real.",
            ],
            exercise: "Think of your last three close relationships. Where did you sit on anxiety (fear of abandonment) and avoidance (discomfort with closeness)?",
            interactions: [
              { at: 120, type: "scale", prompt: "When someone you care about goes quiet, how anxious do you get?", minLabel: "Unbothered", maxLabel: "Very anxious" },
              { at: 260, type: "scale", prompt: "How comfortable are you depending on others?", minLabel: "Very uncomfortable", maxLabel: "Very comfortable" },
              {
                at: 450,
                type: "quiz",
                prompt: "Which two dimensions underlie adult attachment styles?",
                options: [["Introversion and extraversion"], ["Anxiety and avoidance", true], ["Trust and loyalty"], ["Dominance and submission"]],
                explanation: "Modern research (Brennan, Clark & Shaver) measures attachment on continuous anxiety and avoidance dimensions.",
              },
            ],
          },
          {
            slug: "where-your-blueprint-came-from",
            title: "Where Your Blueprint Came From",
            summary: "Early caregiving, internal working models, and why the past isn't destiny.",
            minutes: 10,
            takeaways: [
              "Internal working models are your brain's expectations about closeness.",
              "They were adaptive responses to your early environment.",
              "Understanding the origin reduces shame and opens change.",
            ],
            exercise: "Write a short, compassionate letter to your younger self explaining why they learned to cope the way they did.",
            interactions: [
              { at: 160, type: "insight", prompt: "Reframe", body: "Every 'insecure' strategy was once intelligent. Anxiety kept a caregiver close; avoidance protected you from disappointment." },
              { at: 340, type: "reflection", prompt: "What did you learn about closeness growing up? What did it protect you from?" },
              { at: 520, type: "poll", prompt: "How does exploring this make you feel?", options: ["Relieved", "Uncomfortable", "Curious", "A bit of everything"] },
            ],
          },
        ],
      },
      {
        title: "Building Earned Security",
        lessons: [
          {
            slug: "protest-behaviours-and-deactivating-strategies",
            title: "Protest Behaviours & Deactivating Strategies",
            summary: "The moves we make when attachment alarms ring — and better alternatives.",
            minutes: 10,
            takeaways: [
              "Protest behaviours (over-texting, jealousy games) seek reconnection clumsily.",
              "Deactivating strategies (withdrawal, fault-finding) create distance.",
              "Name the alarm, then state the need directly.",
            ],
            exercise: "Next time your alarm rings, pause 10 minutes, then send one clear message stating a need.",
            interactions: [
              {
                at: 190,
                type: "quiz",
                prompt: "Suddenly focusing on a partner's flaws when things get serious is an example of…",
                options: [["Protest behaviour"], ["Deactivating strategy", true], ["Secure communication"], ["Reciprocity"]],
                explanation: "Fault-finding is a classic deactivating strategy that creates emotional distance when intimacy feels threatening.",
              },
              { at: 380, type: "reflection", prompt: "Which protest or deactivating move do you recognise in yourself? What need sits under it?", required: true },
            ],
          },
          {
            slug: "the-secure-conversation",
            title: "The Secure Conversation",
            summary: "A four-step script for bringing up hard things without blame.",
            minutes: 9,
            takeaways: [
              "Observation → Feeling → Need → Request (adapted from NVC).",
              "Secure people aren't conflict-free; they repair quickly.",
              "Repair attempts matter more than perfect communication.",
            ],
            exercise: "Draft a secure-conversation script for one thing you've been avoiding saying. Share it within 7 days.",
            interactions: [
              { at: 140, type: "insight", prompt: "The script", body: "'When I noticed ___ (observation), I felt ___ (feeling), because I need ___ (need). Would you be willing to ___ (request)?'" },
              { at: 330, type: "reflection", prompt: "Draft your secure conversation using the four-step script." },
              { at: 470, type: "scale", prompt: "How ready do you feel to have this conversation?", minLabel: "Not at all", maxLabel: "Totally ready" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "deep-focus-mind",
    title: "Deep Focus Mind",
    subtitle: "Reclaim your attention in a world engineered to steal it.",
    description:
      "Attention is the currency of a meaningful life. Deep Focus Mind combines attention science, flow research and practical protocols to help you do your best work in fewer hours — and actually enjoy it. Each lesson includes a live focus experiment you run on yourself.",
    category: "Focus",
    level: "Intermediate",
    priceCents: 6900,
    theme: "sun",
    glyph: "◎",
    instructor: kenji,
    outcomes: [
      "Understand attention residue and the true cost of switching",
      "Design distraction-proof deep-work sessions",
      "Trigger flow states more reliably",
    ],
    modules: [
      {
        title: "The Attention Economy of You",
        lessons: [
          {
            slug: "attention-residue",
            title: "Attention Residue",
            summary: "Why checking email 'for a second' costs you twenty minutes.",
            minutes: 8,
            preview: true,
            takeaways: [
              "Switching tasks leaves residue that lowers performance on the next task.",
              "Finishing or parking a task cleanly reduces residue.",
              "Batching shallow work protects deep work.",
            ],
            exercise: "Before switching tasks today, write one line: 'Where I left off, and what's next.' Notice how easily you return.",
            interactions: [
              { at: 90, type: "scale", prompt: "How many times do you think you check your phone per day?", min: 0, max: 200, minLabel: "0", maxLabel: "200+" },
              {
                at: 260,
                type: "quiz",
                prompt: "What is 'attention residue'?",
                options: [["Fatigue after long focus"], ["Thoughts about a previous task lingering after switching", true], ["Notifications you missed"], ["Visual clutter"]],
                explanation: "Sophie Leroy found people who switched before finishing a task performed worse on the next one — part of their mind stayed behind.",
              },
              { at: 400, type: "reflection", prompt: "What's your most expensive task switch in a typical day?" },
            ],
          },
          {
            slug: "your-distraction-fingerprint",
            title: "Your Distraction Fingerprint",
            summary: "Internal vs external triggers — find the itch behind the scroll.",
            minutes: 9,
            takeaways: [
              "Most distraction starts with an internal trigger: boredom, anxiety, uncertainty.",
              "Surf the urge for 10 minutes before acting on it.",
              "Track triggers, not just time lost.",
            ],
            exercise: "Keep a distraction log for one day: time, what you reached for, and the feeling right before.",
            interactions: [
              { at: 110, type: "poll", prompt: "What usually happens right before you get distracted?", options: ["Boredom", "The task feels hard", "Anxiety", "A notification"] },
              { at: 300, type: "insight", prompt: "The 10-minute rule", body: "When you feel the urge to check, say 'I can — in 10 minutes.' The urge usually peaks and passes like a wave." },
              { at: 450, type: "reflection", prompt: "What feeling are you most often trying to escape when you get distracted?", required: true },
            ],
          },
        ],
      },
      {
        title: "Engineering Flow",
        lessons: [
          {
            slug: "the-flow-channel",
            title: "The Flow Channel",
            summary: "Challenge slightly above skill, clear goals, instant feedback.",
            minutes: 10,
            takeaways: [
              "Flow happens when challenge slightly exceeds skill (~4%).",
              "Clear goals and immediate feedback are prerequisites.",
              "Too easy → boredom; too hard → anxiety. Adjust the dial.",
            ],
            exercise: "Take a boring task and add a constraint (time limit, quality bar). Take an overwhelming task and shrink it. Note which one flowed.",
            interactions: [
              {
                at: 200,
                type: "quiz",
                prompt: "If a task makes you anxious, how should you adjust it to find flow?",
                options: [["Increase the challenge"], ["Reduce the challenge or build skill first", true], ["Add more distractions"], ["Work longer hours"]],
                explanation: "Anxiety signals challenge far above skill. Break it down or build skill to re-enter the channel.",
              },
              { at: 380, type: "scale", prompt: "How often do you experience flow in a typical week?", minLabel: "Never", maxLabel: "Daily" },
              { at: 520, type: "reflection", prompt: "Describe the last time you experienced flow. What conditions were present?" },
            ],
          },
          {
            slug: "the-deep-work-ritual",
            title: "The Deep Work Ritual",
            summary: "Build a start-up ritual that tells your brain: it's time.",
            minutes: 9,
            takeaways: [
              "Rituals reduce the activation energy of starting.",
              "Same place, same cue, same first action.",
              "End with a shutdown ritual to prevent residue bleed.",
            ],
            exercise: "Design your 3-step deep work start ritual and your 2-step shutdown ritual. Use them tomorrow.",
            interactions: [
              { at: 140, type: "poll", prompt: "When do you do your best thinking?", options: ["Early morning", "Late morning", "Afternoon", "Night"] },
              { at: 330, type: "reflection", prompt: "Write your three-step deep work start ritual." },
              { at: 470, type: "insight", prompt: "Shutdown phrase", body: "Cal Newport ends each day by saying 'Shutdown complete.' It sounds silly. It works — it gives your mind permission to let go." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "shadow-work",
    title: "Shadow Work & Self-Sabotage",
    subtitle: "Meet the parts of you that hold you back — and turn them into allies.",
    description:
      "Procrastination, perfectionism, impostor feelings: they're not flaws, they're protectors with outdated instructions. Blending Jungian shadow work with modern research on self-sabotage and the inner critic, this course helps you understand why you get in your own way — and how to stop.",
    category: "Self-Knowledge",
    level: "Advanced",
    priceCents: 8900,
    theme: "iris",
    glyph: "☾",
    instructor: amara,
    outcomes: [
      "Recognise projection and use your triggers as mirrors",
      "Understand the protective purpose behind self-sabotage",
      "Transform your inner critic into an inner coach",
    ],
    modules: [
      {
        title: "Meeting the Shadow",
        lessons: [
          {
            slug: "what-you-refuse-to-see",
            title: "What You Refuse to See",
            summary: "Projection: the traits that irritate you most in others often live in you.",
            minutes: 10,
            preview: true,
            takeaways: [
              "The shadow holds traits we disowned to stay accepted.",
              "Strong, disproportionate reactions are clues to shadow material.",
              "Owning a trait gives you choice over it.",
            ],
            exercise: "List three traits that irritate you in others. For each, find one situation where you've shown a version of it.",
            interactions: [
              { at: 130, type: "reflection", prompt: "Name a trait in others that irritates you more than it should." },
              {
                at: 320,
                type: "quiz",
                prompt: "In psychology, projection means…",
                options: [["Planning your future"], ["Attributing your own disowned traits to others", true], ["Visualising success"], ["Copying other people's behaviour"]],
                explanation: "Projection is a defence mechanism: unacceptable parts of ourselves are seen in others instead.",
              },
              { at: 480, type: "scale", prompt: "How uncomfortable was that last reflection?", minLabel: "Easy", maxLabel: "Very uncomfortable" },
            ],
          },
          {
            slug: "the-golden-shadow",
            title: "The Golden Shadow",
            summary: "The admiration you feel for others points at gifts you haven't claimed.",
            minutes: 8,
            takeaways: [
              "We disown positive traits too — boldness, creativity, ambition.",
              "Intense admiration is a clue to your golden shadow.",
              "Claiming it starts with small, visible experiments.",
            ],
            exercise: "Pick someone you deeply admire. Name the exact trait. Do one small thing this week that expresses it.",
            interactions: [
              { at: 150, type: "reflection", prompt: "Who do you admire intensely, and for what exact quality?", required: true },
              { at: 330, type: "poll", prompt: "Which 'golden' trait feels hardest to claim?", options: ["Confidence", "Creativity", "Ambition", "Playfulness"] },
            ],
          },
        ],
      },
      {
        title: "Sabotage Decoded",
        lessons: [
          {
            slug: "why-you-procrastinate",
            title: "Why You Procrastinate",
            summary: "Procrastination is an emotion-regulation problem, not a time-management one.",
            minutes: 9,
            takeaways: [
              "We delay to escape negative feelings about a task.",
              "Self-forgiveness for past procrastination reduces future procrastination.",
              "Start with the 'next visible action' to shrink the feeling.",
            ],
            exercise: "Pick a task you've avoided. Name the feeling it triggers. Do only the next visible action for five minutes.",
            interactions: [
              {
                at: 160,
                type: "quiz",
                prompt: "According to Tim Pychyl and Fuschia Sirois, procrastination is primarily a problem of…",
                options: [["Time management"], ["Laziness"], ["Emotion regulation", true], ["Intelligence"]],
                explanation: "Procrastination is short-term mood repair: we avoid the task to avoid the feelings it triggers.",
              },
              { at: 340, type: "reflection", prompt: "What task are you avoiding, and what feeling does it bring up?" },
              { at: 460, type: "insight", prompt: "Forgive yourself", body: "Students who forgave themselves for procrastinating on the first exam procrastinated less on the next (Wohl et al., 2010)." },
            ],
          },
          {
            slug: "from-inner-critic-to-inner-coach",
            title: "From Inner Critic to Inner Coach",
            summary: "Give the critic a name, a job description and a new script.",
            minutes: 10,
            takeaways: [
              "The inner critic is usually trying to protect you from rejection or failure.",
              "Distanced self-talk (using your name) improves performance under stress.",
              "Coaches are specific and forward-looking; critics are global and backward-looking.",
            ],
            exercise: "Write your critic's favourite line. Now write what a great coach would say instead — using your own name.",
            interactions: [
              { at: 120, type: "poll", prompt: "What does your inner critic sound like?", options: ["A parent", "A teacher", "Myself, but meaner", "Society in general"] },
              {
                at: 300,
                type: "quiz",
                prompt: "Ethan Kross found that talking to yourself using your own name (distanced self-talk)…",
                options: [["Increased anxiety"], ["Improved performance and reduced anxiety", true], ["Had no effect"], ["Made people narcissistic"]],
                explanation: "Third-person self-talk creates psychological distance, helping people regulate emotions and perform better.",
              },
              { at: 480, type: "reflection", prompt: "Rewrite your critic's favourite line as your inner coach, using your name.", required: true },
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
