-- ════════════════════════════════════════════════════════════════════
--  Admin studio: course covers, an audit log, and atomic helpers for
--  duplicating and reordering course content.
-- ════════════════════════════════════════════════════════════════════

-- ─── The catalogue is down to two courses ────────────────────────────
-- Courses nobody bought are removed; any with purchases are kept (receipts
-- reference them) but hidden. Fresh databases never had them, so this is a no-op there.
delete from public.courses c
where c.slug in ('the-persuasion-lab', 'habit-architecture', 'attachment-and-you', 'deep-focus-mind', 'shadow-work')
  and not exists (select 1 from public.purchases p where p.course_id = c.id);
update public.courses set published = false, featured = false
where slug in ('the-persuasion-lab', 'habit-architecture', 'attachment-and-you', 'deep-focus-mind', 'shadow-work');

-- ─── Course cover images ─────────────────────────────────────────────
alter table public.courses add column cover_image_url text;

-- Public bucket for cover images; only the service role writes to it (admin server actions).
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('course-covers', 'course-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
    on conflict (id) do nothing;
  end if;
end $$;

-- ─── Audit log ───────────────────────────────────────────────────────
create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  summary text not null default '',
  created_at timestamptz not null default now()
);
create index admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
create index admin_audit_log_actor_idx on public.admin_audit_log (actor_id);
alter table public.admin_audit_log enable row level security;
create policy "audit: admin read" on public.admin_audit_log for select using ((select public.is_admin()));

-- ─── Duplicate a course with its modules, lessons and checkpoints ────
create function public.admin_duplicate_course(p_course_id uuid, p_slug text, p_title text)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  new_course uuid := gen_random_uuid();
  m record;
  l record;
  new_module uuid;
  new_lesson uuid;
begin
  insert into public.courses (id, slug, title, subtitle, description, category, level, price_cents, currency, stripe_price_id,
                              theme, glyph, instructor, outcomes, published, featured, position, cover_image_url)
  select new_course, p_slug, p_title, subtitle, description, category, level, price_cents, currency, null,
         theme, glyph, instructor, outcomes, false, false,
         (select coalesce(max(position), -1) + 1 from public.courses), cover_image_url
  from public.courses where id = p_course_id;
  if not found then
    raise exception 'course % not found', p_course_id using errcode = 'P0002';
  end if;

  for m in select * from public.modules where course_id = p_course_id order by position loop
    new_module := gen_random_uuid();
    insert into public.modules (id, course_id, title, position) values (new_module, new_course, m.title, m.position);
    for l in select * from public.lessons where module_id = m.id order by position loop
      new_lesson := gen_random_uuid();
      insert into public.lessons (id, course_id, module_id, slug, title, summary, duration_seconds, bunny_video_id, is_preview,
                                  position, chapters, takeaways, exercise)
      values (new_lesson, new_course, new_module, l.slug, l.title, l.summary, l.duration_seconds, l.bunny_video_id, l.is_preview,
              l.position, l.chapters, l.takeaways, l.exercise);
      insert into public.lesson_interactions (lesson_id, at_seconds, type, prompt, options, explanation, body, scale, xp, required)
      select new_lesson, at_seconds, type, prompt, options, explanation, body, scale, xp, required
      from public.lesson_interactions where lesson_id = l.id;
    end loop;
  end loop;
  return new_course;
end;
$$;

-- ─── Duplicate a lesson right after the original ─────────────────────
create function public.admin_duplicate_lesson(p_lesson_id uuid, p_slug text, p_title text)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  src public.lessons;
  new_lesson uuid := gen_random_uuid();
begin
  select * into src from public.lessons where id = p_lesson_id;
  if not found then
    raise exception 'lesson % not found', p_lesson_id using errcode = 'P0002';
  end if;
  update public.lessons set position = position + 1 where course_id = src.course_id and position > src.position;
  insert into public.lessons (id, course_id, module_id, slug, title, summary, duration_seconds, bunny_video_id, is_preview,
                              position, chapters, takeaways, exercise)
  values (new_lesson, src.course_id, src.module_id, p_slug, p_title, src.summary, src.duration_seconds, src.bunny_video_id, false,
          src.position + 1, src.chapters, src.takeaways, src.exercise);
  insert into public.lesson_interactions (lesson_id, at_seconds, type, prompt, options, explanation, body, scale, xp, required)
  select new_lesson, at_seconds, type, prompt, options, explanation, body, scale, xp, required
  from public.lesson_interactions where lesson_id = p_lesson_id;
  return new_lesson;
end;
$$;

-- ─── Save a curriculum order in one transaction ──────────────────────
-- p_layout: [{"id": "<module id>", "lessons": ["<lesson id>", ...]}, ...] in display order.
-- Lessons may move between modules of the same course; lesson positions run across the whole course.
create function public.admin_reorder_curriculum(p_course_id uuid, p_layout jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  mod jsonb;
  lesson_id text;
  mod_index integer := 0;
  lesson_index integer := 0;
  expected integer;
  seen integer := 0;
begin
  select count(*) into expected from public.lessons where course_id = p_course_id;
  for mod in select * from jsonb_array_elements(p_layout) loop
    update public.modules set position = mod_index where id = (mod ->> 'id')::uuid and course_id = p_course_id;
    if not found then
      raise exception 'module % is not part of course %', mod ->> 'id', p_course_id using errcode = '22023';
    end if;
    for lesson_id in select * from jsonb_array_elements_text(coalesce(mod -> 'lessons', '[]'::jsonb)) loop
      update public.lessons set position = lesson_index, module_id = (mod ->> 'id')::uuid
      where id = lesson_id::uuid and course_id = p_course_id;
      if not found then
        raise exception 'lesson % is not part of course %', lesson_id, p_course_id using errcode = '22023';
      end if;
      lesson_index := lesson_index + 1;
      seen := seen + 1;
    end loop;
    mod_index := mod_index + 1;
  end loop;
  if seen <> expected then
    raise exception 'layout lists % of % lessons', seen, expected using errcode = '22023';
  end if;
end;
$$;

-- These run only from trusted server code with the service role.
revoke execute on function public.admin_duplicate_course(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.admin_duplicate_lesson(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.admin_reorder_curriculum(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.admin_duplicate_course(uuid, text, text) to service_role;
grant execute on function public.admin_duplicate_lesson(uuid, text, text) to service_role;
grant execute on function public.admin_reorder_curriculum(uuid, jsonb) to service_role;
