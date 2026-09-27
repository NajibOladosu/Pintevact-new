-- ════════════════════════════════════════════════════════════════════
--  Pintevact — initial schema
--  Catalog (courses → modules → lessons → interactions), learner data,
--  commerce (Stripe) and gamification, protected with Row Level Security.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── Helpers ─────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─── Profiles ────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  headline text,
  role text not null default 'student' check (role in ('student', 'admin')),
  email_opt_in boolean not null default true,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Create a profile whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profile email in sync when a user changes their address.
create or replace function public.handle_user_email_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end $$;

create trigger on_auth_user_email_changed after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- Users may edit their own profile, but never their role or billing ids.
create or replace function public.protect_profile_columns()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role = old.role;
    new.stripe_customer_id = old.stripe_customer_id;
    new.email = old.email;
  end if;
  return new;
end $$;

create trigger profiles_protect_columns before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ─── Catalog ─────────────────────────────────────────────────────────
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  category text not null default 'General',
  level text not null default 'Beginner' check (level in ('Beginner', 'Intermediate', 'Advanced')),
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'usd',
  stripe_price_id text,
  theme text not null default 'iris' check (theme in ('ember', 'iris', 'lucid', 'tide', 'sun', 'blush')),
  glyph text not null default '◆',
  instructor jsonb not null default '{}'::jsonb,
  outcomes text[] not null default '{}',
  published boolean not null default false,
  featured boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  position integer not null default 0
);
create index modules_course_idx on public.modules (course_id, position);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  module_id uuid not null references public.modules (id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null default '',
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  bunny_video_id text,
  is_preview boolean not null default false,
  position integer not null default 0,
  chapters jsonb not null default '[]'::jsonb,
  takeaways text[] not null default '{}',
  exercise text,
  unique (course_id, slug)
);
create index lessons_course_idx on public.lessons (course_id, position);

create table public.lesson_interactions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  at_seconds integer not null check (at_seconds >= 0),
  type text not null check (type in ('quiz', 'reflection', 'poll', 'insight', 'scale')),
  prompt text not null,
  options jsonb,
  explanation text,
  body text,
  scale jsonb,
  xp integer not null default 10 check (xp >= 0),
  required boolean not null default false
);
create index lesson_interactions_lesson_idx on public.lesson_interactions (lesson_id, at_seconds);

-- ─── Commerce ────────────────────────────────────────────────────────
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete restrict,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  status text not null default 'paid' check (status in ('paid', 'refunded')),
  created_at timestamptz not null default now()
);
create index purchases_user_idx on public.purchases (user_id);

create table public.subscriptions (
  id text primary key, -- Stripe subscription id
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null,
  price_id text,
  interval text check (interval in ('month', 'year')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id);
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Idempotency log for processed Stripe webhook events.
create table public.stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

-- ─── Learning ────────────────────────────────────────────────────────
create table public.enrollments (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  source text not null default 'free' check (source in ('free', 'purchase', 'subscription', 'admin')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, course_id)
);

create table public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  last_position integer not null default 0,
  watched_seconds integer not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index lesson_progress_course_idx on public.lesson_progress (user_id, course_id);
create trigger lesson_progress_updated_at before update on public.lesson_progress
  for each row execute function public.set_updated_at();

create table public.interaction_responses (
  user_id uuid not null references auth.users (id) on delete cascade,
  interaction_id uuid not null references public.lesson_interactions (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  response jsonb not null,
  is_correct boolean,
  created_at timestamptz not null default now(),
  primary key (user_id, interaction_id)
);
create index interaction_responses_interaction_idx on public.interaction_responses (interaction_id);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  at_seconds integer not null default 0,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index notes_user_lesson_idx on public.notes (user_id, lesson_id);

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null,
  reason text not null,
  ref_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, reason, ref_id)
);
create index xp_events_user_idx on public.xp_events (user_id, created_at desc);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ─── Marketing ───────────────────────────────────────────────────────
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text not null default 'general',
  message text not null,
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

