# Features & changes

Living log of features implemented in this repository, plus the reviews that
motivated them. Newest work at the top.

> ⚠️ Two migrations are included: `migrations/0003_blocked_dates.sql` (blocked
> dates table) and `migrations/0004_content_expansion.sql` (gallery,
> testimonials, FAQ, CTA and the two legal pages). Run
> `pnpm db:migrate:local` before using the panel/site.

---

## 10. Technical SEO: sitemap, robots, structured data

- **`/sitemap.xml`** generated from `PUBLIC_ROUTES` (`src/app/sitemap.ts` +
  `buildSitemapEntries`). Regenerates daily.
- **`/robots.txt`** allows the site, disallows `/panel` and `/api/`, and points
  to the sitemap.
- **JSON-LD structured data** (`src/components/common/JsonLd.tsx`):
  - `HairSalon` (LocalBusiness) site-wide from `(site)/layout.tsx` — address,
    phone, email, `foundingDate`, `openingHours` /
    `openingHoursSpecification` from real work hours, and `aggregateRating`
    computed from the CMS testimonials.
  - `FAQPage` on the home page, built from the FAQ section (the accordion keeps
    every answer in the initial HTML so the markup matches the structured data).
  - `BreadcrumbList` on both legal pages.
- **Metadata**: canonical `alternates`, OpenGraph/Twitter with the hero image,
  `applicationName`, format detection and light/dark `themeColor` viewport.
- All builders are pure and tested (`src/lib/seo.ts`, `tests/unit/seo.test.ts`).

## 11. Legal pages — `/politicas` and `/privacidad`

- CMS-driven: sections `legal.terms` and `legal.privacy`
  (`title`, `updatedAt`, `intro`, `sections[{heading, body}]`).
- Blank lines inside a body become separate paragraphs; each page ends with a
  contact block built from the business settings.
- Edited from the panel with a repeater editor (add/reorder/remove sections).
- Linked from the footer and included in the sitemap.

## 12. New CMS sections: gallery, testimonials, FAQ, CTA

Four new home sections, each fully editable:

| Section | Component | Notes |
| --- | --- | --- |
| `home.gallery` | `components/home/Gallery.tsx` | `next/image` grid, first item featured |
| `home.testimonials` | `components/home/Testimonials.tsx` | star rating (1–5) + aggregate rating in JSON-LD |
| `home.faq` | `components/home/Faq.tsx` | animated accordion + FAQPage data |
| `home.cta` | `components/home/CtaBand.tsx` | closing conversion band |

- New generic **`RepeaterEditor`** (`src/components/panel/RepeaterEditor.tsx`)
  powers gallery, testimonials, FAQ and legal-section lists (add, reorder,
  remove, typed fields, JSON serialization for the server action).
- Content index (`/panel/content`) is now grouped **Marca / Página de inicio /
  Legal** via `CMS_SECTION_GROUPS`.

## 13. SSG / ISR with on-demand revalidation

- The public site is now **statically generated** instead of
  `force-dynamic`: `(site)/layout.tsx` and `(site)/page.tsx` use
  `export const revalidate = 900` (15 min), legal pages 24 h, sitemap/robots
  24 h.
- Every panel save still calls `revalidatePath("/", "layout")`, so CMS edits
  appear **immediately**; the interval is only a safety net.
- `/reservar` intentionally stays dynamic (live slot availability) and the
  public API routes are untouched.
- To make bindings available while prerendering, `getDb()` is now **async**
  (`await getCloudflareContext({ async: true })`); call it as
  `(await getDb())`. Without this, `next build` failed on static pages.

## 14. Dashboard analytics

- New KPI row: **bookings in the window** (with period-over-period trend),
  **today**, **completion rate** (excluding cancellations) and **7-day
  occupancy** (free slots).
- **Daily activity chart** (last 14 days, hover shows the count).
- **Status donut** with legend and historical totals.
- **Busiest hours** ranking from the window's appointments.
- Summary card: average per day, cancellation rate, pending, confirmed.
- Pure aggregations in `src/server/scheduling/analytics.ts`, orchestration in
  `src/server/services/analytics.ts`, UI in
  `src/app/panel/(protected)/dashboard/AnalyticsPanels.tsx`.
- Bonus fix: the dashboard "today" now uses the configured timezone instead of
  a hardcoded `America/Caracas`.

## 15. Contact section upgrade

- **Opening hours** table built from the scheduling settings (each weekday,
  "Cerrado" when closed, plus timezone and session duration).
- **Embedded map** (`output=embed`, lazy, no API key) next to the hours.
- **Quick message form** (`ContactQuickForm`): composes the message and opens
  WhatsApp — no backend, no client data stored (falls back to `mailto:` when no
  phone is configured).
