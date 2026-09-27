---
name: Pintevact
description: Psychology you answer, not just watch. Learning drawn as a line you ride card by card.
colors:
  signal-orange: "#ee4216"
  signal-orange-hover: "#d93a10"
  signal-orange-hover-dark: "#ff5a2e"
  signal-orange-ink: "#b5300c"
  signal-orange-ink-dark: "#ff7249"
  card-back-violet: "#361a6a"
  on-violet: "#f8f2ea"
  on-violet-muted: "#cbbfe0"
  night-ink: "#11101c"
  paper-ground: "#f8f2ea"
  paper-raised: "#fffbf6"
  paper-sunken: "#efe7db"
  ink-muted: "#4d4859"
  ink-subtle: "#6a6475"
  hairline: "rgb(17 16 28 / 0.12)"
  hairline-strong: "rgb(17 16 28 / 0.24)"
  night-ground: "#11101c"
  night-raised: "#1a1828"
  night-sunken: "#0b0a13"
  night-fg: "#f8f2ea"
  night-muted: "#bcb4c7"
  night-subtle: "#928a9f"
  night-hairline: "rgb(248 242 234 / 0.11)"
  night-hairline-strong: "rgb(248 242 234 / 0.22)"
  focus-violet: "#361a6a"
  focus-lilac-dark: "#b9a4ff"
typography:
  display:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  card-prompt:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "\"ss01\", \"cv11\""
  label:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
  station-code:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.72rem"
    fontWeight: 500
    letterSpacing: "-0.025em"
  wordmark:
    fontFamily: "Outfit Variable, Geist Sans, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  badge: "6px"
  control: "8px"
  button: "10px"
  popover: "12px"
  card: "16px"
  station: "9999px"
spacing:
  gutter-mobile: "20px"
  gutter-desktop: "32px"
  card-pad-mobile: "20px"
  card-pad: "32px"
  section-y: "80px"
  section-y-lg: "112px"
  container: "72rem"
  container-app: "64rem"
components:
  button-primary:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "0 20px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.signal-orange-hover}"
  button-secondary:
    backgroundColor: "{colors.night-ink}"
    textColor: "{colors.paper-ground}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "0 20px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "0 20px"
  button-violet:
    backgroundColor: "{colors.card-back-violet}"
    textColor: "{colors.on-violet}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "0 20px"
  card:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  card-back:
    backgroundColor: "{colors.card-back-violet}"
    textColor: "{colors.on-violet}"
    rounded: "{rounded.card}"
    padding: "32px"
  answer-option:
    backgroundColor: "transparent"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.button}"
    padding: "12px 16px"
  input:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "0 14px"
  badge-accent:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.badge}"
    padding: "2px 8px"
  line-bullet:
    backgroundColor: "transparent"
    textColor: "{colors.night-ink}"
    typography: "{typography.station-code}"
    rounded: "{rounded.station}"
    size: "36px"
  nav-item-active:
    backgroundColor: "rgb(17 16 28 / 0.06)"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
---

# Design System: Pintevact

## Overview

**Creative North Star: "The Line You Ride"**

Pintevact draws learning as a transit line. Every lesson is a line, every checkpoint is a station, and every station is a card you answer. Answering flips the card to its deep violet back and fills the next stretch of rail in signal orange. The whole interface is built from three materials: a warm paper (or night) ground, 2px rails with circle stations, and flat hairline cards. Nothing else is decorative; progress is the ornament.

The mood is calm precision with a single hot signal: Linear-grade restraint in the chrome, Brilliant-style learning by doing in the content. Density is moderate and editorial on the public site (one idea per section, generous section rhythm) and tighter in the app (dashboard, player, vault), but both share the same tokens, radii and line grammar. Light and dark are equal citizens: the theme is class-driven (`.dark` on `html`), follows the OS setting by default, and has a manual toggle. The lesson player stage is always dark, whatever the page theme.

The system rejects pastel wellness illustration and the dark neon AI hero, and it replaces a previous look the user rejected as busy and AI-generated.

