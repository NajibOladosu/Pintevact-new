# Pintevact

**Learn the psychology of you.** Pintevact is an interactive learning platform for self-knowledge: psychology courses built from videos that pause, question and listen. Learners answer checkpoints, write private reflections, vote in live polls, rate themselves and collect insights. Every answer builds a personal "constellation" of their mind.

Built with **Next.js 16 (App Router)**, **Supabase** (Postgres, Auth, RLS), **Stripe** (course purchases and All-Access memberships), **Resend + React Email** (every email is a branded template) and **Bunny Stream** (token-signed HLS video).

---

## Design

The look follows **pintevact.com**. The system is documented in [`DESIGN.md`](DESIGN.md), with tokens in `.impeccable/design.json`. In short:

- **Surfaces:** warm paper (`#F9F3E9`) holds content in large rounded frames with soft shadows. Colour is used in whole blocks: near-black frames, a violet FAQ block and an orange closing band.
- **Colours:** Signal Orange `#EE4217` for actions and progress, and Deep Violet `#371A6A` as the second voice.
- **Type:** Outfit throughout, with big tight headlines. The header wordmark reads "Pintevact"; a giant PINTEVACT closes the footer.
- **Header:** a notched centre nav and a Sign in / Sign up pill. On phones this becomes a MENU pill.
- **Auth:** a split frame where the papercut artwork slides across when you switch between sign in and sign up.
- **Motion:** the papercut art drifts and follows the pointer, frames open as you scroll, CTAs are magnetic, cards tilt, and correct answers spark. Reduced motion keeps everything still (see DESIGN.md → Motion).
- **Themes:** light and dark follow the OS setting. You can switch from the floating settings button (bottom left) or from the app header.
- **Icons:** Phosphor, re-exported from `src/components/icons.ts`. Artwork lives in `public/art/`.

---

## What's inside

| Area | Routes |
| --- | --- |
| **Marketing** | `/` home with a playable checkpoint card · `/courses` filterable catalog · `/courses/[slug]` course detail · `/pricing` · `/discover` 2-minute mind quiz · `/journal` + articles · `/about` · `/contact` · `/terms` · `/privacy` · 404 |
| **Auth** | `/signin` + `/signup` (one page; password, magic link or Google) · `/forgot-password` · `/reset-password` · `/verify-email` · `/auth/confirm` · `/auth/callback` (OAuth) · `/auth/signout` |
| **Learner app** | `/dashboard` (XP, streak, constellation, heatmap, badges) · `/learn` library · `/learn/[course]` · `/learn/[course]/[lesson]` interactive player · `/reflections` (vault + notes) · `/achievements` · `/account` · `/account/billing` · `/certificates/[id]` (public, printable) |
| **Admin** | `/admin` stats & integration health · `/admin/courses` + editor (pricing, publishing, Bunny video per lesson) · `/admin/users` |
| **APIs** | `/api/stripe/checkout` · `/api/stripe/portal` · `/api/stripe/webhook` · `/api/hooks/send-email` (Supabase auth email hook) · `/api/cron/engagement` |

### The interactive player

- Streams Bunny HLS through `hls.js` (native HLS on Safari), using signed, expiring directory tokens.
- Pauses at **quizzes** (with feedback and explanations), **reflections** (saved privately), **polls** (live community results), **self-rating scales** and **insight cards**.
- Timeline with chapter ticks and colour-coded checkpoint markers, a "Next moment" jump, playback speed, fullscreen, and keyboard shortcuts (Space, ←/→, J/L, N for a note, F, M).
- Timestamped notes you can click to seek.
- Progress is saved continuously. A lesson completes at 90% watched plus all required checkpoints. Finishing a course issues a certificate, awards XP and sends an email.
- Lessons without a published video show a "video in production" state; their checkpoints and takeaways stay readable.

### Gamification

XP for every interaction and lesson; nine awareness levels from *Sleepwalker* to *Luminary*; daily streaks; 11 badges; a 28-day heatmap; and a live constellation where each completed lesson lights a star.

---

## Quick start

Pintevact always runs on real services. For local development, run them on your machine with Docker:

```bash
npm install
npm run stack:up    # local Supabase (Postgres, Auth, PostgREST, Mailpit) + Stripe's stripe-mock
cp .env.example .env.local
```

Fill `.env.local` from `npx supabase status` (API URL, anon key and service-role key), then set `SMTP_URL=smtp://127.0.0.1:54325` so emails land in the local inbox at http://127.0.0.1:54324. Then:

```bash
npm run dev
```

Sign up at http://localhost:3000/signup, confirm from the Mailpit inbox, and make yourself an admin with `update public.profiles set role = 'admin' where email = '…';` (psql `postgresql://postgres:postgres@127.0.0.1:54322/postgres`). Use real Stripe test-mode keys and `stripe listen` to try payments end to end. `npm run stack:down` stops everything.

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
5. Google sign-in: enable the Google provider in Supabase (Authentication → Providers → Google) with your OAuth client, and add `https://<project>.supabase.co/auth/v1/callback` as an authorised redirect URI in Google Cloud. The "Continue with Google" / "Sign up with Google" buttons are always shown; new Google users get an account on their first sign-in.