-- ─── Access check ────────────────────────────────────────────────────
create or replace function public.has_course_access(p_user uuid, p_course uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    exists (select 1 from public.courses c where c.id = p_course and c.price_cents = 0)
    or exists (select 1 from public.purchases p where p.user_id = p_user and p.course_id = p_course and p.status = 'paid')
    or exists (
      select 1 from public.subscriptions s
      where s.user_id = p_user and s.status in ('active', 'trialing')
        and (s.current_period_end is null or s.current_period_end > now())
    )
    or exists (select 1 from public.enrollments e where e.user_id = p_user and e.course_id = p_course and e.source = 'admin')
    or exists (select 1 from public.profiles pr where pr.id = p_user and pr.role = 'admin');
$$;

-- Aggregated poll results (anonymous counts only).
create or replace function public.poll_results(p_interaction uuid)
returns table (option_id text, votes bigint) language sql stable security definer set search_path = public as $$
  select r.response ->> 'optionId' as option_id, count(*) as votes
  from public.interaction_responses r
  where r.interaction_id = p_interaction and r.response ? 'optionId'
  group by 1;
$$;

-- ─── Row Level Security ──────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_interactions enable row level security;
alter table public.purchases enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.interaction_responses enable row level security;
alter table public.notes enable row level security;
alter table public.xp_events enable row level security;
alter table public.certificates enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- profiles
create policy "profiles: read own" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles: update own" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- catalog: anyone can read published content; admins manage everything
create policy "courses: read published" on public.courses for select using (published or public.is_admin());
create policy "courses: admin write" on public.courses for all using (public.is_admin()) with check (public.is_admin());
create policy "modules: read published" on public.modules for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.published or public.is_admin())));
create policy "modules: admin write" on public.modules for all using (public.is_admin()) with check (public.is_admin());
create policy "lessons: read published" on public.lessons for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.published or public.is_admin())));
create policy "lessons: admin write" on public.lessons for all using (public.is_admin()) with check (public.is_admin());
create policy "interactions: read published" on public.lesson_interactions for select
  using (exists (
    select 1 from public.lessons l join public.courses c on c.id = l.course_id
    where l.id = lesson_id and (c.published or public.is_admin())
  ));
create policy "interactions: admin write" on public.lesson_interactions for all using (public.is_admin()) with check (public.is_admin());

-- commerce: owners can read; only the service role writes (webhooks)
create policy "purchases: read own" on public.purchases for select using (user_id = auth.uid() or public.is_admin());
create policy "subscriptions: read own" on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());

-- learning data: owners fully manage their own rows
create policy "enrollments: read own" on public.enrollments for select using (user_id = auth.uid() or public.is_admin());
create policy "enrollments: self-enrol with access" on public.enrollments for insert
  with check (user_id = auth.uid() and source <> 'admin' and public.has_course_access(auth.uid(), course_id));

create policy "progress: own" on public.lesson_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "responses: own" on public.interaction_responses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notes: own" on public.notes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- gamification: read-only for owners; awarded server-side with the service role
create policy "xp: read own" on public.xp_events for select using (user_id = auth.uid());
create policy "certificates: read own" on public.certificates for select using (user_id = auth.uid() or public.is_admin());

-- marketing tables: service role only (no policies = no anon access), admins can read
create policy "contact: admin read" on public.contact_messages for select using (public.is_admin());
create policy "newsletter: admin read" on public.newsletter_subscribers for select using (public.is_admin());

-- Certificates are public verification pages; expose a narrow lookup function.
create or replace function public.certificate_lookup(p_id uuid)
returns table (id uuid, issued_at timestamptz, course_title text, course_slug text, learner_name text)
language sql stable security definer set search_path = public as $$
  select c.id, c.issued_at, co.title, co.slug, coalesce(p.full_name, split_part(p.email, '@', 1))
  from public.certificates c
  join public.courses co on co.id = c.course_id
  join public.profiles p on p.id = c.user_id
  where c.id = p_id;
$$;

grant execute on function public.poll_results(uuid) to authenticated;
grant execute on function public.certificate_lookup(uuid) to anon, authenticated;
grant execute on function public.has_course_access(uuid, uuid) to authenticated;
