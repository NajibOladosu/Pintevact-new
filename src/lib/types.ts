export type InteractionType = "quiz" | "reflection" | "poll" | "insight" | "scale";

export type InteractionOption = {
  id: string;
  label: string;
  correct?: boolean;
  feedback?: string;
};

export type Interaction = {
  id: string;
  lessonId: string;
  atSeconds: number;
  type: InteractionType;
  prompt: string;
  options?: InteractionOption[];
  explanation?: string;
  body?: string;
  scale?: { min: number; max: number; minLabel: string; maxLabel: string };
  xp: number;
  required: boolean;
};

export type Chapter = { atSeconds: number; title: string };

export type Lesson = {
  id: string;
  courseId: string;
  moduleId: string;
  slug: string;
  title: string;
  summary: string;
  durationSeconds: number;
  bunnyVideoId: string | null;
  isPreview: boolean;
  position: number;
  chapters: Chapter[];
  takeaways: string[];
  exercise: string | null;
  interactions: Interaction[];
};

export type Module = {
  id: string;
  courseId: string;
  title: string;
  position: number;
  lessons: Lesson[];
};

export type CourseTheme = "ember" | "iris" | "lucid" | "tide" | "sun" | "blush";

export type Instructor = { name: string; title: string; bio: string };

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  priceCents: number;
  currency: string;
  stripePriceId: string | null;
  theme: CourseTheme;
  glyph: string;
  instructor: Instructor;
  outcomes: string[];
  published: boolean;
  featured: boolean;
  position: number;
  modules: Module[];
};

export type CourseSummary = Omit<Course, "modules"> & {
  lessonCount: number;
  durationSeconds: number;
  interactionCount: number;
};

export type Role = "student" | "admin";

export type Profile = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  headline: string | null;
  role: Role;
  emailOptIn: boolean;
  stripeCustomerId: string | null;
  createdAt: string;
};

export type LessonProgress = {
  lessonId: string;
  courseId: string;
  lastPosition: number;
  watchedSeconds: number;
  completedAt: string | null;
  updatedAt: string;
};

export type InteractionResponse = {
  interactionId: string;
  lessonId: string;
  courseId: string;
  response: { optionId?: string; text?: string; value?: number; acknowledged?: boolean };
  isCorrect: boolean | null;
  createdAt: string;
};

export type Note = {
  id: string;
  lessonId: string;
  courseId: string;
  atSeconds: number;
  body: string;
  createdAt: string;
};

export type XpEvent = { amount: number; reason: string; refId: string; createdAt: string };

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "unpaid" | "paused";

export type Subscription = {
  id: string;
  status: SubscriptionStatus;
  priceId: string | null;
  interval: "month" | "year" | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type Purchase = {
  id: string;
  courseId: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
};

export type Enrollment = {
  courseId: string;
  source: "free" | "purchase" | "subscription" | "admin";
  createdAt: string;
  completedAt: string | null;
};

export type Certificate = { id: string; courseId: string; userId: string; issuedAt: string };

export type Reflection = {
  interactionId: string;
  prompt: string;
  text: string;
  lessonTitle: string;
  lessonSlug: string;
  courseTitle: string;
  courseSlug: string;
  createdAt: string;
};
