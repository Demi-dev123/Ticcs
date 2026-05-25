---
version: 1.0
name: Ticss-design-system
description: "A clean, precise pass generation platform with full light and dark mode support. Dark surfaces are built on #1B1B1B and its black variations. Light surfaces are built on #FFFFFE and its white/off-white variations. Electric purple (#6C47FF) is reserved strictly for actions — primary buttons, focus rings, active indicators, and links. No gradients anywhere. No colored shadows. No purple on surfaces or component backgrounds. Soft grey borders and subtle surface lifts carry all hierarchy."

colors:
  # Brand — actions only, never surfaces
  brand: "#6C47FF"
  brand-hover: "#5B39E0"
  brand-foreground: "#FFFFFF"

  # Dark mode surfaces
  dark-base: "#1B1B1B"
  dark-surface-1: "#222222"
  dark-surface-2: "#2A2A2A"
  dark-surface-3: "#313131"
  dark-border: "#333333"
  dark-border-soft: "#2A2A2A"

  # Dark mode text
  dark-ink: "#F2F2F2"
  dark-ink-muted: "#888888"
  dark-ink-subtle: "#555555"

  # Light mode surfaces
  light-base: "#FFFFFE"
  light-surface-1: "#F7F7F7"
  light-surface-2: "#F0F0F0"
  light-surface-3: "#E8E8E8"
  light-border: "#E2E2E2"
  light-border-soft: "#EBEBEB"

  # Light mode text
  light-ink: "#111111"
  light-ink-muted: "#777777"
  light-ink-subtle: "#AAAAAA"

  # Semantic — state colors only, never brand
  success: "#16A34A"
  success-subtle-dark: "rgba(22, 163, 74, 0.10)"
  success-subtle-light: "rgba(22, 163, 74, 0.08)"

  warning: "#D97706"
  warning-subtle-dark: "rgba(217, 119, 6, 0.10)"
  warning-subtle-light: "rgba(217, 119, 6, 0.08)"

  error: "#DC2626"
  error-subtle-dark: "rgba(220, 38, 38, 0.10)"
  error-subtle-light: "rgba(220, 38, 38, 0.08)"

typography:
  display-xxl:
    fontFamily: Geist
    fontSize: 96px
    fontWeight: 600
    lineHeight: 0.90
    letterSpacing: -4.8px
  display-xl:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: -3.6px
  display-lg:
    fontFamily: Geist
    fontSize: 52px
    fontWeight: 600
    lineHeight: 1.00
    letterSpacing: -2.6px
  display-md:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.10
    letterSpacing: -1.0px
  headline:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.5px
  subhead:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: -0.2px
  body-lg:
    fontFamily: Geist
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.17px
  body:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.15px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: -0.13px
  caption:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: -0.12px
  mono:
    fontFamily: Geist Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0px
  button:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: -0.14px
  label:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0.4px
    textTransform: uppercase

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 20px
  xxxl: 28px
  pill: 100px
  full: 9999px

spacing:
  hair: 1px
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  xxxl: 64px
  section: 96px
---

## Overview

