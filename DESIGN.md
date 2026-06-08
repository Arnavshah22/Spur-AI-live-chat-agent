---
name: Acme Support
description: Neo Kinpaku chat. Kinpaku gold and verdigris patina on dark lacquer. Restraint in chrome, brilliance in the thread.

# Source of truth: client/src/index.css (@theme block). Update both when tokens change.
colors:
  kinpaku-gold: "oklch(84% 0.19 80.46)"
  verdigris-patina: "oklch(70% 0.12 188)"
  lacquer-black: "oklch(7% 0.006 95)"
  lacquer-deep: "oklch(4% 0.004 95)"
  raised-lacquer: "oklch(11% 0.006 95)"
  graphite: "oklch(15% 0.008 95)"
  graphite-2: "oklch(19% 0.008 95)"
  champagne: "oklch(91% 0 0)"
  text-warm: "oklch(88% 0 0)"
  text-muted: "oklch(72% 0 0)"
  text-faint: "oklch(62% 0 0)"
  text-mute-deep: "oklch(52% 0 0)"
  kinpaku-pale: "oklch(86% 0.07 84)"
  kinpaku-rich: "oklch(77% 0.13 82)"
  kinpaku-deep: "oklch(61% 0.085 78)"
  gold-hairline: "oklch(78% 0 0 / 0.16)"
  gold-hairline-strong: "oklch(74% 0.09 82 / 0.6)"
  patina-pale: "oklch(82% 0.07 188)"
  patina-deep: "oklch(49% 0.08 188)"
  vermilion-warning: "oklch(58% 0.15 35)"

typography:
  title:
    fontFamily: "Albert Sans, Avenir Next, Helvetica Neue, Arial, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Albert Sans, Avenir Next, Helvetica Neue, Arial, system-ui, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "SFMono-Regular, Roboto Mono, Consolas, monospace"
    fontSize: "0.7rem"
    fontWeight: 500
    letterSpacing: "0.18em"
  caption:
    fontFamily: "Albert Sans, Avenir Next, Helvetica Neue, Arial, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 500
    lineHeight: 1.4

rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  pill: "20px"

spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  gutter: "max(1rem, 4vw)"

components:
  button-send:
    backgroundColor: "{colors.kinpaku-gold}"
    textColor: "{colors.lacquer-deep}"
    rounded: "{rounded.lg}"
    size: "44px"
  button-send-hover:
    backgroundColor: "{colors.kinpaku-pale}"
    textColor: "{colors.lacquer-deep}"
  button-send-disabled:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.text-mute-deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.lg}"
    size: "36px"
  chip-suggestion:
    backgroundColor: "{colors.graphite-2}"
    textColor: "{colors.champagne}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  bubble-user:
    backgroundColor: "{colors.kinpaku-gold}"
    textColor: "{colors.lacquer-deep}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  bubble-agent:
    backgroundColor: "{colors.raised-lacquer}"
    textColor: "{colors.text-warm}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  input-composer:
    backgroundColor: "{colors.lacquer-deep}"
    textColor: "{colors.champagne}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
---

# Design System: Acme Support

## 1. Overview

**Creative North Star: "The Lacquer Concierge"**

Acme Support is a mobile-first customer chat dressed in the Neo Kinpaku material language: warm black lacquer grounds, kinpaku gold for the customer's voice and primary actions, verdigris patina for availability and success. The interface should feel like a precise, premium shop counter on a phone: calm surfaces, readable type, gold used sparingly but decisively.

This is product UI, not marketing theater. The conversation thread is the hero. Chrome stays flat and quiet so messages, suggestions, and errors read instantly. PRODUCT.md calls for understated confidence; the visual system enforces that by keeping accents on bubbles, send, and status, not on decorative scaffolding.

**Key characteristics:**

- Dark lacquer surfaces (never pure black, never cream or SaaS purple).
- Albert Sans for all chat copy and controls; mono labels only for system markers.
- Kinpaku gold on user messages and the send CTA; patina marks "online" and copy success.
- Hairline borders before shadows; bubbles carry a single light drop shadow at most.
- 44px minimum touch targets; horizontal padding uses `max(1rem, 4vw)` for thumb reach.
- Motion is functional: message slide-in, typing dots, quick-reply stagger; ease-out only.

## 2. Colors

A restrained product palette: tinted dark neutrals carry most of the screen; gold and patina are accents with assigned meaning.

### Primary

