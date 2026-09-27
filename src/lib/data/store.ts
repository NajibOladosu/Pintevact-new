import type {
  Certificate,
  Course,
  Enrollment,
  InteractionResponse,
  LessonProgress,
  Note,
  Profile,
  Purchase,
  Subscription,
  XpEvent,
} from "@/lib/types";

export type Viewer = { id: string; email: string; profile: Profile };

export type AccessInfo = {
  isAdmin: boolean;
  subscription: Subscription | null;
  purchasedCourseIds: string[];
  grantedCourseIds: string[];
};

export type ProfilePatch = Partial<Pick<Profile, "fullName" | "headline" | "emailOptIn" | "avatarUrl">>;

export type CoursePatch = Partial<
  Pick<Course, "title" | "subtitle" | "description" | "category" | "level" | "priceCents" | "stripePriceId" | "published" | "featured" | "theme">
>;

export type LessonPatch = Partial<{ title: string; summary: string; durationSeconds: number; bunnyVideoId: string | null; isPreview: boolean }>;

export type AdminUserRow = {
  id: string;
  email: string;
  fullName: string | null;
  role: Profile["role"];
  createdAt: string;
  enrollments: number;
  xp: number;
};

export type AdminStats = {
  users: number;
  activeSubscriptions: number;
  revenueCents: number;
  enrollments: number;
  lessonsCompleted: number;
  reflections: number;
};

export type CertificateView = { certificate: Certificate; courseTitle: string; courseSlug: string; learnerName: string };

/** Everything the app needs from persistence, implemented on Supabase. */
export interface Store {

  // Catalog
  listCourses(opts?: { includeUnpublished?: boolean }): Promise<Course[]>;
  getCourse(slug: string, opts?: { includeUnpublished?: boolean }): Promise<Course | null>;

  // Identity
  getViewer(): Promise<Viewer | null>;
  updateProfile(userId: string, patch: ProfilePatch): Promise<void>;

  // Access & enrolment
  getAccess(userId: string): Promise<AccessInfo>;
  listEnrollments(userId: string): Promise<Enrollment[]>;
  enroll(userId: string, courseId: string, source: Enrollment["source"]): Promise<void>;
  markEnrollmentComplete(userId: string, courseId: string): Promise<void>;
  listPurchases(userId: string): Promise<Purchase[]>;

  // Learning
  listProgress(userId: string, courseId?: string): Promise<LessonProgress[]>;
  upsertProgress(
    userId: string,
    p: { lessonId: string; courseId: string; lastPosition: number; watchedSeconds: number; completed?: boolean },
  ): Promise<LessonProgress>;
  listResponses(userId: string, filter?: { lessonId?: string; courseId?: string; type?: "reflection" }): Promise<InteractionResponse[]>;
  saveResponse(userId: string, r: Omit<InteractionResponse, "createdAt">): Promise<{ created: boolean }>;
  pollResults(interactionId: string): Promise<Record<string, number>>;
  listNotes(userId: string, filter?: { lessonId?: string }): Promise<Note[]>;
  addNote(userId: string, n: Omit<Note, "id" | "createdAt">): Promise<Note>;
  deleteNote(userId: string, noteId: string): Promise<void>;

  // Gamification
  awardXp(userId: string, amount: number, reason: string, refId: string): Promise<boolean>;
  listXpEvents(userId: string): Promise<XpEvent[]>;
  issueCertificate(userId: string, courseId: string): Promise<{ certificate: Certificate; created: boolean }>;
  listCertificates(userId: string): Promise<Certificate[]>;
  getCertificate(id: string): Promise<CertificateView | null>;

  // Marketing
  saveContactMessage(m: { name: string; email: string; topic: string; message: string }): Promise<void>;
  subscribeNewsletter(email: string): Promise<void>;

  // Admin
  adminStats(): Promise<AdminStats>;
  adminListUsers(): Promise<AdminUserRow[]>;
  adminUpdateCourse(courseId: string, patch: CoursePatch): Promise<void>;
  adminUpdateLesson(lessonId: string, patch: LessonPatch): Promise<void>;
  adminSetRole(userId: string, role: Profile["role"]): Promise<void>;
}