Ticss uses a disciplined two-mode design system built on neutral black and white surface families. Purple (#6C47FF) appears exactly once per interaction — as the action color. It never appears on a surface, card background, badge fill, or shadow. Hierarchy is built entirely through surface lifts, grey borders, and type weight. The system is clean, professional, and fast to build.

---

## The Core Rule

> **Purple is for actions. Everything else is grey.**

That means purple is allowed on:
- Primary buttons (background)
- Focus rings (1px border + subtle shadow — neutral shadow only)
- Active nav indicators (left border bar)
- Links
- Checkboxes and radio buttons when selected

Purple is NOT allowed on:
- Card backgrounds
- Badge backgrounds
- Surface backgrounds
- Shadows (shadows are always neutral black/grey)
- Section backgrounds
- Hover states of surfaces (use a grey lift instead)

---

## Color System

### Dark Mode

| Token | Value | Use |
|---|---|---|
| `dark-base` | #1B1B1B | Page background — all pages |
| `dark-surface-1` | #222222 | Cards, sidebar, form inputs, secondary buttons |
| `dark-surface-2` | #2A2A2A | Hovered cards, selected states, nested panels |
| `dark-surface-3` | #313131 | Deepest nested elements, tooltips |
| `dark-border` | #333333 | Card borders, input borders, dividers |
| `dark-border-soft` | #2A2A2A | Table row dividers, soft section separators |
| `dark-ink` | #F2F2F2 | All primary text |
| `dark-ink-muted` | #888888 | Secondary text, timestamps, placeholders |
| `dark-ink-subtle` | #555555 | Disabled text, very muted labels |

### Light Mode

| Token | Value | Use |
|---|---|---|
| `light-base` | #FFFFFE | Page background — all pages |
| `light-surface-1` | #F7F7F7 | Cards, sidebar, form inputs, secondary buttons |
| `light-surface-2` | #F0F0F0 | Hovered cards, selected states, nested panels |
| `light-surface-3` | #E8E8E8 | Deepest nested elements, tooltips |
| `light-border` | #E2E2E2 | Card borders, input borders, dividers |
| `light-border-soft` | #EBEBEB | Table row dividers, soft section separators |
| `light-ink` | #111111 | All primary text |
| `light-ink-muted` | #777777 | Secondary text, timestamps, placeholders |
| `light-ink-subtle` | #AAAAAA | Disabled text, very muted labels |

### Brand (Actions Only)

| Token | Value | Use |
|---|---|---|
| `brand` | #6C47FF | Primary button background, active indicators, focus rings, links |
| `brand-hover` | #5B39E0 | Hover state of primary buttons only |
| `brand-foreground` | #FFFFFF | Text on top of brand buttons |

### Semantic (State Colors Only)

| Token | Value | Use |
|---|---|---|
| `success` | #16A34A | Valid QR scan text/icon, "Used" badge text |
| `warning` | #D97706 | Already-scanned state text/icon |
| `error` | #DC2626 | Invalid QR state text/icon, destructive action text |
| `*-subtle-dark` | 10% opacity | Badge backgrounds in dark mode (neutral tint) |
| `*-subtle-light` | 8% opacity | Badge backgrounds in light mode (neutral tint) |

---

## Tailwind CSS Configuration

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: '#6C47FF',
        'brand-hover': '#5B39E0',

        // Dark mode
        'dark-base': '#1B1B1B',
        'dark-s1': '#222222',
        'dark-s2': '#2A2A2A',
        'dark-s3': '#313131',
        'dark-border': '#333333',
        'dark-border-soft': '#2A2A2A',
        'dark-ink': '#F2F2F2',
        'dark-ink-muted': '#888888',
        'dark-ink-subtle': '#555555',

        // Light mode
        'light-base': '#FFFFFE',
        'light-s1': '#F7F7F7',
        'light-s2': '#F0F0F0',
        'light-s3': '#E8E8E8',
        'light-border': '#E2E2E2',
        'light-border-soft': '#EBEBEB',
        'light-ink': '#111111',
        'light-ink-muted': '#777777',
        'light-ink-subtle': '#AAAAAA',
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
        pill: '100px',
      },
      boxShadow: {
        // Neutral shadows only — no colored shadows ever
        'card-dark': '0 1px 4px rgba(0,0,0,0.4)',
        'card-light': '0 1px 4px rgba(0,0,0,0.06)',
        'pass-dark': '0 4px 20px rgba(0,0,0,0.6)',
        'pass-light': '0 4px 20px rgba(0,0,0,0.10)',
        'modal-dark': '0 8px 32px rgba(0,0,0,0.7)',
        'modal-light': '0 8px 32px rgba(0,0,0,0.12)',
        // Focus — neutral shadow, brand border only
        'focus': '0 0 0 3px rgba(108, 71, 255, 0.15)',
      },
    },
  },
} satisfies Config
```

---

## CSS Variables (globals.css)

```css
:root {
  /* Light mode defaults */
  --base: #FFFFFE;
  --surface-1: #F7F7F7;
  --surface-2: #F0F0F0;
  --surface-3: #E8E8E8;
  --border: #E2E2E2;
  --border-soft: #EBEBEB;
  --ink: #111111;
  --ink-muted: #777777;
  --ink-subtle: #AAAAAA;
  --shadow-card: 0 1px 4px rgba(0,0,0,0.06);
  --shadow-pass: 0 4px 20px rgba(0,0,0,0.10);
  --shadow-modal: 0 8px 32px rgba(0,0,0,0.12);
}

