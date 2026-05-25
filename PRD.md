# Ticss — Product Requirements Document

> **Version:** 1.0  
> **Status:** MVP  
> **Last Updated:** May 2026  
> **Optimized for:** AI-assisted vibecoding (Lovable, Bolt.new, Cursor, Claude Code)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals](#3-goals)
4. [Target Users & Personas](#4-target-users--personas)
5. [What This Product Is NOT](#5-what-this-product-is-not)
6. [Core User Flows](#6-core-user-flows)
7. [Feature Breakdown](#7-feature-breakdown)
8. [Database Schema](#8-database-schema)
9. [API Endpoint Structure](#9-api-endpoint-structure)
10. [Tech Stack](#10-tech-stack)
11. [UI/UX Direction](#11-uiux-direction)
12. [Responsiveness](#12-responsiveness)
13. [Edge Cases](#13-edge-cases)
14. [MVP Scope & Priorities](#14-mvp-scope--priorities)
15. [Acceptance Criteria](#15-acceptance-criteria)
16. [Project File Structure](#16-project-file-structure)
17. [Supabase Setup & APIs](#17-supabase-setup--apis)
18. [Future Improvements](#18-future-improvements)

---

## 1. Product Overview

**Ticss** is a lightweight, modern web application that enables event organizers to generate beautiful, branded, QR-based digital event passes for their attendees — within minutes — without needing any design or technical skills.

Think of it as:

> **"Canva for event passes + QR verification."**

The organizer already knows who their attendees are. Ticss enters the workflow **after** attendee collection. Its sole job is to turn a list of names into professional, personalized, downloadable event passes — fast.

---

## 2. Problem Statement

Event organizers — from wedding planners to tech meetup hosts — struggle with creating professional-looking passes for their attendees. Current options are either:

- **Too complex** (Eventbrite, Hopin — full ticketing platforms)
- **Too generic** (Canva — not built for pass generation workflows)
- **Too technical** (custom design tools)

Ticss solves this by offering a focused, guided, beautiful pass creation experience with zero learning curve.

---

## 3. Goals

### Primary Goal
Enable an organizer to go from zero to a full set of downloadable, branded, QR-verified event passes in under 5 minutes.

### Secondary Goals
- Make pass customization feel delightful and visual
- Support both small (10 attendees) and medium (500+ attendees) events
- Work beautifully on mobile
- Be fast, reliable, and frictionless

---

## 4. Target Users & Personas

### Persona 1 — Temi (Tech Meetup Organizer)
- Organizes monthly Lagos tech meetups, 50–150 people
- Uses Google Forms to collect RSVPs, gets a CSV export
- Wants branded passes that look professional
- Sends passes via WhatsApp and email manually
- Not technical — needs a no-code solution

### Persona 2 — Chidi (Corporate Event Planner)
- Plans conferences and workshops, 100–500 attendees
- Has an Excel/CSV list ready before the event
- Needs VIP vs General passes clearly distinguished
- Wants bulk download for printing or digital distribution

### Persona 3 — Ada (Wedding Planner)
- Plans private weddings and social gatherings
- Has a curated guest list of 80–200 people
- Wants elegant, customizable pass designs
- Shares passes via WhatsApp individually or prints them

---

## 5. What This Product Is NOT

To keep scope tight and MVP delivery realistic, Ticss explicitly does NOT include:

| Out of Scope | Reason |
|---|---|
| Ticket sales / payments | Not in brief |
| Attendee self-registration | Not in brief |
| Public event discovery pages | Not in brief |
| Email delivery infrastructure | Too complex for MVP |
| Event marketing tools | Out of scope |
| Advanced analytics dashboards | Low priority |
| Apple/Google Wallet integration | Future feature |

---

## 6. Core User Flows

### Flow 1 — Authentication Flow

```
User visits ticss.app
        ↓
Sees landing page with hero, features, CTA
        ↓
Clicks "Get Started" or "Login"
        ↓
        ├── New User → Sign Up page
        │     ↓
        │   Fills: name, email, password
        │     ↓
        │   Account created → redirected to Dashboard
        │
        └── Returning User → Login page
              ↓
            Fills: email, password
              ↓
            Authenticated → redirected to Dashboard
```

---

### Flow 2 — Event Creation Flow

```
Organizer on Dashboard
        ↓
Clicks "Create Event"
        ↓
Event Creation Form:
  - Event name (required)
  - Event date (required)
  - Event time (required)
  - Venue / location (required)
  - Organizer name/details (required)
  - Brand color (color picker, required)
  - Banner image (file upload, optional)
        ↓
Clicks "Continue to Design"
        ↓
→ Enters Template Selection & Pass Designer
```

---

### Flow 3 — Template Selection & Pass Customization Flow

```
Organizer enters Pass Designer
        ↓
LEFT PANEL — Customization Controls:
  - Template selector (grid of 4 templates)
  - Brand color (already filled, editable)
  - Font style selector
  - Banner image upload/change
  - Toggle event info visibility
        ↓
RIGHT PANEL — Live Pass Preview:
  - Updates instantly as organizer changes anything
  - Shows representative pass with placeholder attendee name
  - Shows how QR code will appear
        ↓
Organizer is happy with design
        ↓
Clicks "Save Design & Add Attendees"
        ↓
→ Enters Attendee Management
```

---

### Flow 4 — Attendee Upload Flow

```
Organizer on Attendee Management page
        ↓
Two options presented:

OPTION A — Add Manually
  Fill form:
    - Attendee name (required)
    - Email (optional)
    - Ticket type (dropdown: General / VIP / Speaker / Staff)
  Click "Add Attendee"
  Attendee appears in table instantly
        ↓

OPTION B — Bulk CSV Upload
  Download CSV template
  Fill in attendee data:
    name, email (optional), ticketType
  Upload CSV file
  App parses and validates CSV (papaparse)
  Shows preview of parsed rows
  Confirms import
  All attendees appear in table instantly
        ↓

Attendee Table shows:
  Name | Ticket Type | Email | Status | Actions
  (Status = "Pass Pending" at this stage)
        ↓
Clicks "Generate All Passes"
        ↓
→ Pass Generation
```

---

### Flow 5 — Pass Generation Flow

```
Organizer clicks "Generate All Passes"
        ↓
App loops through all attendees:
  For each attendee:
    - Creates unique pass ID (e.g. TCS-8F3K29A)
    - Generates unique QR token (UUID)
    - Stores pass record in database
    - Sets pass status = "unused"
        ↓
Attendee table updates:
  Status changes from "Pending" → "Ready"
        ↓
Actions per row now show:
  [Preview] [Download PNG] [Download PDF] [Copy Link]
        ↓
Top of page shows:
  [Download All as ZIP] [Copy All Links]
```

---

### Flow 6 — Download & Share Flow

```
INDIVIDUAL DOWNLOAD:
  Organizer clicks "Download PNG" or "Download PDF"
        ↓
  App renders pass using html2canvas
  Exports as PNG or jsPDF as PDF
  File downloads as: JohnDoe_TCS-8F3K29A.png
        ↓

BULK DOWNLOAD:
  Organizer clicks "Download All as ZIP"
        ↓
  App generates all passes
  Bundles into ZIP file
  Downloads as: ticss-[EventName]-passes.zip
        ↓

SHARE LINK:
  Organizer clicks "Copy Link" for an attendee
        ↓
  App copies unique URL to clipboard:
  https://ticss.app/pass/8F3K29A
        ↓
  Organizer pastes link anywhere:
  WhatsApp, Telegram, Email, Discord
        ↓
  Attendee opens link → sees their digital pass
  Can view QR code on screen
  Can download from the link page
        ↓

WHATSAPP SHARE:
  Organizer clicks WhatsApp icon
        ↓
  Opens: https://wa.me/?text=Your pass for [Event]: [link]
        ↓

EXPORT ALL LINKS:
  Organizer clicks "Export Share Links CSV"
        ↓
  Downloads CSV:
    Name | Share Link
    John Doe | ticss.app/pass/abc
    Ada | ticss.app/pass/xyz
  Organizer can paste links into bulk messaging tools
```

---

### Flow 7 — QR Verification Flow

```
Event day — organizer opens Ticss on phone
        ↓
Goes to: Dashboard → [Event] → "Verify Passes"
        ↓
QR Scanner opens (uses device camera)
        ↓
Scans attendee's QR code
        ↓
App reads QR token
Checks database:

  ├── Token found + status = "unused"
  │     → Shows: ✅ VALID
  │     → Attendee name + ticket type shown
  │     → Status updated to "used"
  │     → Green full-screen confirmation
  │
  ├── Token found + status = "used"
  │     → Shows: ⚠️ ALREADY SCANNED
  │     → Shows when it was first scanned
  │     → Red/amber warning screen
  │
  └── Token not found in database
        → Shows: ❌ INVALID PASS
        → Red full-screen rejection
        ↓
Scanner resets automatically after 2 seconds
Ready to scan next attendee
```

---

### Flow 8 — Pass Editing / Regeneration Flow

```
Organizer finds error in attendee details
        ↓
Clicks "Edit" on attendee row
        ↓
Edit form opens:
  - Attendee name
  - Email
  - Ticket type
        ↓
Makes changes → clicks "Save"
        ↓
App:
  - Updates attendee record
  - Generates NEW QR token
  - Invalidates old QR token
  - Regenerates pass with new details
        ↓
Pass status resets to "unused"
Old pass link/QR no longer works
        ↓
Organizer re-downloads or re-shares updated pass
```

---

## 7. Feature Breakdown

### 7.1 Authentication
- Email + password sign up
- Email + password login
- Logout
- Protected routes (dashboard, events, passes)
- Auth provider: Supabase Auth

### 7.2 Dashboard
- List of all organizer's events (cards)
- Each card shows: event name, date, attendee count, pass count, status
- Quick action: Create Event
- Quick action: Open event
- Empty state for new users

### 7.3 Event Management
- Create event (form)
- Edit event details
- Delete event (with confirmation)
- View event detail page
- Event detail shows: event info + attendee table

### 7.4 Pass Templates
Four templates minimum:

| Template | Description |
|---|---|
| **Minimal** | Clean white/light, simple typography, understated |
| **Modern** | Bold colors, strong typography, geometric accents |
| **Dark** | Dark background, glowing QR, premium night feel |
| **Elegant** | Soft gradients, serif-inspired, luxury aesthetic |

Each template supports:
- Banner image area at top
- Event name, date, time, venue
- Attendee name (largest typography)
- Ticket type badge
- QR code block
- Pass ID footer
- Organizer name footer

### 7.5 Pass Designer (Customization Panel)
- Template grid selector
- Brand color picker (hex input + color swatch)
- Font style selector (2–3 options)
- Banner image upload
- Live preview panel (right side)
- Preview updates in real-time on every change

### 7.6 Attendee Management
- Manual add attendee form
- CSV bulk upload
- CSV template download
- CSV validation and error reporting
- Attendee table with columns: Name, Ticket Type, Email, Status, Actions
- Pass status badge: Pending / Ready / Used
- Actions: Preview, Download PNG, Download PDF, Copy Link, Edit, Delete

### 7.7 Pass Generation
- Auto-generate on attendee upload confirmation
- Unique QR token per attendee (UUID)
- Unique Pass ID per attendee (e.g. TCS-8F3K29A)
- Pass rendered using HTML canvas (html2canvas)
- Status: unused by default

### 7.8 Download & Export
- Individual PNG download
- Individual PDF download
- Bulk ZIP export (all passes)
- Export share links as CSV

### 7.9 Share Functionality
- Copy unique share link per attendee
- WhatsApp share button (wa.me link)
- Native mobile share (navigator.share API)
- Public pass view page: /pass/[passId]
- Pass view page shows digital pass + download button

### 7.10 QR Verification
- Camera-based QR scanner (html5-qrcode)
- Full-screen verification result screen
- Three states: Valid ✅ / Already Used ⚠️ / Invalid ❌
- Marks pass as "used" on valid scan
- Auto-reset after 2 seconds

### 7.11 Dark / Light Mode
- System preference detection
- Manual toggle in navbar
- Consistent theming across all pages

---

## 8. Database Schema

### Table: `users`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
email           text UNIQUE NOT NULL
full_name       text
created_at      timestamp DEFAULT now()
```
*Managed by Supabase Auth*

---

### Table: `events`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES users(id) ON DELETE CASCADE
name            text NOT NULL
date            date NOT NULL
time            time NOT NULL
venue           text NOT NULL
organizer_name  text NOT NULL
brand_color     text DEFAULT '#6C47FF'
banner_url      text
template        text DEFAULT 'modern'
font_style      text DEFAULT 'default'
created_at      timestamp DEFAULT now()
updated_at      timestamp DEFAULT now()
```

---

### Table: `attendees`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
event_id        uuid REFERENCES events(id) ON DELETE CASCADE
name            text NOT NULL
email           text
ticket_type     text NOT NULL DEFAULT 'General'
created_at      timestamp DEFAULT now()
```

---

### Table: `passes`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
attendee_id     uuid REFERENCES attendees(id) ON DELETE CASCADE
event_id        uuid REFERENCES events(id) ON DELETE CASCADE
pass_id         text UNIQUE NOT NULL  -- e.g. TCS-8F3K29A
qr_token        uuid UNIQUE NOT NULL DEFAULT gen_random_uuid()
status          text DEFAULT 'unused'  -- enum: unused | used | invalidated
scanned_at      timestamp
generated_at    timestamp DEFAULT now()
```

---

### Relationships
```
users
  └── events (one user → many events)
        └── attendees (one event → many attendees)
              └── passes (one attendee → one pass)
```

---

## 9. API Endpoint Structure

All routes use Supabase client SDK directly from Next.js.  
Server-side logic lives in Next.js API routes (`/app/api/`).

### Auth (Supabase Auth — handled automatically)
```
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
```

### Events
```
GET    /api/events              → fetch all events for logged-in user
POST   /api/events              → create new event
GET    /api/events/[id]         → fetch single event
PUT    /api/events/[id]         → update event
DELETE /api/events/[id]         → delete event
```

### Attendees
```
GET    /api/events/[id]/attendees         → fetch all attendees for event
POST   /api/events/[id]/attendees         → add single attendee
POST   /api/events/[id]/attendees/bulk    → bulk upload attendees from CSV
PUT    /api/attendees/[id]                → update attendee
DELETE /api/attendees/[id]               → delete attendee
```

### Passes
```
POST   /api/passes/generate/[eventId]    → generate passes for all attendees
POST   /api/passes/regenerate/[id]       → regenerate single pass (invalidates old)
GET    /api/passes/[passId]              → fetch pass by pass ID (public)
GET    /api/passes/export/[eventId]      → bulk export all passes as ZIP
```

### Verification
```
POST   /api/verify                       → verify QR token, mark as used
  body: { qr_token: string }
  returns: { status: 'valid' | 'used' | 'invalid', attendee?, scanned_at? }
```

### Sharing
```
GET    /pass/[passId]                    → public pass view page (no auth required)
GET    /api/share/links/[eventId]        → export all share links as CSV
```

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Animations | Framer Motion |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage (banner images) |
| QR Generation | `qrcode` npm package |
| QR Scanning | `html5-qrcode` |
| PDF Export | `jsPDF` + `html2canvas` |
| CSV Parsing | `papaparse` |
| ZIP Export | `jszip` |
| Deployment | Vercel |

---

## 11. UI/UX Direction

### Design Inspiration
- **Linear** — clean dashboard, tight typography, smooth interactions
- **Stripe** — trustworthy, premium, spacious
- **Luma** — event-native aesthetic, beautiful cards
- **Canva** — intuitive customization panel, live preview

### Design Language
- Clean, minimal, premium
- Generous whitespace
- Strong typographic hierarchy
- Smooth micro-animations
- Mobile-first layout decisions

### Color System
```
Primary:      #6C47FF  (electric purple)
Background:   #0A0A0F  (near black)
Surface:      #16161E  (card background)
Border:       #2A2A38  (subtle borders)
Text Primary: #F0F0FF  (near white)
Text Muted:   #8888AA  (secondary text)
Success:      #22C55E  (valid/used states)
Warning:      #F59E0B  (already scanned)
Error:        #EF4444  (invalid)
```

### Key Pages & Layout

**Landing Page**
- Full-width hero with product tagline
- Live pass preview animation
- Features section
- CTA → Sign Up

**Dashboard**
- Top navbar: logo, nav links, user avatar, dark/light toggle
- Page header: "My Events" + "Create Event" button
- Event cards grid (2 cols desktop, 1 col mobile)
- Empty state illustration for new users

**Pass Designer**
- Split-panel layout:
  - LEFT: Customization sidebar (template picker, color, font, upload)
  - RIGHT: Live pass preview (centered, shadow, realistic card)
- Sticky bottom bar: "Save Design & Continue"

**Attendee Management**
- Page header: event name, attendee count, "Add Attendee" + "Upload CSV" buttons
- Full-width attendee table
- Status badge per row
- Action buttons per row
- Bottom bar: "Generate All Passes" (once attendees are added)

**QR Verification**
- Full-screen camera view
- Scanning reticle overlay
- Result overlay: full-screen color flash (green/amber/red)
- Attendee name shown on valid scan

### Typography
- Display/Headings: `Syne` or `DM Sans` — geometric, modern
- Body: `Geist` — readable, clean
- Monospace (pass IDs): `JetBrains Mono`

---

## 12. Responsiveness

| Breakpoint | Layout Behavior |
|---|---|
| Mobile (< 768px) | Single column, stacked panels, bottom sheet actions |
| Tablet (768–1024px) | 2-column grids, condensed sidebar |
| Desktop (> 1024px) | Full split-panel designer, multi-column dashboard |

QR Verification page is primarily a mobile experience. Optimize scanner UI for phones.

---

## 13. Edge Cases

| Scenario | Handling |
|---|---|
| Duplicate attendee names in CSV | Allow duplicates, each gets unique pass ID and QR |
| Invalid CSV format | Show row-by-row error report before import |
| Missing required CSV fields | Highlight missing fields, block import until fixed |
| Empty attendee list on generate | Show warning: "Add at least one attendee first" |
| Already-used QR scan | Show ⚠️ Already Scanned screen with timestamp |
| Invalid / unknown QR scan | Show ❌ Invalid Pass screen |
| Banner upload failure | Show error toast, continue without banner |
| Session expiry during flow | Redirect to login, preserve last route |
| Attendee edit after pass generated | Regenerate pass, invalidate old QR token |
| 0 passes generated state | Show empty state with CTA to add attendees |

---

## 14. MVP Scope & Priorities

### Must Have (P0)
- [ ] Auth (signup, login, logout)
- [ ] Create / edit / delete events
- [ ] Pass templates (minimum 4)
- [ ] Real-time pass preview
- [ ] Manual attendee creation
- [ ] CSV bulk upload
- [ ] QR code generation per attendee
- [ ] Individual PNG + PDF download
- [ ] Bulk ZIP download
- [ ] Share link (copy + WhatsApp)
- [ ] Public pass view page (/pass/[id])
- [ ] QR verification scanner
- [ ] Pass status (unused / used)
- [ ] Dark / light mode
- [ ] Mobile responsiveness

### Should Have (P1)
- [ ] Export share links as CSV
- [ ] Pass regeneration on edit
- [ ] CSV template download
- [ ] CSV validation error display
- [ ] Dashboard event stats (count cards)
- [ ] Attendee search/filter in table
- [ ] Native mobile share (navigator.share)

### Nice to Have (P2)
- [ ] Font style selector in designer
- [ ] Animated pass preview transitions
- [ ] Pass thumbnail in attendee table row
- [ ] Scan history log per event
- [ ] Onboarding walkthrough for new users

---

## 15. Acceptance Criteria

### Authentication
- User can sign up with email and password
- User can log in and is redirected to dashboard
- Protected routes redirect unauthenticated users to login

### Event Creation
- Organizer can create an event with all required fields
- Event appears on dashboard immediately after creation
- Organizer can edit and delete events

### Pass Design
- Organizer can select from 4 templates
- Live preview updates within 300ms of any change
- Brand color applies correctly to selected template

### Attendee Management
- Organizer can add attendees manually one by one
- Organizer can upload a CSV and see parsed results before confirming
- Attendee table shows all entries with correct status

### Pass Generation
- Each attendee receives a unique QR code and pass ID
- Generated pass visually matches the live preview
- Pass downloads as correct PNG/PDF file

### Share & Export
- Share link opens correct attendee pass on public page
- WhatsApp share opens correct pre-filled message
- ZIP download contains one file per attendee

### QR Verification
- Valid unused pass → green screen, marked as used
- Already used pass → amber warning screen
- Unknown QR → red rejection screen
- Scanner resets automatically after result

---

## 16. Project File Structure

```
ticss/
├── app/                                  ← Next.js App Router
│   ├── (auth)/                           ← Auth route group (no navbar)
│   │   ├── login/
│   │   │   └── page.tsx                  ← Login page
│   │   └── signup/
│   │       └── page.tsx                  ← Sign up page
│   │
│   ├── (dashboard)/                      ← Protected route group (with navbar)
│   │   ├── layout.tsx                    ← Dashboard layout (navbar + sidebar)
│   │   ├── dashboard/
│   │   │   └── page.tsx                  ← Main dashboard (event cards)
│   │   ├── events/
│   │   │   ├── new/
│   │   │   │   └── page.tsx              ← Create event form
│   │   │   └── [id]/
│   │   │       ├── page.tsx              ← Event detail page
│   │   │       ├── design/
│   │   │       │   └── page.tsx          ← Pass designer (template + customization)
│   │   │       ├── attendees/
│   │   │       │   └── page.tsx          ← Attendee management + table
│   │   │       └── verify/
│   │   │           └── page.tsx          ← QR scanner / verification page
│   │
│   ├── pass/
│   │   └── [passId]/
│   │       └── page.tsx                  ← Public pass view (no auth required)
│   │
│   ├── api/                              ← Next.js API routes
│   │   ├── events/
│   │   │   ├── route.ts                  ← GET all events, POST create event
│   │   │   └── [id]/
│   │   │       ├── route.ts              ← GET, PUT, DELETE single event
│   │   │       └── attendees/
│   │   │           ├── route.ts          ← GET attendees, POST add attendee
│   │   │           └── bulk/
│   │   │               └── route.ts      ← POST bulk CSV upload
│   │   ├── attendees/
│   │   │   └── [id]/
│   │   │       └── route.ts              ← PUT update, DELETE attendee
│   │   ├── passes/
│   │   │   ├── generate/
│   │   │   │   └── [eventId]/
│   │   │   │       └── route.ts          ← POST generate all passes for event
│   │   │   ├── regenerate/
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts          ← POST regenerate single pass
│   │   │   ├── [passId]/
│   │   │   │   └── route.ts              ← GET public pass data
│   │   │   └── export/
│   │   │       └── [eventId]/
│   │   │           └── route.ts          ← GET bulk ZIP export
│   │   ├── verify/
│   │   │   └── route.ts                  ← POST verify QR token
│   │   └── share/
│   │       └── links/
│   │           └── [eventId]/
│   │               └── route.ts          ← GET export share links CSV
│   │
│   ├── layout.tsx                        ← Root layout (fonts, providers)
│   ├── page.tsx                          ← Landing page
│   └── globals.css                       ← Global styles + CSS variables
│
├── components/
│   ├── ui/                               ← shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Navbar.tsx                    ← Top navigation bar
│   │   ├── Sidebar.tsx                   ← Dashboard sidebar
│   │   └── ThemeToggle.tsx               ← Dark/light mode toggle
│   ├── dashboard/
│   │   ├── EventCard.tsx                 ← Event card component
│   │   └── StatsBar.tsx                  ← Quick stats (event count, pass count)
│   ├── designer/
│   │   ├── PassDesigner.tsx              ← Full designer split-panel layout
│   │   ├── TemplateSelector.tsx          ← Template grid picker
│   │   ├── CustomizationPanel.tsx        ← Left sidebar controls
│   │   ├── PassPreview.tsx               ← Live preview right panel
│   │   └── templates/
│   │       ├── MinimalTemplate.tsx       ← Minimal pass template
│   │       ├── ModernTemplate.tsx        ← Modern pass template
│   │       ├── DarkTemplate.tsx          ← Dark pass template
│   │       └── ElegantTemplate.tsx       ← Elegant pass template
│   ├── attendees/
│   │   ├── AttendeeTable.tsx             ← Full attendee data table
│   │   ├── AddAttendeeForm.tsx           ← Manual add form
│   │   ├── CSVUploader.tsx               ← CSV upload + validation UI
│   │   └── AttendeeRow.tsx               ← Single table row + actions
│   ├── passes/
│   │   ├── PassCard.tsx                  ← Rendered pass card (used for export)
│   │   └── PublicPassView.tsx            ← Public /pass/[id] view
│   └── verification/
│       ├── QRScanner.tsx                 ← Camera QR scanner
│       └── VerificationResult.tsx        ← Full-screen result overlay
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     ← Supabase browser client
│   │   ├── server.ts                     ← Supabase server client (SSR)
│   │   └── middleware.ts                 ← Auth middleware helper
│   ├── utils/
│   │   ├── qr.ts                         ← QR code generation helpers
│   │   ├── pdf.ts                        ← html2canvas + jsPDF export helpers
│   │   ├── zip.ts                        ← jszip bulk export helpers
│   │   ├── csv.ts                        ← papaparse CSV parse/validate helpers
│   │   ├── passId.ts                     ← Pass ID generator (TCS-XXXXXXX)
│   │   └── share.ts                      ← Share link + WhatsApp URL helpers
│   └── constants.ts                      ← App-wide constants (ticket types, etc.)
│
├── hooks/
│   ├── useAuth.ts                        ← Auth state hook
│   ├── useEvents.ts                      ← Events data hook
│   ├── useAttendees.ts                   ← Attendees data hook
│   └── usePasses.ts                      ← Pass generation/state hook
│
├── types/
│   └── index.ts                          ← All TypeScript interfaces
│                                            (Event, Attendee, Pass, User, Template)
│
├── middleware.ts                          ← Next.js middleware (auth route protection)
├── .env.local                            ← Supabase keys (never commit)
├── PRD.md                                ← This document
├── styles.md                             ← UI direction document
└── README.md                             ← Setup instructions + demo credentials
```

---

## 17. Supabase Setup & APIs

### 17.1 Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  ← server-side only
```

---

### 17.2 Supabase Client Setup

**Browser client** (`lib/supabase/client.ts`)
```ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Server client** (`lib/supabase/server.ts`)
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}
```

**Middleware** (`middleware.ts`)
```ts
import { updateSession } from '@/lib/supabase/middleware'
export async function middleware(request) {
  return await updateSession(request)
}
export const config = {
  matcher: ['/dashboard/:path*', '/events/:path*']
}
```

---

### 17.3 Supabase Auth APIs

```ts
// Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'user@email.com',
  password: 'password123',
  options: { data: { full_name: 'Temi Adesanya' } }
})

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@email.com',
  password: 'password123'
})

// Logout
await supabase.auth.signOut()

// Get current session/user
const { data: { user } } = await supabase.auth.getUser()

// Listen to auth state changes (for client components)
supabase.auth.onAuthStateChange((event, session) => {
  // redirect logic here
})
```

---

### 17.4 Supabase Database APIs

**Events**
```ts
// Fetch all events for logged-in user
const { data: events } = await supabase
  .from('events')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

// Create event
const { data: event } = await supabase
  .from('events')
  .insert({
    user_id: user.id,
    name: 'Tech Meetup Lagos',
    date: '2026-05-25',
    time: '14:00',
    venue: 'Civic Centre, VI',
    organizer_name: 'Temi Adesanya',
    brand_color: '#6C47FF',
    template: 'modern'
  })
  .select()
  .single()

// Update event
const { data } = await supabase
  .from('events')
  .update({ name: 'Updated Name', brand_color: '#FF4747' })
  .eq('id', eventId)

// Delete event
await supabase.from('events').delete().eq('id', eventId)
```

**Attendees**
```ts
// Fetch all attendees for an event
const { data: attendees } = await supabase
  .from('attendees')
  .select('*, passes(*)')           ← join passes in same query
  .eq('event_id', eventId)
  .order('created_at', { ascending: true })

// Add single attendee
const { data: attendee } = await supabase
  .from('attendees')
  .insert({
    event_id: eventId,
    name: 'John Doe',
    email: 'john@gmail.com',
    ticket_type: 'VIP'
  })
  .select()
  .single()

// Bulk insert attendees (from CSV)
const { data } = await supabase
  .from('attendees')
  .insert(attendeesArray)           ← array of attendee objects
  .select()

// Update attendee
await supabase
  .from('attendees')
  .update({ name: 'Jane Doe', ticket_type: 'General' })
  .eq('id', attendeeId)

// Delete attendee
await supabase.from('attendees').delete().eq('id', attendeeId)
```

**Passes**
```ts
// Insert pass record
const { data: pass } = await supabase
  .from('passes')
  .insert({
    attendee_id: attendee.id,
    event_id: eventId,
    pass_id: 'TCS-8F3K29A',
    qr_token: crypto.randomUUID(),
    status: 'unused'
  })
  .select()
  .single()

// Fetch pass by pass_id (public — used on /pass/[passId])
const { data: pass } = await supabase
  .from('passes')
  .select('*, attendees(*), events(*)')   ← join attendee + event data
  .eq('pass_id', passId)
  .single()

// Verify QR token + mark as used
const { data: pass } = await supabase
  .from('passes')
  .select('*, attendees(*)')
  .eq('qr_token', scannedToken)
  .single()

// If found and status === 'unused':
await supabase
  .from('passes')
  .update({ status: 'used', scanned_at: new Date().toISOString() })
  .eq('qr_token', scannedToken)

// Invalidate old pass + generate new (on edit)
await supabase
  .from('passes')
  .update({ status: 'invalidated' })
  .eq('attendee_id', attendeeId)

// Then insert a fresh pass record with new qr_token
```

---

### 17.5 Supabase Storage APIs (Banner Images)

```ts
// Upload banner image
const { data, error } = await supabase.storage
  .from('banners')                        ← bucket name
  .upload(`${eventId}/banner.jpg`, file, {
    cacheControl: '3600',
    upsert: true
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('banners')
  .getPublicUrl(`${eventId}/banner.jpg`)

// Delete banner
await supabase.storage
  .from('banners')
  .remove([`${eventId}/banner.jpg`])
```

---

### 17.6 Row Level Security (RLS) Policies

Enable RLS on all tables. Apply these policies in Supabase SQL Editor:

```sql
-- EVENTS: users can only see and modify their own events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own events" ON events
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ATTENDEES: users can only access attendees of their own events
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own attendees" ON attendees
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- PASSES: users manage passes of their own events
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own passes" ON passes
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- PUBLIC PASS VIEW: anyone can read a pass by pass_id (for /pass/[id] page)
CREATE POLICY "Public can read pass by pass_id" ON passes
  FOR SELECT USING (true);

-- VERIFICATION: allow updating pass status publicly (for QR scanner)
CREATE POLICY "Allow QR verification update" ON passes
  FOR UPDATE USING (true)
  WITH CHECK (status IN ('used', 'invalidated'));
```

---

### 17.7 Supabase Storage Bucket Setup

In Supabase Dashboard → Storage → Create bucket:

```
Bucket name: banners
Public: true          ← so banner image URLs work on public pass pages
File size limit: 5MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

---

### 17.8 Full SQL Schema (Run in Supabase SQL Editor)

```sql
-- Users table is auto-managed by Supabase Auth
-- This extends it with profile data
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text,
  full_name text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  venue text NOT NULL,
  organizer_name text NOT NULL,
  brand_color text DEFAULT '#6C47FF',
  banner_url text,
  template text DEFAULT 'modern',
  font_style text DEFAULT 'default',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  ticket_type text NOT NULL DEFAULT 'General',
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id uuid REFERENCES public.attendees(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  pass_id text UNIQUE NOT NULL,
  qr_token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  status text DEFAULT 'unused',
  scanned_at timestamp,
  generated_at timestamp DEFAULT now()
);

-- Auto-update updated_at on events
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 18. Future Improvements

These are explicitly OUT of MVP scope but valid for future versions:

- **Email delivery** — send passes directly to attendee emails via Resend
- **Apple / Google Wallet** — add pass to digital wallet
- **Check-in dashboard** — real-time attendance counter on event day
- **Public event page** — shareable event landing page for attendees
- **Analytics** — pass open rates, check-in rates, attendance stats
- **Recurring events** — duplicate event with attendee list
- **Team access** — multiple organizers per event
- **Custom pass domains** — branded pass URLs
- **Stripe integration** — paid access tiers

---

*This PRD was written for AI-assisted development. Every flow, schema, and endpoint is designed to be directly actionable by an AI coding assistant with minimal ambiguity.*

*Platform: Ticss | Stack: Next.js + Supabase + Vercel | Target: MVP in 48 hours*
