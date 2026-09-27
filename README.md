# Pintevact

**Learn the psychology of you.** Pintevact is an interactive learning platform for self-knowledge: psychology courses built from videos that pause, question and listen. Learners answer checkpoints, write private reflections, vote in live polls, rate themselves and collect insights. Every answer builds a personal "constellation" of their mind.

Built with **Next.js 16 (App Router)**, **Supabase** (Postgres, Auth, RLS), **Stripe** (course purchases and All-Access memberships), **Resend + React Email** (every email is a branded template) and **Bunny Stream** (token-signed HLS video).

---

## What's inside

| Area | Routes |
| --- | --- |
| **Marketing** | `/` home with a live interactive demo player · `/courses` filterable catalog · `/courses/[slug]` course detail · `/pricing` · `/discover` 2-minute mind quiz · `/journal` + articles · `/about` · `/contact` · `/terms` · `/privacy` · 404 |
| **Auth** | `/login` (password or magic link) · `/signup` · `/forgot-password` · `/reset-password` · `/verify-email` · `/auth/confirm` · `/auth/callback` (OAuth) · `/auth/signout` |
| **Learner app** | `/dashboard` (XP, streak, constellation, heatmap, badges) · `/learn` library · `/learn/[course]` · `/learn/[course]/[lesson]` interactive player · `/reflections` (vault + notes) · `/achievements` · `/account` · `/account/billing` · `/certificates/[id]` (public, printable) |
| **Admin** | `/admin` stats & integration health · `/admin/courses` + editor (pricing, publishing, Bunny video per lesson) · `/admin/users` |
| **APIs** | `/api/stripe/checkout` · `/api/stripe/portal` · `/api/stripe/webhook` · `/api/hooks/send-email` (Supabase auth email hook) · `/api/cron/engagement` |

### The interactive player

- Streams Bunny HLS through `hls.js` (native HLS on Safari), using signed, expiring directory tokens.
- Pauses at **quizzes** (with feedback and explanations), **reflections** (saved privately), **polls** (live community results), **self-rating scales** and **insight cards**.
- Timeline with chapter ticks and colour-coded checkpoint markers, a "Next moment" jump, playback speed, fullscreen, and keyboard shortcuts (Space, ←/→, J/L, N for a note, F, M).
- Timestamped notes you can click to seek.
- Progress is saved continuously. A lesson completes at 90% watched plus all required checkpoints. Finishing a course issues a certificate, awards XP and sends an email.
- Lessons without a video yet (or with Bunny not configured) play on a **simulated stage**, so all interactions still work.

### Gamification

XP for every interaction and lesson; nine awareness levels from *Sleepwalker* to *Luminary*; daily streaks; 11 badges; a 28-day heatmap; and a live constellation where each completed lesson lights a star.

---

## Quick start

```bash
npm install
npm run dev
```

With no environment variables, the app runs in **demo mode**: a complete in-memory backend with no external services.

- Any email and password signs you in.
- `demo@pintevact.com` gives you a pre-filled learner with progress, XP and a reflection.
- Any email starting with `admin@` is an admin.
- Checkout is simulated: purchases and memberships unlock instantly.
- Data resets when the server restarts.

---

## Connecting the real services

Copy `.env.example` to `.env.local` and fill it in. Every variable is documented there.

### 1. Supabase

1. Create a project, then apply the schema and catalog:
   ```bash
   supabase db push        # or paste supabase/migrations/*.sql into the SQL editor
   psql "$DATABASE_URL" -f supabase/seed.sql
   ```
2. **Authentication → URL configuration:** set the Site URL to your domain and add `https://YOUR_DOMAIN/**` to the redirect URLs.
3. **Authentication → Hooks → Send Email hook:** type HTTPS, URL `https://YOUR_DOMAIN/api/hooks/send-email`. Copy the generated secret into `SUPABASE_AUTH_HOOK_SECRET`. From then on, every auth email (confirm, magic link, recovery, email change, invite, reauthentication) uses the Pintevact templates and is delivered through Resend.
4. Make yourself an admin:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
5. Optional Google sign-in: enable the Google provider in Supabase and set `NEXT_PUBLIC_AUTH_GOOGLE=true`.

The schema includes row-level security on every table. Learners only see their own progress, notes and reflections; XP, purchases, subscriptions and certificates can only be written server-side. Tables: `profiles`, `courses`, `modules`, `lessons`, `lesson_interactions`, `enrollments`, `lesson_progress`, `interaction_responses`, `notes`, `xp_events`, `certificates`, `purchases`, `subscriptions`, `stripe_events`, `contact_messages`, `newsletter_subscribers`.

### 2. Resend

Verify your sending domain, then set `RESEND_API_KEY`, `EMAIL_FROM` and `CONTACT_INBOX`. Preview every template locally:

```bash
npm run email:dev   # http://localhost:3001
```

Templates live in `src/emails/`:

