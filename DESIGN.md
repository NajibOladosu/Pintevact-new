---
name: Pintevact
description: Learn the psychology of you. Warm paper, rounded frames, signal orange, one deep violet, taken from pintevact.com.
reference: https://www.pintevact.com (home, /signin, /signup, /programmes, /about, /contact)
colors:
  paper: "#f9f3e9"
  panel: "#fefcf8"
  paper-sunken: "#f1e8da"
  ink: "#0d0d19"
  ink-muted: "#595969"
  ink-subtle: "#6f6e7e"
  line: "rgb(17 16 26 / 0.12)"
  line-strong: "rgb(17 16 26 / 0.22)"
  signal: "#ee4217"
  signal-hover: "#da2300"
  signal-ink: "#c8340c"
  hero-cream: "#fbe6d6"
  hero-peach: "#f7a684"
  on-signal: "#faf8f4"
  violet: "#371a6a"
  on-violet: "#f5f1ea"
  frame: "#030309"
  on-frame: "#f5f1ea"
  danger: "#c02f47"
  dark-paper: "#10101c"
  dark-panel: "#181727"
  dark-ink: "#efebe2"
  dark-muted: "#a3a3b1"
  dark-signal-ink: "#ff7a4f"
typography:
  family: "Outfit Variable, ui-sans-serif, system-ui, sans-serif"
  display: { size: "clamp(3.4rem, 9vw, 8.4rem)", weight: "300 + 700", lineHeight: 0.92, letterSpacing: "-0.055em" }
  section: { size: "clamp(2.4rem, 5vw, 4.6rem)", weight: 600, lineHeight: 0.98, letterSpacing: "-0.05em" }
  page: { size: "clamp(2.2rem, 4vw, 3.4rem)", weight: 600, lineHeight: 1, letterSpacing: "-0.045em" }
  sub: { size: "clamp(1.5rem, 2.15vw, 2.4rem)", weight: 600, lineHeight: 1.05, letterSpacing: "-0.04em" }
  body: { size: "0.9375rem", weight: 400, lineHeight: 1.58 }
  eyebrow: { size: "0.72rem", weight: 600, letterSpacing: "0.14em", transform: uppercase }
radii:
  field: "0.85rem"
  block-button: "0.9rem"
  card: "1.5rem–1.6rem"
  frame: "2.4rem"
  pill: "999px"
---

# Design System: Pintevact

## Overview

The look is taken directly from **pintevact.com**, which the owner pointed to as the target. It is calm and editorial: warm paper, generous space, big tight headlines in Outfit, and content held in large rounded **frames** that float on the page with soft shadows. Colour is used in blocks. There is a near-black frame for the catalogue, a violet block for questions and an orange band for the closing call to action. There are no gradients or glows on UI surfaces.

The one image is a **papercut artwork**: layered paper in cream, peach, orange, violet and brown. It is the hero backdrop, the auth art panel, the course card thumbnails (each course crops a different part), the dashboard "Up next" frame and the 404 page.

The product stays interactive. The home hero holds a playable checkpoint card, and every lesson pauses to ask about the learner.

## Colors

- **Paper `#f9f3e9`** is the page. **Panel `#fefcf8`** is every raised surface (cards, forms, the header notch, pills).
- **Ink `#0d0d19`** is for text and the block buttons. Muted `#595969` is for supporting copy.
- **Signal `#ee4217`** is the action colour: primary pills, the sign in/sign up switch, the auth submit, progress, eyebrows (as `#c8340c` for text on paper) and the closing band.
- **Violet `#371a6a`** is the second voice: the Sign up pill in the header, the FAQ block, All-Access, the answered side of a checkpoint card, reflections and avatars.
- **Frame `#030309`** is the near-black of dark sections: the catalogue frame, the course-detail closing frame and the app's sidebar rail.
- Dark theme swaps paper/panel/ink (`#10101c`, `#181727`, `#efebe2`). Signal, violet and frame stay the same.

## Typography

Outfit for everything, set tight:

- **Hero display:** light weight for the first words and bold weight with a peach-to-orange gradient on the last word ("Know your own **mind.**"), following the reference's "New Way Of **Growing**".
- **Section headlines:** 600 weight, −0.05em tracking, line height under 1, often broken into two short sentences ("Two courses. One route inward.").
- **Eyebrows:** small uppercase labels with wide tracking. Orange opens a page; muted opens a section.
- **Numbers:** `01 02 03` in orange index lists (lesson path, FAQ, curriculum, beliefs, journal).

## Layout

- The content shell is at most 90rem wide, with side padding of `clamp(1.25rem, 4.5vw, 5rem)`.
- Sections are separated by large vertical rhythm (6–8rem), not rules.
- **Frames** have a 2.4rem radius and `shadow-frame`. The home hero frame is inset 8–16px from the viewport edge and runs under the header.
- A typical page closes with the **orange CTA band** (`CtaBand`), then the footer.

## Components

