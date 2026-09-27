-- Row-level security & business-rule assertions against the real local Supabase database
-- (after `supabase db reset` / `npm run stack:up`). Everything runs in one transaction that is
-- rolled back, so the database is left untouched.
\set ON_ERROR_STOP on
begin;

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'ada@example.com', '{"full_name":"Ada Learner"}'),
  ('22222222-2222-4222-8222-222222222222', 'bo@example.com', '{}'),
  ('33333333-3333-4333-8333-333333333333', 'admin@example.com', '{}');

do $$ begin
  assert (select count(*) from public.profiles where id in ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333')) = 3, 'profiles auto-created';
  assert (select full_name from public.profiles where email = 'ada@example.com') = 'Ada Learner', 'full_name copied';
end $$;

update public.profiles set role = 'admin' where email = 'admin@example.com';

-- Act as Ada
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);

do $$
declare free_course uuid; paid_course uuid; lesson uuid; ok boolean;
begin
  select id into free_course from public.courses where price_cents = 0 limit 1;
  select id into paid_course from public.courses where price_cents > 0 limit 1;
  assert (select count(*) from public.courses) = 7, 'reads published courses';
  assert (select count(*) from public.profiles) = 1, 'sees only own profile';

  -- role escalation is silently blocked
  update public.profiles set role = 'admin', full_name = 'Ada L.' where id = auth.uid();
  assert (select role from public.profiles where id = auth.uid()) = 'student', 'cannot self-promote';
  assert (select full_name from public.profiles where id = auth.uid()) = 'Ada L.', 'can edit own name';

  -- can enrol in free course, not in paid course
  insert into public.enrollments (user_id, course_id, source) values (auth.uid(), free_course, 'free');
  ok := true;
  begin
    insert into public.enrollments (user_id, course_id, source) values (auth.uid(), paid_course, 'purchase');
    ok := false;
  exception when insufficient_privilege then null;
  end;
  assert ok, 'paid enrolment without purchase is rejected';

  -- cannot award self XP
  ok := true;
  begin
    insert into public.xp_events (user_id, amount, reason, ref_id) values (auth.uid(), 99999, 'cheat', 'x');
    ok := false;
  exception when insufficient_privilege then null;
  end;
  assert ok, 'xp insert rejected';

  select id into lesson from public.lessons where course_id = free_course limit 1;
  insert into public.lesson_progress (user_id, lesson_id, course_id, last_position, watched_seconds) values (auth.uid(), lesson, free_course, 30, 30);
  insert into public.notes (user_id, lesson_id, course_id, at_seconds, body) values (auth.uid(), lesson, free_course, 12, 'hello');
end $$;

-- Act as Bo: must not see Ada's data
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
do $$ begin
  assert (select count(*) from public.lesson_progress) = 0, 'progress isolated';
  assert (select count(*) from public.notes) = 0, 'notes isolated';
  assert (select count(*) from public.enrollments) = 0, 'enrollments isolated';
  update public.notes set body = 'hacked';
  delete from public.notes;
end $$;

-- Admin sees everything and has access to paid courses
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', false);
do $$ begin
  assert (select count(*) from public.profiles) >= 3, 'admin reads all profiles';
  assert public.has_course_access(auth.uid(), (select id from public.courses where price_cents > 0 limit 1)), 'admin has access';
end $$;

-- Anonymous visitors see catalog only
reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$ begin
  assert (select count(*) from public.courses) = 7, 'anon reads catalog';
  assert (select count(*) from public.profiles) = 0, 'anon sees no profiles';
end $$;
reset role;

do $$ begin
  assert (select body from public.notes where user_id = '11111111-1111-4111-8111-111111111111') = 'hello', 'Bo could not modify Ada''s note';
  -- subscriptions grant access
  insert into public.subscriptions (id, user_id, status, current_period_end)
    values ('sub_123', '22222222-2222-4222-8222-222222222222', 'active', now() + interval '1 month');
  assert public.has_course_access('22222222-2222-4222-8222-222222222222', (select id from public.courses where price_cents > 0 limit 1)), 'subscriber has access';
  update public.subscriptions set status = 'canceled' where id = 'sub_123';
  assert not public.has_course_access('22222222-2222-4222-8222-222222222222', (select id from public.courses where price_cents > 0 limit 1)), 'canceled sub loses access';
  -- email sync
  update auth.users set email = 'ada2@example.com' where id = '11111111-1111-4111-8111-111111111111';
  assert (select email from public.profiles where id = '11111111-1111-4111-8111-111111111111') = 'ada2@example.com', 'email synced';
end $$;

select 'ALL RLS ASSERTIONS PASSED' as result;
rollback;