The schema includes row-level security on every table. Learners only see their own progress, notes and reflections; XP, purchases, subscriptions and certificates can only be written server-side. Tables: `profiles`, `courses`, `modules`, `lessons`, `lesson_interactions`, `enrollments`, `lesson_progress`, `interaction_responses`, `notes`, `xp_events`, `certificates`, `purchases`, `subscriptions`, `stripe_events`, `contact_messages`, `newsletter_subscribers`.

### 2. Resend

Verify your sending domain, then set `RESEND_API_KEY`, `EMAIL_FROM` and `CONTACT_INBOX`. (Any SMTP server works too: leave `RESEND_API_KEY` empty and set `SMTP_URL`.) Preview every template locally:

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
3. Set `BUNNY_STREAM_CDN_HOSTNAME` to the library's pull-zone host (for example `vz-xxxx.b-cdn.net`). A full origin such as `http://127.0.0.1:4010` is also accepted, which is how the tests serve local HLS fixtures.
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

Nothing is mocked in the app, and the integration and e2e suites run against real services on your machine (Docker required):

```bash
npm run stack:up          # Supabase via the Supabase CLI + stripe/stripe-mock
npm run lint              # ESLint (Next.js + TypeScript rules, React Compiler checks)
npm run typecheck         # tsc --noEmit
npm test                  # unit: pure logic, rendering, validation (Vitest, jsdom)
npm run db:test           # RLS & business rules on the real database, in a rolled-back transaction
npm run test:integration  # Vitest against Supabase, Mailpit and signed Stripe/auth-hook requests
npm run test:e2e          # Playwright on a production build, desktop + mobile, with axe checks
npm run test:all          # unit + integration + e2e
```

- **Unit tests** cover catalog integrity, access rules, gamification, player timing, Bunny URL signing, route guards, validation, every email template, the auth-hook email mapping and checkout parameters.
- **Database tests** (`supabase/tests/rls.sql`) assert:
  - profile creation;
  - blocked role escalation;
  - per-user isolation;
  - rejection of paid enrolments;
  - that learners can't award themselves XP;
  - subscription-based access;
  - email sync.
- **Integration tests** (`tests/integration/`) use real signed-in Supabase sessions, so row-level security applies exactly as it does in the app. They cover:
  - the lesson service: scoring, XP idempotency, completion, certificates;
  - the data store, including admin operations;
  - the Stripe webhook, with events signed like Stripe signs them;
  - the Supabase Send Email hook, with real signatures;
  - SMTP delivery;
  - the engagement cron.

  Every email is read back from the Mailpit inbox.
- **End-to-end tests** (`tests/e2e/`) drive the real flows:
  - sign-up with the confirmation link from the inbox;
  - sign-in and sign-up as one page, with no reload between them and the header lined up with the home page;
  - magic link and password reset from the inbox;
  - the Google OAuth hand-off to Google's consent screen;
  - protected routes and blocked open redirects;
  - a full lesson on a **real HLS stream**: VP9 fixtures in `tests/fixtures/video`, served like the Bunny CDN, pausing at each checkpoint and completing;
  - notes and the vault;
  - locked lessons;
  - Stripe Checkout (created on stripe-mock), then a signed webhook that unlocks the course or membership and sends the receipt;
  - account deletion and admin editing;
  - the public site and quiz;
  - axe accessibility checks.

GitHub Actions (`.github/workflows/ci.yml`) starts the same stack and runs everything.

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
    data/            Store interface + Supabase implementation
    billing/         checkout params, webhook handler, Supabase commerce repo
    supabase/        server/browser/admin clients + session proxy
    ...              access rules, gamification, lesson service, Bunny signing, env
  proxy.ts           session refresh + route guards (Next 16 "proxy")
supabase/
  migrations/        schema, RLS, functions
  seed.sql           generated catalog seed
  tests/             RLS assertions (run against the local database)
tests/
  unit/              Vitest, pure logic
  integration/       Vitest against the local stack
  e2e/               Playwright against the local stack
  fixtures/video/    HLS fixtures for the player
  support/           local stack settings, Supabase and Mailpit helpers, video server
```

## Deploying

Deploy to Vercel (or any Node host), set the environment variables from `.env.example`, and point the Supabase hook and Stripe webhook at your domain. The app requires Supabase and refuses to send email without Resend or SMTP configured.

GitHub Actions deploys to Vercel (`.github/workflows/ci.yml`); Vercel's own Git deployments are off in `vercel.json`:

- **Every push** runs lint, types and unit tests. A push to any branch other than the default one then deploys a **preview**.
- **The default branch** also runs the database, integration and end-to-end suites, then deploys to **production** only if all of them pass. You can also start it from the Actions tab (`workflow_dispatch`).

It needs the repository variables `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` (from `.vercel/project.json` after `vercel link`) and the secret `VERCEL_TOKEN` (create one at vercel.com/account/tokens):

```bash
gh secret set VERCEL_TOKEN
```

Environment variables come from the Vercel project (`vercel pull`), so manage them there.

Database changes are not applied by the pipeline. Run `supabase db push` against the production project before merging a new migration.