- **Header.** At rest there are three parts: the wordmark on the left, a **notched centre tab** with the nav links, and a panel-coloured pill on the right holding Sign in (quiet) and Sign up (violet). The notch has concave shoulders. On scroll the bar flattens into a blurred paper strip. On phones the right side becomes a **MENU pill** with an orange circle, which opens a full-screen numbered menu.
- **Footer.** A full-width **PINTEVACT** wordmark (Outfit 700, caps), then a statement with the newsletter form, three uppercase-labelled link columns, and a bottom row.
- **Settings dock.** A floating round button at the bottom left, which opens a tray with the theme switch.
- **Buttons:**
  - Primary: an orange pill with an ↗ arrow.
  - Block: a near-black rounded 0.9rem button, full width inside cards, with the label on the left and the arrow on the right.
  - Light: the same shape in panel white, used on dark and orange surfaces.
  - Outline: a pill.
- **Fields.** 3.15rem tall with a 0.85rem radius and a hairline border. Focus shows an orange border with a soft orange ring. Password fields have a text **Show/Hide** toggle.
- **Auth frame.** One rounded frame split in two, with the form on one side and the papercut art on the other. On `/login` the art is on the right; on `/signup` it slides to the left over 0.82s, and the image shifts from its violet end to its brown end. The top bar holds the wordmark and an orange **sliding switch** between Sign in and Sign up. The form has "Back to site", an orange eyebrow, a big headline ("Welcome back." / "Come as you are."), a lead, fields, a full-width orange submit with an arrow, a swap line, and a footer with © and Help/Home. On phones the art fills the screen behind a frosted form card.
- **Course route (home).** The catalogue frame shows the courses as stops on one line rather than a scrolling row. The free course is the orange stop ("Start here") and the next is a panel stop ("Go deeper"). Each has its art or cover, a big index number, a line code, and its first lessons as stations on a vertical rail. An orange arrow badge on the seam joins them. On wide screens the stop you hover or focus widens.
- **Admin.** Same panels as the learner app: rounded `bg-raised` cards with a hairline ring. Reorderable rows have a grip handle, and destructive actions confirm in a native modal `<dialog>`. Outcomes appear as toasts. The course and lesson editors keep their Save button in a sticky bar.
- **Course card.** The art crop sits at the top with category and level chips and a big white index number. Below it are an uppercase meta line, the title, the subtitle, four feature bullets and a block "View course" button. The free course uses the orange variant. On `/courses` the cards sit inside a dark bezel frame.
- **FAQ.** A violet statement block ("Curious? Good.") next to a panel of numbered accordion rows.
- **Learner app:**
  - Navigation is a **dark floating rail** with orange pill links and a level card, plus a floating dark tab pill on phones.
  - The top-right pill holds XP, the theme switch and the avatar.
  - Panels are rounded 2rem cards, and the dashboard opens with an art frame for "Up next".
- **Progress.** Rounded orange bars. Lesson stations sit on a 4px rounded rail.
- **Emails.** Paper background, a 28px-radius panel, Outfit, an orange eyebrow over each headline, an orange pill button, and a PINTEVACT wordmark in the footer.
  - Each email can open with a papercut art band (`public/email/band-{violet,amber,dawn,dusk}.jpg`). They're JPG because mail clients don't reliably show WebP.
  - Shared parts live in `src/emails/_components/layout.tsx`: `Heading`, `CTA`, `Callout` (violet), `Steps` (orange 01/02 numbering), `Stats` (dark tiles), `Details` (receipt rows), `OtpCode`, `SecurityNote`.
  - Layout is table-based with inline styles. A single 480px media query tightens padding and type on phones.

## Motion

One authored moment, quiet everywhere else (`src/components/motion/*`, CSS in `globals.css`):

- **Focal:** the papercut breathes. The hero art (`HeroArt`) drifts on a 24s loop and shifts a few pixels against the pointer. The headline lines rise out of a mask, and the gradient on "mind." (cream `#fbe6d6` → peach `#f7a684` → signal) sweeps once. On auth, switching modes slides the art across the frame with `cubic-bezier(0.76,0,0.24,1)`, plus a brief "breathe" and a sheen.
- **Continuity:**
  - `data-reveal="frame"` opens rounded frames with a clip-path.
  - `data-reveal="rise"` lifts and sharpens blocks.
  - `data-reveal="list"` staggers children (capped at about 330ms).
  - A pill glides between links in the header notch and in the app's rail.
  - FAQ answers expand to their real height (`interpolate-size`).
- **Feedback:**
  - `data-magnetic` CTAs lean toward the pointer, and `.arrow-nudge` arrows move up and to the right.
  - `data-tilt` cards tilt, and their art drifts and zooms.
  - `data-spotlight` dark and orange frames get a soft pointer light.
  - XP counts up (`CountUp`).
  - Correct answers and lesson completion fire `Sparks`.
  - The lesson marquee pauses on hover.
- **Rules:**
  - Content is visible by default; reveals only apply after `MotionRoot` runs.
  - Pointer effects exist only on fine pointers.
  - Under `prefers-reduced-motion` everything is static: no drift, no marquee, no masks, no sparks.

## Do's and Don'ts

**Do:**
- Hold content in rounded frames and panels on paper.
- Use colour as whole blocks (frame, violet, orange).
- Keep headlines short, tight and heavy.
- Add the ↗ arrow to forward actions.
- Reuse the papercut art for imagery.

**Don't:**
- Add gradient text other than the single hero word (pinned by the pintevact.com reference).
- Add glow effects or neon.
- Add stock illustrations.
- Add more than one accent colour per block.
- Invent testimonials or statistics.
- Use square corners on interactive elements.