- **Kinpaku Gold** (`oklch(84% 0.19 80.46)`): User message bubbles, send button when active, brand avatar fill, focus/selection accents. This is the customer's voice in the thread.
- **Kinpaku Pale** (`oklch(86% 0.07 84)`): Hover lift on gold CTAs (send button).
- **Kinpaku Rich** (`oklch(77% 0.13 82)`): Reserved for emphasized active states if needed; not the default fill.

### Secondary

- **Verdigris Patina** (`oklch(70% 0.12 188)`): Online indicator dot, "Online" label, copy-success icon. Signals availability and positive system feedback, not decoration.
- **Patina Pale** (`oklch(82% 0.07 188)`): Hover lift on patina-adjacent surfaces if extended.

### Neutral

- **Lacquer Black** (`oklch(7% 0.006 95)`): Page and app background (`body`, chat shell).
- **Lacquer Deep** (`oklch(4% 0.004 95)`): Composer input well, deepest inset.
- **Raised Lacquer** (`oklch(11% 0.006 95)`): Header bar, agent bubbles, typing indicator shell.
- **Graphite** (`oklch(15% 0.008 95)`): Icon button hover, message action bar, chip hover.
- **Graphite 2** (`oklch(19% 0.008 95)`): Suggestion chips and empty-state pills at rest.
- **Champagne** (`oklch(91% 0 0)`): Headlines, composer text, chip labels.
- **Text Warm** (`oklch(88% 0 0)`): Agent message body.
- **Text Muted** (`oklch(72% 0 0)`): Subtitles ("Typically replies in minutes"), typing label.
- **Text Faint** (`oklch(62% 0 0)`): Timestamps, placeholders, day separators.
- **Text Mute Deep** (`oklch(52% 0 0)`): Disabled send icon.
- **Gold Hairline** (`oklch(78% 0 0 / 0.16)`): Default borders (header rule, agent bubbles, chips).
- **Gold Hairline Strong** (`oklch(74% 0.09 82 / 0.6)`): Focused composer border, user bubble border, chip hover.

### State

- **Vermilion Warning** (`oklch(58% 0.15 35)`): Errors only (banner text, error bubble copy, dismiss hover). Background uses 8–15% opacity tints of the same hue.

### Named Rules

**The Gold Is the User Rule.** Kinpaku gold marks what the shopper said or did (user bubble, send). Agent content stays on raised lacquer. Do not put gold fills on both sides of the thread.

**The Patina Means Live Rule.** Verdigris is for online presence and positive confirmation (copied checkmark). It is not a second primary accent on arbitrary chrome.

**The OKLCH-Only Rule.** New tokens live in `client/src/index.css` as OKLCH. Reference via `var(--color-*)` in components; do not hardcode hex like `#0B1020` or legacy Intercom purple `#635BFF`.

## 3. Typography

**Body and UI font:** Albert Sans, Avenir Next, Helvetica Neue, Arial, system-ui, sans-serif  
**Label font:** SFMono-Regular, Roboto Mono, Consolas, monospace

**Character:** Humanist geometric sans for legibility at arm's length on mobile. Mono appears only on short system markers (day labels, "Suggestions" eyebrow), never on message body.

### Hierarchy

- **Title** (600, 0.95rem, line-height 1.35): Header wordmark ("Acme Support").
- **Body** (400, 1.02rem, line-height 1.65): Message text, composer input, chip labels. Max comfortable line length in bubbles is natural width; empty-state subcopy caps near 20rem centered.
- **Caption** (500, 0.72rem): Timestamps beside bubbles.
- **Label** (500, 0.7rem, letter-spacing 0.18em, uppercase): Day separators, quick-reply section marker. Keep to four words or fewer.

### Named Rules

**The One Voice Rule.** Albert Sans carries the entire chat. Do not load display or serif faces into the chat shell; this product surface is not the Impeccable marketing site.

**Short Labels Only Rule.** Uppercase tracked mono is for "Suggestions", date chips, and similar markers. Never sentence-length copy in tracked caps.

## 4. Elevation

Flat-by-default product chrome. Depth comes from surface stepping (lacquer black → raised lacquer → graphite), 1px hairlines, and a single restrained shadow on floating elements.

### Shadow Vocabulary

- **Bubble** (`0 1px 2px rgba(0, 0, 0, 0.08)`): User and agent message bubbles.
- **Actions** (`0 2px 8px rgba(0, 0, 0, 0.24)`): Message action toolbar on hover.
- **Send active** (`0 2px 8px oklch(84% 0.19 80.46 / 0.24)`): Send button when message is ready.
- **Focus ring** (`0 0 0 2px oklch(84% 0.19 80.46 / 0.12)`): Composer when focused; global `:focus-visible` uses 2px kinpaku gold outline.

### Named Rules