.dark {
  --base: #1B1B1B;
  --surface-1: #222222;
  --surface-2: #2A2A2A;
  --surface-3: #313131;
  --border: #333333;
  --border-soft: #2A2A2A;
  --ink: #F2F2F2;
  --ink-muted: #888888;
  --ink-subtle: #555555;
  --shadow-card: 0 1px 4px rgba(0,0,0,0.4);
  --shadow-pass: 0 4px 20px rgba(0,0,0,0.6);
  --shadow-modal: 0 8px 32px rgba(0,0,0,0.7);
}

/* Brand never changes between modes */
:root, .dark {
  --brand: #6C47FF;
  --brand-hover: #5B39E0;
  --brand-fg: #FFFFFF;
  --success: #16A34A;
  --warning: #D97706;
  --error: #DC2626;
  --font-sans: var(--font-geist), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), monospace;
}
```

---

## Typography

### Font Setup (Next.js)

```ts
import { Geist, Geist_Mono } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})
```

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `display-xxl` | 96px | 600 | 0.90 | -4.8px | Landing hero headline |
| `display-xl` | 72px | 600 | 0.95 | -3.6px | Section opener headlines |
| `display-lg` | 52px | 600 | 1.00 | -2.6px | Verification result text |
| `display-md` | 32px | 600 | 1.10 | -1.0px | Page titles, event name on pass |
| `headline` | 22px | 600 | 1.20 | -0.5px | Card titles, section headers |
| `subhead` | 18px | 400 | 1.40 | -0.2px | Lead body text |
| `body-lg` | 17px | 400 | 1.50 | -0.17px | Hero subheads |
| `body` | 15px | 400 | 1.50 | -0.15px | Default body, table rows |
| `body-sm` | 13px | 400 | 1.40 | -0.13px | Sidebar labels, metadata |
| `caption` | 12px | 500 | 1.20 | -0.12px | Eyebrows, timestamps, footer |
| `mono` | 13px | 400 | 1.40 | 0px | Pass IDs, QR tokens |
| `button` | 14px | 500 | 1.0 | -0.14px | All button labels |
| `label` | 11px | 600 | 1.0 | +0.4px | Uppercase badges, status labels |

### Principles
- Negative tracking scales with size — aggressive at display, minimal at body
- Geist Mono only for credential-like data (pass IDs, tokens)
- Weight stays narrow — 600 for display, 400 for body, 500 for meta
- No italic use in the UI

---

## Components

### Buttons

**Primary**
```
Background:    var(--brand)          → #6C47FF
Text:          var(--brand-fg)       → #FFFFFF
Border:        none
Radius:        pill (100px)
Padding:       10px 20px
Hover:         background → var(--brand-hover) #5B39E0
Active:        scale(0.97)
Focus:         1px solid var(--brand) + box-shadow: var(--shadow-focus)
```

**Secondary**
```
Background:    var(--surface-1)
Text:          var(--ink)
Border:        1px solid var(--border)
Radius:        pill (100px)
Padding:       10px 20px
Hover:         background → var(--surface-2)
```

**Ghost**
```
Background:    transparent
Text:          var(--ink-muted)
Border:        none
Radius:        pill (100px)
Padding:       10px 20px
Hover:         background → var(--surface-1)
```

**Destructive**
```
Background:    var(--surface-1)
Text:          var(--error)
Border:        1px solid var(--border)
Radius:        pill (100px)
Padding:       10px 20px
Hover:         background → var(--surface-2)
```

**Icon Circular**
```
Background:    var(--surface-1)
Border:        1px solid var(--border)
Radius:        full (9999px)
Size:          40px
Hover:         background → var(--surface-2)
```

---

### Form Inputs

**Default**
```
Background:    var(--surface-1)
Text:          var(--ink)
Placeholder:   var(--ink-subtle)
Border:        1px solid var(--border)
Radius:        lg (12px)
Padding:       10px 14px
```

**Focused**
```
Border:        1px solid var(--brand)
Box-shadow:    0 0 0 3px rgba(108, 71, 255, 0.15)
              ← only place a brand-adjacent shadow is allowed
              ← shadow is near-transparent, not a bold color
```

**Error**
```
Border:        1px solid var(--error)
Box-shadow:    none
```

---

### Cards

**Event Card**
```
Background:    var(--surface-1)
Border:        1px solid var(--border)
Radius:        xl (16px)
Padding:       20px
Shadow:        var(--shadow-card)
Hover:         background → var(--surface-2), border → var(--border) slightly darker
              ← NO purple border on hover, NO colored shadow