- **Auth:** confirm signup, magic link, reset password, email change, invite, reauthentication
- **Onboarding:** welcome
- **Billing:** purchase receipt, membership started, membership canceled, payment failed
- **Progress:** course completed (certificate)
- **Engagement:** streak reminder, weekly digest
- **Contact & newsletter:** contact notification, contact auto-reply, newsletter welcome

### 3. Stripe

1. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. Memberships: create a product with a monthly and a yearly recurring price, and set `STRIPE_PRICE_MEMBERSHIP_MONTHLY` / `STRIPE_PRICE_MEMBERSHIP_YEARLY`. If you leave them empty, inline prices of $29/month and $240/year are used (see `src/lib/pricing.ts`).
3. Courses are charged at the price set in the admin panel. Optionally attach a Stripe price ID per course.
4. Add a webhook endpoint at `https://YOUR_DOMAIN/api/stripe/webhook` for these events, and put its signing secret in `STRIPE_WEBHOOK_SECRET`:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `charge.refunded`
5. Enable the **Customer portal** (Settings → Billing → Customer portal).

For local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### 4. Bunny Stream

1. Create a Stream library and upload your videos.
2. Set `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY` so the admin lesson editor can autocomplete videos from your library.
3. Set `BUNNY_STREAM_CDN_HOSTNAME` to the library's pull-zone host (for example `vz-xxxx.b-cdn.net`).
4. Enable **Token Authentication** on that pull zone and set `BUNNY_STREAM_TOKEN_KEY`. The app signs a directory token (`token_path=/{videoId}/`), so the playlist and every segment are authorised, and it expires after `BUNNY_STREAM_TOKEN_TTL` seconds.
5. In **Admin → Courses → (course)**, paste or pick each lesson's video GUID and its duration. Place interaction timestamps inside the real video length.

### 5. Engagement emails (optional)

Set `CRON_SECRET`. `vercel.json` schedules `/api/cron/engagement` daily. It sends streak reminders to learners whose streak is at risk and weekly digests on Sundays, respecting each learner's email preference.

---

## Authoring content

Courses, lessons, chapters, takeaways, exercises and every interactive checkpoint are authored in **`src/content/catalog.ts`** as typed, compact definitions with stable IDs. After editing:

```bash
npm run db:seed:generate   # regenerates supabase/seed.sql (idempotent upserts)
```

Then run the seed against your database. Use the admin panel for day-to-day changes: pricing, publishing, featuring, preview lessons and Bunny video IDs.

> The instructors, course copy and journal articles are placeholders written for this build. Replace them with your own before launch.

---

## Testing

```bash
npm run lint         # ESLint (Next.js + TypeScript rules, React Compiler checks)
npm run typecheck    # tsc --noEmit
npm test             # Vitest: 160+ unit tests
npm run db:test      # migrations + seed + RLS assertions on a throwaway Postgres (needs PG* env vars)
npm run test:e2e     # Playwright: production build in demo mode, desktop + mobile, with axe accessibility checks
```

- **Unit tests** cover catalog integrity, access rules, gamification, the lesson service (scoring, XP idempotency, completion, certificates), the demo store, Bunny URL signing, route guards, validation, every email template, the Supabase auth hook (including signature verification), the Stripe webhook handler and route, and checkout parameters.
- **Database tests** (`supabase/tests/`) run the real migration and seed against Postgres 16 with a stub `auth` schema. They assert profile creation, blocking of role escalation, per-user isolation, paid-enrolment rejection, the no-self-awarded-XP rule, subscription-based access and email sync.
- **End-to-end tests** cover the public site, the hero demo, catalog filters, the quiz, contact and newsletter forms, signup/login/logout and open-redirect protection, a full interactive lesson driven by a fake clock, notes, locked vs preview lessons, course purchases and memberships, profile editing, account deletion, and admin editing and access control.

GitHub Actions (`.github/workflows/ci.yml`) runs all of the above.

---

## Project structure

```
src/
  app/
    (marketing)/     public site + server actions (newsletter, contact)
    (auth)/          auth pages + server actions
    (app)/           learner app, lesson player, account, admin (+ server actions)
    api/             stripe, auth email hook, cron
    auth/            confirm / callback / signout route handlers
    certificates/    public certificate pages
  components/        ui, brand, marketing, course, app, player, auth
  content/           catalog, journal, mind quiz
  emails/            React Email templates
  lib/
    data/            Store interface + Supabase and in-memory demo implementations
    billing/         checkout params, webhook handler, Supabase commerce repo
    supabase/        server/browser/admin clients + session proxy
    ...              access rules, gamification, lesson service, Bunny signing, env
  proxy.ts           session refresh + route guards (Next 16 "proxy")
supabase/
  migrations/        schema, RLS, functions
  seed.sql           generated catalog seed
  tests/             Postgres RLS test harness
tests/
  unit/              Vitest
  e2e/               Playwright
```

## Deploying

Deploy to Vercel (or any Node host), set the environment variables from `.env.example`, and point the Supabase hook and Stripe webhook at your domain. Demo mode never switches on in production unless you set `PINTEVACT_DEMO_MODE=true` explicitly.
