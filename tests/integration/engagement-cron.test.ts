import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/cron/engagement/route";
import { catalog } from "@/content/catalog";
import { flattenLessons } from "@/lib/course";
import { admin, createUser } from "../support/supabase";
import { local } from "../support/local-services";
import { waitForEmail } from "../support/mailpit";

describe("GET /api/cron/engagement", () => {
  it("requires the cron secret", async () => {
    expect((await GET(new Request("http://localhost/api/cron/engagement"))).status).toBe(401);
    expect((await GET(new Request("http://localhost/api/cron/engagement", { headers: { authorization: "Bearer nope" } }))).status).toBe(401);
  });

  it("reminds learners whose streak is about to break", async () => {
    const user = await createUser({ name: "Streaker" });
    const course = catalog[0];
    const [first, second] = flattenLessons(course);
    const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
    await admin().from("xp_events").insert([
      { user_id: user.id, amount: 10, reason: "interaction", ref_id: "a", created_at: day(1) },
      { user_id: user.id, amount: 10, reason: "interaction", ref_id: "b", created_at: day(2) },
    ]);
    await admin().from("lesson_progress").insert({ user_id: user.id, lesson_id: first.id, course_id: course.id, last_position: first.durationSeconds, watched_seconds: first.durationSeconds, completed_at: day(1), updated_at: day(1) });

    const res = await GET(new Request("http://localhost/api/cron/engagement", { headers: { authorization: `Bearer ${local.cronSecret}` } }));
    expect(res.status).toBe(200);
    const mail = await waitForEmail(user.email, /streak ends tonight/);
    expect(mail.HTML).toContain(second.title.replace(/'/g, "&#x27;").replace(/&(?!#)/g, "&amp;"));
  });
});