```

**Pass Card (rendered pass)**
```
Background:    determined by template (see pass templates below)
Border:        1px solid var(--border)
Radius:        3xl (28px)
Padding:       24px
Shadow:        var(--shadow-pass)
              ← neutral shadow only, no color
```

**Template Card (in designer)**
```
Background:    var(--surface-1)
Border:        1px solid var(--border)
Radius:        xl (16px)
Padding:       12px
Hover:         border → var(--border) darkened
Selected:      border → var(--brand), no background change
              ← brand border ONLY on selected, not on hover
```

**Stat Card (dashboard)**
```
Background:    var(--surface-1)
Border:        1px solid var(--border)
Radius:        xl (16px)
Padding:       20px
Shadow:        none
```

---

### Status Badges

All badges: pill shape, soft background tint, matching text color. No purple.

**Pending / Unused**
```
Background:    var(--surface-2)
Text:          var(--ink-muted)
Border:        1px solid var(--border)
```

**Ready (passes generated)**
```
Background:    var(--surface-2)
Text:          var(--ink)
Border:        1px solid var(--border)
```

**Used / Scanned**
```
Dark mode:     background rgba(22,163,74,0.10), text #16A34A
Light mode:    background rgba(22,163,74,0.08), text #16A34A
Border:        none
```

**Already Scanned Warning**
```
Dark mode:     background rgba(217,119,6,0.10), text #D97706
Light mode:    background rgba(217,119,6,0.08), text #D97706
```

**Invalid**
```
Dark mode:     background rgba(220,38,38,0.10), text #DC2626
Light mode:    background rgba(220,38,38,0.08), text #DC2626
```

---

### Navigation

**Top Navbar**
```
Dark:          background #1B1B1B, border-bottom 1px solid #2A2A2A
Light:         background #FFFFFE, border-bottom 1px solid #EBEBEB
Height:        56px
Backdrop:      blur(12px) with 90% opacity on scroll
Logo:          ink color, Geist 600
Nav links:     ink-muted, hover → ink
Active link:   ink, no underline — active indicated by context only
Right:         avatar icon + "Create Event" primary button
```

**Sidebar**
```
Dark:          background #222222, border-right 1px solid #333333
Light:         background #F7F7F7, border-right 1px solid #E2E2E2
Width:         260px
Nav item:      ink-muted text, body-sm
Nav item hover: background var(--surface-2), ink text
Nav item active: background var(--surface-2), ink text,
                 LEFT border 2px solid var(--brand)
                 ← brand used ONLY as the 2px left indicator bar
```

**Designer Panel (left)**
```
Dark:          background #222222, border-right 1px solid #333333
Light:         background #F7F7F7, border-right 1px solid #E2E2E2
Width:         300px
Section divider: 1px solid var(--border-soft)
Labels:        ink-muted, caption size
```

---

### Attendee Table

```
Header row:
  Background:  var(--surface-1)
  Text:        var(--ink-muted)
  Typography:  caption, uppercase, label style
  Border-bottom: 1px solid var(--border)

Data row:
  Background:  var(--base)
  Text:        var(--ink)
  Border-bottom: 1px solid var(--border-soft)
  Hover:       background var(--surface-1)
              ← no colored hover, neutral grey lift only

Action links in row:
  Color:       var(--ink-muted)
  Hover:       var(--ink)
  Delete:      var(--error) on hover only
