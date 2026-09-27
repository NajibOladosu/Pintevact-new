export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingMinutes: number;
  publishedAt: string;
  author: string;
  theme: "ember" | "iris" | "lucid" | "tide";
  body: { type: "p" | "h2" | "quote" | "tip"; text: string }[];
};

export const journal: JournalPost[] = [
  {
    slug: "why-you-cant-think-your-way-out-of-a-feeling",
    title: "Why you can't think your way out of a feeling",
    excerpt: "Logic arrives late to the emotional party. Here's what to do in the meantime.",
    category: "Emotions",
    readingMinutes: 5,
    publishedAt: "2026-09-18",
    author: "Dr. Amara Okafor",
    theme: "ember",
    body: [
      { type: "p", text: "You know the moment. A message lands, your chest tightens, and a perfectly reasonable voice in your head says: this isn't a big deal. The tightness doesn't care." },
      { type: "p", text: "That's because emotions and reasoning run on different timelines. The amygdala can flag a threat in around a fifth of a second; your deliberate, verbal reasoning takes far longer to spin up. By the time logic shows up, the body has already voted." },
      { type: "h2", text: "Name it before you argue with it" },
      { type: "p", text: "Studies on affect labelling show that simply putting a feeling into words, 'I feel embarrassed and a bit rejected', reduces activity in the brain's alarm system. You're not solving the feeling. You're giving your prefrontal cortex a handle to hold." },
      { type: "quote", text: "The goal isn't to feel less. It's to feel precisely." },
      { type: "h2", text: "Then move the body" },
      { type: "p", text: "A physiological sigh, two inhales through the nose, one long exhale through the mouth, is one of the fastest known ways to downshift your nervous system in real time. Physiology is the side door into psychology." },
      { type: "tip", text: "Try it now: two sharp inhales, one slow exhale. Three times. Notice what changes." },
    ],
  },
  {
    slug: "the-spotlight-effect-nobody-is-watching",
    title: "The spotlight effect: nobody is watching (and that's great news)",
    excerpt: "You think everyone noticed. Research says they barely registered it.",
    category: "Self-Knowledge",
    readingMinutes: 4,
    publishedAt: "2026-09-04",
    author: "Theo Lindqvist",
    theme: "lucid",
    body: [
      { type: "p", text: "In a classic Cornell study, students were asked to wear an embarrassing T-shirt into a room of peers. They estimated about half the room would notice. The real number? Roughly a quarter." },
      { type: "p", text: "We are the main characters of our own experience, so we assume we're central in everyone else's too. We're not, everyone is busy starring in their own film." },
      { type: "h2", text: "What this frees you to do" },
      { type: "p", text: "Ask the 'dumb' question. Try the new thing badly. Speak up in the meeting. The social cost you're bracing for is, on average, about half as large as you think." },
      { type: "tip", text: "For 24 hours, tally every time you think 'everyone will notice'. Then ask: who actually did?" },
    ],
  },
  {
    slug: "habits-arent-built-with-willpower",
    title: "Habits aren't built with willpower. They're built with architecture.",
    excerpt: "The most disciplined people rely on discipline the least.",
    category: "Habits",
    readingMinutes: 6,
    publishedAt: "2026-08-21",
    author: "Theo Lindqvist",
    theme: "tide",
    body: [
      { type: "p", text: "Research on self-control has an awkward finding: people who score highest on self-control report resisting temptation less often than everyone else. They're not white-knuckling it. They've arranged their lives so temptation rarely shows up." },
      { type: "h2", text: "Move the friction" },
      { type: "p", text: "Twenty seconds of extra effort is often enough to kill a behaviour, and twenty seconds less is often enough to start one. Put the guitar on a stand, not in its case. Put the phone charger in the kitchen, not by your bed." },
      { type: "quote", text: "Don't fight your environment. Redesign it." },
      { type: "h2", text: "Vote for your identity" },
      { type: "p", text: "Every small action is a vote for the kind of person you're becoming. 'I'm a runner' outlasts 'I'm trying to run' because it turns each run into evidence rather than effort." },
    ],
  },
  {
    slug: "your-attachment-style-is-not-a-life-sentence",
    title: "Your attachment style is not a life sentence",
    excerpt: "Earned security is real, and it's built in small, repeatable moments.",
    category: "Relationships",
    readingMinutes: 5,
    publishedAt: "2026-08-07",
    author: "Noor Haddad, MA",
    theme: "iris",
    body: [
      { type: "p", text: "Attachment styles went viral, and with virality came labels: 'I'm anxious', 'he's avoidant'. But the research treats attachment as two sliding dimensions, anxiety and avoidance, not four fixed boxes." },
      { type: "p", text: "Longitudinal studies show attachment patterns can and do shift, especially through consistent, responsive relationships and deliberate self-reflection. Psychologists call it earned security." },
      { type: "h2", text: "Start with the alarm" },
      { type: "p", text: "When your attachment system fires, a late reply, a cool tone, notice the urge (to chase, or to withdraw). Pause. Then state the underlying need directly, once, kindly." },
      { type: "tip", text: "Script: 'When I noticed ___, I felt ___, because I need ___. Would you be willing to ___?'" },
    ],
  },
];

export function findPost(slug: string) {
  return journal.find((p) => p.slug === slug) ?? null;
}