**Key Characteristics:**
- One accent, signal orange, reserved for the traveled line, finished stations and the primary action.
- Deep violet is the answered side of a card and the colour of deep panels; it never appears as a gradient.
- Geist Sans for everything; Geist Mono only for line codes and literal code; Outfit caps only for the PINTEVACT wordmark.
- 2px rails, circle stations: hollow ahead, orange done, ringed current.
- Flat hairline cards (16px); stack depth by offset card edges, not drop shadows.
- Phosphor icons, regular weight (fill weight marks the active nav item).

## Colors

A warm paper-and-ink neutral pair carrying one hot orange signal and one deep violet surface.

### Primary
- **Signal Orange** (`signal-orange`): the traveled rail, filled stations, the current-station ring (at 20% alpha), primary buttons, badges of emphasis, text selection and the input caret. Text on it is always Night Ink, never white. Hover darkens in light mode (`signal-orange-hover`) and brightens in dark mode (`signal-orange-hover-dark`).
- **Orange Ink** (`signal-orange-ink` / `signal-orange-ink-dark`): the text-safe orange for icons and small words on the ground (active nav icon, lesson-line stop icons, "required" marks, success checks). Doubles as the danger colour.

### Secondary
- **Card-Back Violet** (`card-back-violet`): the answered side of every checkpoint card, the lesson-complete overlay, the reflection quote, onboarding panels, avatars and the XP toast. Identical in both themes. Text on it is `on-violet` for primary copy and `on-violet-muted` for secondary copy. A 7% (light) or 12% lilac (dark) soft tint serves quiet badges.

### Neutral
- **Paper Ground** (`paper-ground`) / **Night Ground** (`night-ground`): the page background in light and dark.
- **Paper Raised** (`paper-raised`) / **Night Raised** (`night-raised`): cards, inputs, popovers.
- **Paper Sunken** (`paper-sunken`) / **Night Sunken** (`night-sunken`): full-bleed explanatory bands (at 60% on the homepage "how a lesson works" band).
- **Night Ink** (`night-ink`) / **Night FG** (`night-fg`): body text and headings; also the secondary button fill (inverted).
- **Ink Muted** (`ink-muted` / `night-muted`): supporting paragraphs and inactive nav.
- **Ink Subtle** (`ink-subtle` / `night-subtle`): metadata, timestamps, captions, placeholders.
- **Hairline** (`hairline` / `night-hairline`): card borders and section dividers. **Hairline Strong** (`hairline-strong` / `night-hairline-strong`): untraveled rail, hollow station rims, input and outline-button borders.
- **Focus** (`focus-violet` light, `focus-lilac-dark` dark): the 2px focus outline, offset 2px.

### Named Rules
**The One Signal Rule.** Orange means "traveled" or "go". It marks the rail you have covered, stations you have filled, and the single primary action in a view. It is never a background wash, a heading colour or a decorative stripe.

**The Answered Side Rule.** Violet means "answered" or "yours". A surface turns violet when the learner has responded, completed, or earned something; it is not a generic brand panel colour for arbitrary content.

## Typography

**Display Font:** Geist Sans (with ui-sans-serif, system-ui)
**Body Font:** Geist Sans, with stylistic sets `ss01` and `cv11` on
**Label/Mono Font:** Geist Mono for line codes and literal strings; Outfit Variable caps for the wordmark only

**Character:** One precise grotesque does all the talking, tightened at size and set in balanced wraps. Numbers use tabular figures in Geist Sans rather than switching face, so timestamps, XP, prices and counts line up without visual noise.

### Hierarchy
- **Display** (600, 2.5rem mobile to 3.75rem, line-height 1.02, -0.035em): the one hero headline per page, capped near 14ch.
- **Headline** (600, 1.875rem to 2.25rem, -0.025em): section headings, capped at 16 to 20ch so they break into two deliberate lines.
- **Title** (600, 1.125rem to 1.5rem, -0.025em): course names in rows, dashboard panel headings, footer newsletter heading.
- **Card Prompt** (600, 1.125rem to 1.5rem, line-height 1.375): the question on a checkpoint card.
- **Body** (400, 1rem to 1.125rem, line-height 1.625): paragraphs at 42 to 58ch; supporting text in Ink Muted.
- **Label** (500, 0.875rem): buttons, nav items, card-kind lines ("Checkpoint, from ..."), meta lines. Sentence case, no tracking.
- **Station Code** (Geist Mono 500, 0.72rem): the two-letter course code inside a line bullet.
- **Wordmark** (Outfit 600, uppercase, +0.08em): PINTEVACT in the header logo and the giant footer wordmark (17.5vw, capped at 13.6rem, 7% ink).