- New optional CMS fields: `hoursTitle`, `formTitle`, `formSubtitle`,
  `formButtonText` (added by migration 0004 with `json_set`, so existing edited
  values are preserved).

## 16. Tests

Unit suite grew **76 → 115 tests**: new `seo`, `analytics` and `cms-sections`
files. Integration suite now also checks that the marketing/legal pages answer
200, that the sitemap lists the legal pages, that robots.txt hides `/panel`, and
that the home page ships the `HairSalon` + `FAQPage` JSON-LD.

## 17. Animated accordion (FAQ)

- **`src/components/common/Accordion.tsx`** — reusable, accessible, animated.
  - Open/close uses the `grid-template-rows: 0fr → 1fr` technique, so the
    height **transitions** in both directions; the native `<details>` it
    replaces snapped shut instantly in every engine.
  - Answer fades in/out (`opacity`) alongside the height for a cleaner reveal,
    and the `+` icon rotates 45° into a `×` over 300 ms.
  - `prefers-reduced-motion` disables the motion (`motion-reduce:transition-none`).
  - Panels are **collapsed, not unmounted** → answers stay in the initial HTML
    (FAQPage structured data and crawlers keep seeing them).
  - Accessibility: real `<button>` inside `<h3>`, `aria-expanded` +
    `aria-controls`, `aria-hidden` on collapsed panels, namespaced ids from
    `useId()` (safe to render several accordions per page), visible focus ring.
  - Props: `items`, `defaultOpenIndex` (−1 keeps all closed) and
    `allowMultiple` (set `false` for exclusive open, as the FAQ uses).
- Files: `src/components/common/Accordion.tsx`, `src/components/home/Faq.tsx`.

## 18. Layout/hover polish on the home page

**Contact — "Escríbenos" card no longer has a dead area.**

- Problem: the card is a grid item next to the map + opening-hours column, so
  `align-items: stretch` grew it to that column's height (~652 px) while the
  form only needed ~229 px → a **~300 px empty bordered box** (measured in the
  browser before the fix).
- Fix: the card is now a `flex h-full flex-col` and the message field absorbs
  the leftover height (`flex-1`), with the submit button pinned to the bottom
  (full width). The extra room becomes writing space instead of a void — fills
  100 % from 1024 px up, and stays a normal compact form on mobile.
- The left column is also a flex column where the **map grows** (`min-h-64`,
  iframe `absolute inset-0`), so the balance holds even when the hours card
  gets taller (e.g. all seven days open).
- Verified in Chromium at 1600/1440/1280/1100/900/640/390 px: no overflow on
  the card, the column or the grid, and the map stays visible.

**Services — hover only on the "Reservar" link.**

- Removed the card-level hover (`-translate-y-1`, `border-primary/40`,
  `bg-background/10`) and the icon's `group-hover` colour swap; the card is now
  static.
- The link keeps its own hover via a **named group** (`group/link`), so the
  colour change and the arrow's 2 px slide are scoped to the link itself.
- Verified in Chromium: computed styles are identical with the cursor over the
  card, and change only when hovering the link.
- Files: `src/components/home/Contact.tsx`,
  `src/components/home/ContactQuickForm.tsx`,
  `src/components/home/Services.tsx`.

---

## 1. First-run onboarding — `/panel/init`

A dedicated setup page for the first administrator.

- Only reachable while **zero users** exist; afterwards it redirects to the
  dashboard (if logged in) or `/panel/login`.
- One form bootstraps everything:
  1. **Admin account** — name, email, phone, password + confirmation.
  2. **Business data** — name, slogan, contact, address, maps, WhatsApp.
  3. **Schedule** — weekday preset, session duration and timezone.
- Creates the admin, opens the session, saves business/scheduling settings and
  drops the user straight into the dashboard.
- `/panel/login` now points new installs to `/panel/init`;
  `/panel/register` is kept as a lightweight fallback.
- Files: `src/app/panel/init/page.tsx`, `src/app/panel/init/InitForm.tsx`,
  `initPanelAction` in `src/app/panel/actions.ts`, `src/proxy.ts`.

## 2. Calendar view for sessions — `/panel/calendar`

A month grid to see bookings at a glance (previously only a flat table existed).

- Monday-first 6-week grid; each day shows appointment count, up to three
  entries with status dots, and a "Cerrado" badge for blocked dates.
- Month navigation (previous / today / next) via `?month=YYYY-MM`.
- Click a day → detail list (`?day=YYYY-MM-DD`) with times, client, status and
  a link to manage that day in **Citas**.
- Added to the panel sidebar.
- Files: `src/app/panel/(protected)/calendar/page.tsx`,
  `src/server/scheduling/calendar.ts` (pure grid helpers),
  `listAppointmentsInRange` in repositories/services.