```

---

### QR Verification Screens

Full-screen overlays. Color fills are justified here as they are full-screen state indicators, not surface decoration.

**Valid ✅**
```
Background:    #16A34A (success green — full screen)
Text:          #FFFFFF
Headline:      display-lg, "Valid"
Sub:           attendee name + ticket type
Icon:          ✅ large
Auto-dismiss:  2 seconds
```

**Already Used ⚠️**
```
Background:    #D97706 (warning amber — full screen)
Text:          #FFFFFF
Headline:      display-lg, "Already Scanned"
Sub:           "Scanned at [time]"
Auto-dismiss:  2 seconds
```

**Invalid ❌**
```
Background:    #DC2626 (error red — full screen)
Text:          #FFFFFF
Headline:      display-lg, "Invalid Pass"
Auto-dismiss:  2 seconds
```

Note: These are the ONLY places full-color backgrounds appear outside of primary buttons. Justified by their functional necessity as instant visual signals.

---

## Pass Templates — Visual Specs

Templates use only black, white, and grey. No purple inside pass designs.

### Template 1 — Minimal
```
Light pass (works in both modes):
Background:    #FFFFFF
Text primary:  #111111
Text muted:    #777777
Border:        1px solid #E2E2E2
Ticket badge:  #F0F0F0 background, #555555 text
QR block:      Black QR code on white
Radius:        20px
Shadow:        0 4px 20px rgba(0,0,0,0.10)
Layout:        Left-aligned, generous whitespace
```

### Template 2 — Modern
```
Dark pass:
Background:    #1B1B1B
Text primary:  #F2F2F2
Text muted:    #888888
Border:        1px solid #333333
Left accent strip: 3px solid #333333 (grey, not purple)
Ticket badge:  #2A2A2A background, #888888 text
QR block:      White QR on dark background
Radius:        20px
Shadow:        0 4px 20px rgba(0,0,0,0.5)
Layout:        Left-aligned, bold event name
```

### Template 3 — Clean
```
Light pass with structured sections:
Background:    #F7F7F7
Text primary:  #111111
Text muted:    #777777
Section divider: 1px solid #E2E2E2
Ticket badge:  #E8E8E8 background, #555555 text
QR block:      Dark QR on light grey panel (#EEEEEE)
Radius:        20px
Shadow:        0 4px 20px rgba(0,0,0,0.08)
Layout:        Centered, structured sections
```

### Template 4 — Elegant
```
Dark pass, refined spacing:
Background:    #111111
Text primary:  #EEEEEE
Text muted:    #777777
Border:        1px solid #2A2A2A
Divider:       1px solid #222222
Ticket badge:  #1B1B1B background, #888888 text
QR block:      White QR, subtle grey border
Radius:        24px
Shadow:        0 4px 20px rgba(0,0,0,0.6)
Layout:        Centered, wide spacing, refined
```

### Pass Information Layout (All Templates)
```
┌──────────────────────────────────┐
│  [Banner Image — full width]     │  ← optional, 120px height, grey placeholder
├──────────────────────────────────┤
│                                  │
│  EVENT NAME                      │  ← display-md, 600 weight
│  Date · Time                     │  ← body, ink-muted
│  Venue                           │  ← body-sm, ink-muted
│                                  │
├──────────────────────────────────┤
│                                  │
│  ATTENDEE NAME                   │  ← headline, 600 weight
│  [General Admission]             │  ← label style badge, grey
│                                  │
├──────────────────────────────────┤
│                                  │
│  [QR CODE]           #TCS-0042  │  ← QR left, pass ID right in mono
│  Organized by: Name              │  ← caption, ink-muted
│                                  │
└──────────────────────────────────┘
```

---

## Elevation & Depth

Depth is expressed through surface lifts and neutral shadows only. No colored shadows anywhere.

| Level | Dark Mode | Light Mode | Use |
|---|---|---|---|
| 0 — Flat | #1B1B1B, no shadow | #FFFFFE, no shadow | Page background, table rows |
| 1 — Raised | #222222 + 1px border #333333 | #F7F7F7 + 1px border #E2E2E2 | Cards, inputs, sidebar |
| 2 — Floating | #222222 + shadow-card | #F7F7F7 + shadow-card | Modals, dropdowns, popovers |
| 3 — Pass | template bg + shadow-pass | template bg + shadow-pass | Pass card in designer + public page |

---

## Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `xs` | 4px | Chips, small tags |
| `sm` | 6px | Inline badges |
| `md` | 8px | Form inputs, small elements |
| `lg` | 12px | Dropdown items, small cards |
| `xl` | 16px | Event cards, template cards, stat cards |
| `2xl` | 20px | Larger panels, pass cards (smaller templates) |
| `3xl` | 28px | Pass card (hero element) |
| `pill` | 100px | All buttons, status badges |
| `full` | 9999px | Avatar circles, icon buttons |

---

## Motion & Animation

### Principles
- Fast and functional — no decorative animation
- State changes should feel immediate, not dramatic
- No bounce or spring on form elements — linear or ease-out only

### Durations
| Context | Duration | Easing |
|---|---|---|
| Hover state (button, card) | 100ms | ease-out |
| Focus ring appearance | 120ms | ease-out |
| Surface lift (card hover) | 120ms | ease-out |
| Panel open (sidebar, sheet) | 200ms | ease-out |
| Modal appear | 180ms | ease-out |
| Pass preview update | < 300ms | instant re-render |
| Verification overlay | 160ms fade-in | ease-out |
| Verification auto-dismiss | 2000ms hold → 200ms fade | ease-in |
| Button active press | scale(0.97), 80ms | ease-out |

### Key Behaviors
- Card hover: background lifts one surface level (no border change, no shadow color change)
- Template selected: brand border appears (1px → brand), 100ms
- Input focus: border color transitions to brand, focus ring fades in, 120ms
- Pass preview: re-renders in place, no animation — feels like a live canvas
- Verification screens: hard cut-in (no slide), auto-dismiss after 2s with fade

---

## Page-by-Page Design Intent

### Landing Page
- Dark base by default, mode toggle in navbar
- Massive display-xxl headline, ink color, no color accents in headline
- Single primary button CTA — brand purple
- Template showcase: 4 pass cards on `surface-1` cards, no gradient backgrounds
- Features: 3-column icon grid, icons in ink-muted, text in ink
- Footer: ink-muted text, border-top separator, no decoration

### Auth Pages (Login / Signup)
- Centered card, max-width 440px
- Surface-1 card on base background
- Inputs with brand focus ring
- Full-width primary button
- Secondary action as ghost text link in ink-muted

### Dashboard
- Sticky navbar on base color
- Stats row: 3 stat cards (surface-1)
- Event grid: 2-column, event cards (surface-1), neutral hover
- "Create Event" primary button in top-right
- Empty state: centered, ink-muted text, primary CTA button

### Pass Designer
- Left panel (300px): surface-1, section labels in ink-muted
- Right panel: base background, 48px padding, pass card centered
- Template grid: 2×2 of template-card components, brand border on selected only
- Color picker: neutral swatch grid + hex input, no purple pre-selected as default
- Pass preview: neutral shadow, no color decoration around it

### Attendee Management
- Full-width table on base
- Header: surface-1 row
- Rows: base background with soft border dividers
- Status badges: semantic tint backgrounds only
- Action column: ghost text links
- Sticky bottom bar: surface-1 background, border-top, primary button

### QR Verification
- Full-screen camera, dark overlay
- Scanning frame: white/grey corner marks only — no purple scanner frame
- Result: full-screen semantic color overlay (green/amber/red)

### Public Pass Page (/pass/[id])
- Base background, no navbar
- Centered pass card, max-width 420px
- Ticss wordmark in ink-muted at top
- "Download Pass" primary button below card
- WhatsApp share link in ink-muted below that

---

## Do's and Don'ts

### Do
- Use `var(--brand)` only for primary buttons, focus rings, active nav indicators, links
- Build all hierarchy through surface lifts — base → surface-1 → surface-2
- Use soft grey borders (1px, soft color) on every card and input
- Keep shadows neutral — rgba(0,0,0,x) only
- Use semantic colors (green/amber/red) for status states, never for brand moments
- Scale letter-spacing with font size — aggressive at display, minimal at body
- Use Geist Mono for pass IDs and any credential-like data
- Keep template cards and pass cards the most visually prominent elements on their pages
- Support both light and dark mode with CSS variables — test both before shipping

### Don't
- Don't use purple on any surface, card, badge background, or shadow
- Don't use colored shadows — ever
- Don't use gradients — anywhere in the UI or on pass templates
- Don't introduce a second accent color alongside purple
- Don't use purple on hover states of cards or rows — use grey surface lifts
- Don't square off CTA buttons — pill shape only
- Don't mix in any other font family — Geist and Geist Mono only
- Don't use ink-muted for primary content — it is secondary/metadata only
- Don't animate the pass preview with a transition — it should update instantly like a live canvas
- Don't use full-opacity semantic color fills outside of the QR verification screens

---

*This styles.md is written for Ticss — the dark and light mode event pass generation platform. All color, type, and component decisions are optimized for pasting directly into Lovable, Bolt.new, or Cursor.*

*Platform: Ticss | Fonts: Geist + Geist Mono | Accent: #6C47FF (actions only) | Dark base: #1B1B1B | Light base: #FFFFFE*
