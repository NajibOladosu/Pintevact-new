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
  /** Adds (or re-activates) a subscriber. `isNew` is false when they were already subscribed. */
  subscribeNewsletter(email: string): Promise<{ token: string; isNew: boolean }>;

  // Admin
  adminStats(): Promise<AdminStats>;
}
