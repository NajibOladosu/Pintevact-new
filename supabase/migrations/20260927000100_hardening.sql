-- ════════════════════════════════════════════════════════════════════
--  Hardening from the Supabase security & performance advisors.
--  No behaviour change: same access rules, cheaper and tighter.
-- ════════════════════════════════════════════════════════════════════

-- ─── Functions ───────────────────────────────────────────────────────
alter function public.set_updated_at() set search_path = public;
alter function public.protect_profile_columns() set search_path = public;

-- Trigger functions are not API endpoints.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_change() from public, anon, authenticated;

-- Only signed-in learners need these. is_admin() stays callable by anon because
-- catalog policies evaluate it for visitors; certificate_lookup() backs public
-- verification pages.
revoke execute on function public.poll_results(uuid) from public, anon;
revoke execute on function public.has_course_access(uuid, uuid) from public, anon;
grant execute on function public.poll_results(uuid) to authenticated;
grant execute on function public.has_course_access(uuid, uuid) to authenticated;

-- ─── Policies: evaluate auth.uid()/is_admin() once per query ─────────
drop policy "profiles: read own" on public.profiles;
drop policy "profiles: update own" on public.profiles;
create policy "profiles: read own" on public.profiles for select
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: update own" on public.profiles for update
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- Catalog: one SELECT policy per table; admin writes split by command.
drop policy "courses: read published" on public.courses;
drop policy "courses: admin write" on public.courses;
create policy "courses: read published" on public.courses for select
  using (published or (select public.is_admin()));
create policy "courses: admin insert" on public.courses for insert with check ((select public.is_admin()));
create policy "courses: admin update" on public.courses for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "courses: admin delete" on public.courses for delete using ((select public.is_admin()));

drop policy "modules: read published" on public.modules;
drop policy "modules: admin write" on public.modules;
create policy "modules: read published" on public.modules for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.published or (select public.is_admin()))));
create policy "modules: admin insert" on public.modules for insert with check ((select public.is_admin()));
create policy "modules: admin update" on public.modules for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "modules: admin delete" on public.modules for delete using ((select public.is_admin()));

drop policy "lessons: read published" on public.lessons;
drop policy "lessons: admin write" on public.lessons;
create policy "lessons: read published" on public.lessons for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.published or (select public.is_admin()))));
create policy "lessons: admin insert" on public.lessons for insert with check ((select public.is_admin()));
create policy "lessons: admin update" on public.lessons for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "lessons: admin delete" on public.lessons for delete using ((select public.is_admin()));

drop policy "interactions: read published" on public.lesson_interactions;
drop policy "interactions: admin write" on public.lesson_interactions;
create policy "interactions: read published" on public.lesson_interactions for select
  using (exists (
    select 1 from public.lessons l join public.courses c on c.id = l.course_id
    where l.id = lesson_id and (c.published or (select public.is_admin()))
  ));
create policy "interactions: admin insert" on public.lesson_interactions for insert with check ((select public.is_admin()));
create policy "interactions: admin update" on public.lesson_interactions for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "interactions: admin delete" on public.lesson_interactions for delete using ((select public.is_admin()));

drop policy "purchases: read own" on public.purchases;
create policy "purchases: read own" on public.purchases for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));
drop policy "subscriptions: read own" on public.subscriptions;
create policy "subscriptions: read own" on public.subscriptions for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy "enrollments: read own" on public.enrollments;
drop policy "enrollments: self-enrol with access" on public.enrollments;
create policy "enrollments: read own" on public.enrollments for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "enrollments: self-enrol with access" on public.enrollments for insert
  with check (user_id = (select auth.uid()) and source <> 'admin' and public.has_course_access((select auth.uid()), course_id));

drop policy "progress: own" on public.lesson_progress;
create policy "progress: own" on public.lesson_progress for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy "responses: own" on public.interaction_responses;
create policy "responses: own" on public.interaction_responses for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy "notes: own" on public.notes;
create policy "notes: own" on public.notes for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "xp: read own" on public.xp_events;
create policy "xp: read own" on public.xp_events for select using (user_id = (select auth.uid()));
drop policy "certificates: read own" on public.certificates;
create policy "certificates: read own" on public.certificates for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy "contact: admin read" on public.contact_messages;
create policy "contact: admin read" on public.contact_messages for select using ((select public.is_admin()));
drop policy "newsletter: admin read" on public.newsletter_subscribers;
create policy "newsletter: admin read" on public.newsletter_subscribers for select using ((select public.is_admin()));

-- Webhook idempotency log: service role only, stated explicitly.
create policy "stripe events: no client access" on public.stripe_events for select using (false);

-- ─── Foreign-key indexes ─────────────────────────────────────────────
create index if not exists certificates_course_idx on public.certificates (course_id);
create index if not exists enrollments_course_idx on public.enrollments (course_id);
create index if not exists interaction_responses_course_idx on public.interaction_responses (course_id);
create index if not exists interaction_responses_lesson_idx on public.interaction_responses (lesson_id);
create index if not exists lesson_progress_lesson_idx on public.lesson_progress (lesson_id);
create index if not exists lesson_progress_course_fk_idx on public.lesson_progress (course_id);
create index if not exists lessons_module_idx on public.lessons (module_id);
create index if not exists notes_course_idx on public.notes (course_id);
create index if not exists notes_lesson_idx on public.notes (lesson_id);
create index if not exists purchases_course_idx on public.purchases (course_id);
