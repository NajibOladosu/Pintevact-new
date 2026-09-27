# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** ambitious 20 to 35 year olds (young professionals and students) who read pop psychology and listen to podcasts, and want practical self-understanding they can use at work, in relationships and in their habits.
- **Also:** a broader adult self-help audience (roughly 25 to 55) who buy structured learning the way they buy Audible or MasterClass.
- Their job: understand why they think, feel and act the way they do, then change one concrete thing.

## Product Purpose

Pintevact is an interactive learning platform for psychology applied to yourself. Courses are video lessons that pause at set moments to ask the learner something (quiz, reflection, poll, self-rating, insight). Success is a learner who finishes lessons, writes reflections, and can name a pattern in their own life they did not see before.

## Positioning

The video talks back. Every lesson is built around checkpoints on the timeline where the learner answers about their own life, and those answers accumulate into a private record (the Reflection Vault) and a visible map of progress. Passive psychology content (podcasts, YouTube, books) cannot do this.

## Operating Context

- Learners watch on laptop and phone, often in short sessions (7 to 11 minute lessons).
- Public site: catalog, course pages, pricing, a 2-minute mind quiz, journal articles.
- Logged-in app: dashboard, library, lesson player, reflections, achievements, account, billing, admin.
- Payments via Stripe (single course purchase or All-Access membership), video via Bunny Stream, email via Resend, data via Supabase.

## Capabilities and Constraints

- Interaction types: quiz (one correct answer), reflection (free text, private), poll (community results), scale (self-rating), insight (key idea card).
- XP, nine named levels, streaks, badges, certificates.
- Lessons without an uploaded video play on a simulated stage so interactions still work.
- Must support light and dark themes, following the OS setting with a manual toggle.
- Next.js 16 App Router, Tailwind v4, React 19. Tests (Vitest, Playwright) must keep passing.

## Brand Commitments

- Name: Pintevact. Wordmark set in **Outfit, all caps** (user pinned).
- Palette pinned by the user: **#EE4216** (signal orange), **#361A6A** (deep violet), **#11101C** (dark base), **#F8F2EA** (light base).
- The giant wordmark closing the footer is kept as a brand moment, now as PINTEVACT in the Outfit wordmark.
- Feel references named by the user: Linear / Arc (precision, restraint) and Brilliant / Duolingo (learning by doing).
- The user rejected the previous look as busy and AI-generated.

## Evidence on Hand

- Course catalog content in `src/content/catalog.ts` (7 courses, 26 lessons, interactive checkpoints). Instructors and journal articles are placeholder copy written for the build, not real people or publications.
- No testimonials, customer logos, press, learner counts or outcome statistics exist. Do not fabricate them.
- No photography or video assets yet.

## Product Principles

1. Doing beats watching: show the interaction, do not describe it.
2. Calm confidence over stimulation: one idea per screen, one accent at a time.
3. Private by default: reflections are the learner's own, never social.
4. Evidence over hype: cite the research inside lessons, never invent outcomes.

## Accessibility & Inclusion

WCAG 2.2 AA in both themes; full keyboard support for the lesson player; respect reduced motion.