### Named Rules
**The Sentence Case Rule.** All labels, card kinds and meta lines are sentence case at normal tracking. Uppercase and wide tracking belong to the wordmark alone.

**The Tabular Numbers Rule.** Any number that changes or sits in a column (time, XP, price, counts, percentages) is set with tabular figures.

## Layout

A centred single container: 72rem (`max-w-6xl`) on the public site, 64rem (`max-w-5xl`) in the app, with 20px side gutters on mobile and 32px from `sm` up. Public sections breathe at 80px vertical padding, 112px from `lg`; full-bleed bands are marked by top and bottom hairlines and the sunken ground rather than cards. The hero is a two-column grid (`1fr` and a 30rem deck column) from `lg`, stacking to text-over-deck on mobile. Asymmetric two-column splits (0.9fr / 1.1fr) carry supporting sections.

Rails are laid out to scale: the lesson line places checkpoints at their true timestamps on desktop and becomes a vertical rail with a 2px left border on mobile. Course rows run as a three-column grid (bullet, text, price) that adds a fourth station-line column from `md`. The app uses a left sidebar nav on desktop and a fixed five-tab bottom bar under `lg`. Breakpoints are Tailwind defaults (640, 768, 1024, 1280, 1536).

## Elevation & Depth

The system is flat. Depth comes from tonal layering (sunken, ground, raised), hairline borders, and the card-stack device: offset edges of the cards waiting underneath (a violet card edge 12px below, a raised hairline card 6px below) peek from beneath the active card. Floating layers that sit over other content (toasts, the user menu) carry one soft ambient shadow so they read as detached; the active pill of a segmented control carries a 1px contact shadow.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 8px 24px -12px rgb(17 16 28 / 0.35)`): toasts.
- **Menu** (`box-shadow: 0 16px 40px -16px rgb(17 16 28 / 0.35)`): dropdown menus anchored to a trigger.
- **Pill contact** (`box-shadow: 0 1px 2px rgb(17 16 28 / 0.12)`): the selected segment in a segmented tab control.

### Named Rules
**The Stacked Deck Rule.** A card that is part of a sequence shows its depth by the offset edges of the cards behind it, never by a drop shadow. Cards at rest are flat.

**The Floating-Only Shadow Rule.** Shadows are reserved for layers that float over the page (toasts, menus). Cards, panels, buttons and inputs never cast one.

## Shapes

Two geometries do all the work: soft rectangles and perfect circles. Cards, panels, the deck and the player stage use a 16px radius; buttons, inputs and answer options use 10px; popovers and list rows 12px; nav items and small controls 8px; badges 6px. Stations, line bullets, avatars and the play button are full circles. Lines are always 2px: the rail, station rims, the vertical mobile rail and the outline line bullet. Borders elsewhere are 1px hairlines. A dashed hairline marks an empty, private writing area.

## Components

### Buttons
Confident, compact and flat; they nudge down 1px on press.
- **Shape:** gently rounded (10px). Heights 36px (sm), 44px (md), 48px (lg), 40px square for icon buttons.
- **Primary:** Signal Orange with Night Ink label, weight 500. One per view.
- **Secondary:** inverted ink (Night Ink fill, ground-coloured label); used for "Dashboard" when signed in.
- **Outline:** 1px strong hairline, ink label; hover darkens the border to full ink with a 3% ink wash. The quiet partner to Primary ("See courses").
- **Ghost:** muted label, 5% ink wash on hover.
- **Violet:** Card-Back Violet with paper label, for actions inside answered contexts.
- **Danger:** 1px danger-tinted border and danger label, filling solid on hover.
- **Hover / Focus:** 150ms colour transitions; 2px focus outline in the focus colour at 2px offset. Disabled at 50% opacity.

### Chips / Badges
- **Style:** 6px radius, 12px medium label, 2px by 8px padding.
- **Tones:** neutral (strong hairline border, muted text), accent (orange, ink text), violet (violet, paper text), soft (violet tint, ink text), success (inverted ink).

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Paper Raised / Night Raised.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px hairline.
- **Internal Padding:** 24px default, 20px mobile to 32px desktop on feature cards.

### Inputs / Fields
- **Style:** 10px radius, 1px strong hairline, raised fill, 44px tall, 14px horizontal padding; orange caret; subtle placeholder.
- **Focus:** border goes to full ink with a 2px orange ring at 25%.
- **Error:** border switches to the danger colour, with a small danger-coloured message beneath. Labels sit above in 14px medium.

### Navigation
- **Marketing header:** sticky 64px bar, ground at 85% with backdrop blur and a bottom hairline; muted 14px links that go to ink on hover; theme toggle, ghost "Sign in" and primary "Start free" on the right.
- **App sidebar:** 8px-radius rows with 18px Phosphor icons; active row has a 6% ink wash, medium weight, and a filled icon in Orange Ink.
- **Mobile tab bar:** fixed bottom, five tabs, 20px icons over 11px labels, same active treatment; respects the safe-area inset.

### Station Line (signature)
The brand's core device. A 2px untraveled rail in strong hairline with the traveled portion in Signal Orange, animating width over 700ms on the expo-out curve. Stations are circles with a 2px rim (14px, or 10px in the small size): done stations are solid orange, the current station is orange-rimmed on the ground with a 4px orange ring at 20%, stations ahead are hollow with a strong-hairline rim. Optional labels sit beneath in 12px subtle tabular text. The plain progress bar is the same 2px rail without stations; it is the only progress visual in the system.

### Line Bullet (signature)
A 36px circle badge with a two-letter course code in Geist Mono, either 2px ink outline or solid ink. It heads every course row, like a transit line badge.

### Checkpoint Card (signature)
The front is a raised hairline card with a label line ("Checkpoint, from The Elephant and the Rider"), a Card Prompt question and full-width answer options (10px radius, strong hairline, ink border and wash on hover, trailing arrow or leading A/B/C letter). Answering flips it (600ms rotateY on the expo-out curve) to the violet back, which carries the verdict, the explanation in muted violet text and the way forward. On the back, the correct quiz option inverts to a paper fill with violet text; poll results fill as 15% paper bars. Under reduced motion the flip becomes an instant swap.

### Course Row (signature)
A full-width link row, 16px radius, with no border at rest and a 3% ink wash on hover: line bullet, title and two-line subtitle, the course's small station line with a tabular fact line (lessons, minutes, checkpoints), then price and an arrow that slides 2px on hover.

### Lesson Player
The stage is always dark (it carries the `.dark` class regardless of theme), 16px radius, with an orange circular play button, a 2px scrubber rail with 1px checkpoint ticks, and 36px ghost icon controls. Checkpoint cards open over a blurred ground scrim; lesson completion takes over the stage in violet with an orange station medallion. A raised hairline side panel holds checkpoints, chapters and notes behind a segmented tab control.

## Do's and Don'ts

### Do:
- **Do** draw progress as a 2px rail with circle stations: hollow ahead, orange done, ringed current.
- **Do** keep Signal Orange to the traveled line, finished stations and one primary action per view, with Night Ink text on it.
- **Do** flip answered cards to Card-Back Violet and put feedback, XP and the next action on that back.
- **Do** show stack depth with offset card edges beneath the active card.
- **Do** use Geist Sans throughout, tabular figures for every changing number, and sentence case labels.
- **Do** use Orange Ink rather than Signal Orange for small text and icons on the ground, so contrast holds in both themes.
- **Do** keep the lesson player stage dark in both themes, and verify every screen in light and dark.
- **Do** use Phosphor icons at regular weight, inlined at 14 to 20px.

### Don't:
- **Don't** put drop shadows on cards, panels, buttons or inputs; shadows belong only to floating toasts and menus.
- **Don't** use orange or violet as gradients, background washes or decorative stripes.
- **Don't** set the wordmark face, uppercase or wide tracking on anything but PINTEVACT.
- **Don't** introduce a second accent hue, pastel illustration, or neon-on-black hero treatments.
- **Don't** put white text on Signal Orange.
- **Don't** add progress visuals other than the rail (no rings, gauges or chunky bars).
