import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { catalog } from "@/content/catalog";
import { flattenLessons } from "@/lib/course";
import { digestInsight, planEngagementEmails, type EngagementUser } from "@/lib/engagement";
import { notify } from "@/lib/notifications";

export const maxDuration = 300;

/**
 * Daily engagement job (streak reminders + Sunday digests).
 * Schedule it (e.g. Vercel Cron, see vercel.json) with header `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: Request) {
  const secret = env.cronSecret();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });

  const db = createAdminClient();
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const [{ data: profiles }, { data: xp }, { data: progress }, { data: reflections }] = await Promise.all([
    db.from("profiles").select("id, email, full_name").eq("email_opt_in", true),
    db.from("xp_events").select("user_id, amount, reason, created_at").gte("created_at", since),
    db.from("lesson_progress").select("user_id, lesson_id, course_id, completed_at, updated_at").order("updated_at", { ascending: false }),
    db.from("interaction_responses").select("user_id, response").gte("created_at", weekAgo),
  ]);

  const lessons = catalog.flatMap((c) => flattenLessons(c).map((l) => ({ c, l })));
  const users: EngagementUser[] = (profiles ?? []).map((p) => {
    const mine = (progress ?? []).filter((r) => r.user_id === p.id);
    const done = new Set(mine.filter((r) => r.completed_at).map((r) => r.lesson_id));
    const recentCourse = mine[0]?.course_id;
    const next = lessons.find(({ c, l }) => c.id === recentCourse && !done.has(l.id));
    return {
      id: p.id,
      email: p.email,
      name: p.full_name,
      xpEvents: (xp ?? []).filter((e) => e.user_id === p.id).map((e) => ({ amount: e.amount, reason: e.reason, createdAt: e.created_at })),
      reflectionsThisWeek: (reflections ?? []).filter((r) => r.user_id === p.id && (r.response as { text?: string })?.text).length,
      nextLesson: next ? { title: next.l.title, url: `/learn/${next.c.slug}/${next.l.slug}` } : null,
    };
  });

  const plan = planEngagementEmails(users);
  let sent = 0;
  for (const email of plan) {
    const to = { email: email.to.email, name: email.to.name };
    const res =
      email.kind === "streak"
        ? await notify.streakReminder(to, { streak: email.streak, nextLessonTitle: email.nextLesson.title, nextLessonUrl: email.nextLesson.url })
        : await notify.weeklyDigest(to, { xp: email.xp, lessons: email.lessons, reflections: email.reflections, levelName: email.levelName, insight: digestInsight(email.xp) });
    if (res.ok) sent++;
  }
  return Response.json({ planned: plan.length, sent });
}