## 3. Schedule presets (everyday / monFri / weekends / custom)

Choosing the working week is now one click, with per-day control.

- **Plantillas**: `Todos los días`, `Lunes a viernes`, `Fines de semana`,
  `Personalizado`.
- A **Horario general** control sets the default opening range used when a
  preset is applied or a day is opened.
- **Personalizado** exposes a checkbox per weekday (Lun…Dom) plus multiple
  ranges per day — "daily con seteo de mon, tu, w…".
- The active preset is detected automatically from the open days.
- Files: `SCHEDULE_PRESETS`/`PRESET_WEEKDAYS` in `src/types/scheduling.ts`,
  `src/server/scheduling/presets.ts`,
  `src/app/panel/(protected)/settings/WorkHoursEditor.tsx`.

## 4. Session duration between appointments

`session_duration` drives slot generation: availability steps by this value
inside each opening range (default **45 min**). Surfaced in settings as
**"Duración entre citas (minutos)"** with a hint, and editable during
onboarding. Already existed in the schema — now clearly labelled and validated.

## 5. Blocked dates / time off

Full-day closures (holidays, vacations) that hide public availability.

- New table `migrations/0003_blocked_dates.sql`.
- Panel: **Ajustes → Horarios → Días bloqueados** to add a date + reason and
  remove entries.
- Availability (`getAvailability`, `/reservar`, `/api/availability`) empties
  blocked days, so they can't be booked; the calendar marks them as closed.
- Files: `src/server/repositories/blockedDates.ts`,
  `src/server/services/blockedDates.ts`, `applyBlockedDates` in
  `src/server/scheduling/slots.ts`, actions in `src/app/panel/actions.ts`.

## 6. Appointments: search, CSV export, WhatsApp contact

- **Search** by name/email/phone (`?q=`) in the Citas list.
- **Exportar CSV** of the current filter set via
  `GET /api/appointments/export` (session-gated, UTF-8 BOM for Excel).
- **WhatsApp** quick action per row, opening a prefilled message to the client.
- Files: `src/lib/csv.ts`, `src/lib/whatsapp.ts`,
  `src/app/api/appointments/export/route.ts`,
  `src/app/panel/(protected)/appointments/*`.

## 7. CMS editor improvements

- `site.nav` is now a **structured list editor** (text/href, reorder, add,
  remove) instead of a raw JSON textarea.
- `home.about` paragraphs use a **structured paragraph editor** with reordering.
- Files: `src/app/panel/(protected)/content/[section]/NavItemsEditor.tsx`,
  `ParagraphsEditor.tsx`, `[section]/page.tsx`.

## 8. Correctness fixes

- `getAvailability` now derives "today" from the **configured timezone**
  instead of a hardcoded `America/Caracas`.
- Booking form now submits the real slot end time (server still recomputes it,
  so this is cosmetic/robustness).

## 9. Tests

Added unit coverage (40 → 76 tests): `presets`, `calendar`, `csv`, `whatsapp`,
`blockedDates`, plus blocked-date cases in `slots`. `pnpm test:unit` all green.

---

## Review notes

### CMS review

- **Strength**: single source of truth for section keys in `types/cms.ts`, no
  silent fallbacks (`getContentOrThrow`), structured editors for list data.
- **Finding — duplicated brand data**: `site.meta` (Contenido) and the
  `settings` row (Ajustes) both store name/slogan/tagline/description/since and
  contact fields. The header/footer read from different places, so edits can
  desync. Recommended follow-up: make Ajustes the single source for brand/contact
  and have CMS only hold page copy.
- **Finding — light validation**: only non-empty/JSON checks. Future: validate
  URLs (images, maps, WhatsApp) and normalize `href`s.

### Tests review

- Good pure-helper coverage and clear separation of unit vs integration vs e2e.
- Gaps: no test for appointment service orchestration (`createBooking` happy
  path), CSV export over HTTP, or blocked-date booking rejection end-to-end.
  Integration/e2e suites need a migrated + seeded local D1.

## Suggested next features (not yet implemented)

1. **Service selection at booking time** — pick "Corte / Barba / Lavado" with
   per-service duration and price (biggest business value, also unlocks revenue
   analytics).
2. **Email/WhatsApp confirmations** via a transactional provider (needs the
   Gravity Index + user approval first).
3. **Buffer time between appointments** (separate from session duration).
4. **Recurring/partial-day blocks** (currently whole days only).
5. **Gallery image uploads** (the editor currently takes URLs).
6. **Contact-message inbox** in the panel (the quick form only opens WhatsApp).
7. **Revenue analytics** per service once services are bookable.
