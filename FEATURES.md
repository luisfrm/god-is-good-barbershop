# Features & changes

Living log of features implemented in this repository, plus the reviews that
motivated them. Newest work at the top.

> ⚠️ A new migration (`migrations/0003_blocked_dates.sql`) is included. Run
> `pnpm db:migrate:local` before using the panel so the `blocked_dates` table
> exists.

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
   per-service duration and price (biggest business value).
2. **Email/WhatsApp confirmations** via a transactional provider (needs the
   Gravity Index + user approval first).
3. **Buffer time between appointments** (separate from session duration).
4. **Recurring/partial-day blocks** (currently whole days only).
5. **Dashboard analytics**: weekly bookings chart and busiest hours.