**The Hairline First Rule.** Separate header, bubbles, and chips with `gold-hairline` before reaching for shadow.

**The Flat Chrome Rule.** Header, composer shell, and chips do not get card-style elevation. Only bubbles and ephemeral toolbars lift slightly.

## 5. Components

### Chat Header

- **Height:** 64px on raised lacquer; bottom border `gold-hairline`.
- **Avatar:** 36px square, 6px radius, kinpaku gold fill, lacquer-deep "A" mark. Patina dot (10px) with `pulseOnline` animation and raised-lacquer ring.
- **Status:** Patina dot + "Online" label in patina; subtitle in text-muted.
- **Actions:** Ghost icon buttons 44×44px; hover lifts to graphite background, champagne icon.

### Message Bubbles

- **User:** Kinpaku gold fill, lacquer-deep text, strong gold hairline border, 8px radius with 2px tail on bottom-right of last in group. Padding 14×16px, min-height 44px.
- **Agent:** Raised lacquer fill, text-warm copy, default hairline border, 8px radius with 2px tail bottom-left on last in group. Streaming cursor: 2px kinpaku gold pulse bar.
- **Error:** Vermilion text; background/border use vermilion at low opacity (prefer token, not generic `red-500`).
- **Timestamp:** Caption size, text-faint, below last bubble in group.
- **Group gap:** 4px between consecutive bubbles same sender; 24px between groups.

### Composer (Chat Input)

- **Shell:** Lacquer-deep, 8px radius, min-height 52px, hairline border (strong when focused).
- **Textarea:** Transparent, champagne text, text-faint placeholder, grows to 120px max.
- **Send:** 44×44px, 8px radius. Active: kinpaku gold + shadow; disabled: graphite + mute-deep icon at 50% opacity. Hover active: kinpaku pale, scale 1.04.

### Quick Replies and Empty-State Suggestions

- **Quick reply chips:** Graphite-2 background, champagne text, 4px radius, 12×20px padding, min-height 44px. Hover: graphite fill, strong hairline, kinpaku gold text. Horizontal scroll row with hidden scrollbar.
- **Empty-state pills:** Same hover logic; 20px pill radius, slightly smaller type (0.85rem). Centered grid under welcome copy.
- **Section label:** Mono uppercase "Suggestions" in text-faint above quick replies only (one marker, not per-chip eyebrows).

### Error Banner

- Full-width strip: vermilion at 8% background, 15% bottom border. Icon in 20px circle (12% vermilion fill). Copy 0.85rem vermilion. Auto-dismiss 5s. Dismiss button 24px.

### Day Separator

- Horizontal hairline flanking mono uppercase date label (text-faint, 0.7rem, tracking 0.18em). 16px vertical padding.

### Message Actions (hover toolbar)

- Graphite pill, hairline border, actions shadow. 32×32px icon buttons; copy success icon flips to patina.

### Typing Indicator

- 32px gold avatar, agent label in text-muted, raised-lacquer bubble with three 5px dots using `typingBounce` stagger.

### Navigation

Not applicable; single-screen chat. Header actions cover search, new chat, overflow.

## 6. Do's and Don'ts

### Do

- **Do** use CSS variables from `client/src/index.css` for every color (`var(--color-lacquer-black)`, etc.).
- **Do** keep touch targets at or above 44px on chips, bubbles (min-height), and primary actions.
- **Do** use kinpaku gold for the user's messages and send CTA only; keep agent side on lacquer surfaces.
- **Do** use verdigris patina for online status and positive feedback (copied state).
- **Do** animate with ease-out (0.2–0.25s): `messageSlideIn`, `quickReplyIn`, `fadeIn`. Respect `prefers-reduced-motion` when adding new motion.
- **Do** write copy in a precise, premium, understated voice (answer first, no filler intros).

### Don't

- **Don't** use generic SaaS support widget tropes: Intercom-style purple accents, cream floating bubbles, stock illustration-heavy empty states, or "Hi there! How can I help?" opener tone.
- **Don't** hardcode legacy hex backgrounds (`#0B1020`) or purple `theme-color` (`#635BFF`) when lacquer tokens exist.
- **Don't** load Inter or other unused font families in `index.html`; Albert Sans is the chat face.
- **Don't** add gradient text, glassmorphism, nested cards, or decorative hero metrics in the chat shell.
- **Don't** put uppercase tracked eyebrows on every section; one "Suggestions" marker is enough.
- **Don't** use side-stripe borders, wide pill-shaped agent bubbles, or bounce/elastic easing on UI transitions.
- **Don't** let gold wallpaper the UI; if both sides of the thread read gold, hierarchy is broken.
