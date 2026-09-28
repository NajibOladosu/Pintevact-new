-- ════════════════════════════════════════════════════════════════════
--  Email delivery: newsletter unsubscribe tokens and the issue archive.
-- ════════════════════════════════════════════════════════════════════

-- Every subscriber gets an unguessable token for one-click unsubscribe links.
alter table public.newsletter_subscribers
  add column unsubscribe_token uuid not null default gen_random_uuid(),
  add column unsubscribed_at timestamptz;
create unique index newsletter_subscribers_token_idx on public.newsletter_subscribers (unsubscribe_token);

-- Thursday letters, kept so admins can see what went out and to how many people.
create table public.newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  number integer generated always as identity,
  subject text not null,
  content jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent', 'failed')),
  recipients integer not null default 0,
  sent_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index newsletter_issues_number_idx on public.newsletter_issues (number);

alter table public.newsletter_issues enable row level security;
create policy "newsletter issues: admin read" on public.newsletter_issues for select using ((select public.is_admin()));
