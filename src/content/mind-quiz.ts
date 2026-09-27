export type Archetype = "seeker" | "feeler" | "strategist" | "connector";

export type QuizQuestion = { id: string; prompt: string; answers: { label: string; archetype: Archetype }[] };

export const archetypes: Record<Archetype, { name: string; tagline: string; description: string; strengths: string[]; blindSpot: string; courseSlug: string; theme: "ember" | "iris" | "lucid" | "tide" | "blush" | "sun" }> = {
  seeker: {
    name: "The Seeker",
    tagline: "You want to know why — about everything, especially yourself.",
    description: "Curious and reflective, you process life by understanding it. You're drawn to patterns, meaning and the hidden machinery behind behaviour.",
    strengths: ["Deep self-reflection", "Pattern recognition", "Open to change"],
    blindSpot: "Analysis can become a hiding place. Insight without action turns into rumination.",
    courseSlug: "shadow-work",
    theme: "iris",
  },
  feeler: {
    name: "The Feeler",
    tagline: "You experience the world in high definition.",
    description: "Emotionally perceptive and empathic, you pick up on subtle shifts in mood — yours and everyone else's. Feelings are your first language.",
    strengths: ["Empathy", "Emotional awareness", "Authenticity"],
    blindSpot: "Big feelings can steer the ship before you've checked the map.",
    courseSlug: "emotional-alchemy",
    theme: "ember",
  },
  strategist: {
    name: "The Strategist",
    tagline: "You want results — and a system to get them.",
    description: "Driven and practical, you love turning insight into leverage. You'd rather run an experiment than read another think-piece.",
    strengths: ["Follow-through", "Systems thinking", "Bias to action"],
    blindSpot: "Optimising everything can crowd out rest, play and the people around you.",
    courseSlug: "habit-architecture",
    theme: "tide",
  },
  connector: {
    name: "The Connector",
    tagline: "For you, it's always about people.",
    description: "Warm and socially attuned, you're energised by relationships and influence. You understand others intuitively and want to be understood in return.",
    strengths: ["Social intelligence", "Persuasion", "Loyalty"],
    blindSpot: "Other people's needs can quietly drown out your own.",
    courseSlug: "attachment-and-you",
    theme: "blush",
  },
};

export const quiz: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "It's a free Saturday. You're most likely to…",
    answers: [
      { label: "Fall down a documentary rabbit hole", archetype: "seeker" },
      { label: "Do whatever matches my mood", archetype: "feeler" },
      { label: "Finally tackle my project list", archetype: "strategist" },
      { label: "Make plans with friends", archetype: "connector" },
    ],
  },
  {
    id: "q2",
    prompt: "When something goes wrong, your first instinct is to…",
    answers: [
      { label: "Figure out why it happened", archetype: "seeker" },
      { label: "Feel it fully before doing anything", archetype: "feeler" },
      { label: "Fix it. Now.", archetype: "strategist" },
      { label: "Talk it through with someone", archetype: "connector" },
    ],
  },
  {
    id: "q3",
    prompt: "Which compliment would mean the most?",
    answers: [
      { label: "“You see things others miss.”", archetype: "seeker" },
      { label: "“You make me feel understood.”", archetype: "feeler" },
      { label: "“You always get it done.”", archetype: "strategist" },
      { label: "“Everyone's better when you're around.”", archetype: "connector" },
    ],
  },
  {
    id: "q4",
    prompt: "Your inner critic mostly says…",
    answers: [
      { label: "“You still don't really understand yourself.”", archetype: "seeker" },
      { label: "“You're too much.”", archetype: "feeler" },
      { label: "“You're falling behind.”", archetype: "strategist" },
      { label: "“They're going to leave.”", archetype: "connector" },
    ],
  },
  {
    id: "q5",
    prompt: "Pick a superpower:",
    answers: [
      { label: "Reading the hidden meaning in anything", archetype: "seeker" },
      { label: "Instantly calming any emotion", archetype: "feeler" },
      { label: "Never procrastinating again", archetype: "strategist" },
      { label: "Persuading anyone of anything (ethically)", archetype: "connector" },
    ],
  },
  {
    id: "q6",
    prompt: "What would you most like to change?",
    answers: [
      { label: "The patterns I keep repeating", archetype: "seeker" },
      { label: "How overwhelmed I get", archetype: "feeler" },
      { label: "My focus and consistency", archetype: "strategist" },
      { label: "How I show up in relationships", archetype: "connector" },
    ],
  },
];

/** Tally answers; ties break in a fixed, documented order. */
export function scoreQuiz(picks: Archetype[]): { winner: Archetype; scores: Record<Archetype, number> } {
  const scores: Record<Archetype, number> = { seeker: 0, feeler: 0, strategist: 0, connector: 0 };
  for (const p of picks) scores[p]++;
  const order: Archetype[] = ["seeker", "feeler", "strategist", "connector"];
  const winner = order.reduce((best, a) => (scores[a] > scores[best] ? a : best), order[0]);
  return { winner, scores };
}
