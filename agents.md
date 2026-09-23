# agents.md — Working in `god-is-good-barbershop`

Guide for AI coding agents (and humans) contributing to this repository.

## What this is

A barbershop website + admin panel. Public site (`/`) and booking page
(`/reservar`) are fully CMS-driven. The panel (`/panel`) manages content,
appointments, scheduling and Google Calendar sync.

Stack: **Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript**,
deployed to **Cloudflare Workers via OpenNext**, with **Cloudflare D1** (SQLite)
as the database. No ORM — raw prepared statements.

There is **no authentication service**: accounts use custom PBKDF2 hashing and
opaque session tokens in an httpOnly cookie (`gg_session`).

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server (port 3000). Boots OpenNext/Cloudflare bindings for D1. |
| `pnpm build` | Production build. |
| `pnpm preview` | Build + preview the Worker locally. |
| `pnpm deploy` | Build + deploy the Worker. |
| `pnpm cf-typegen` | Regenerate `cloudflare-env.d.ts` from bindings. |
| `pnpm db:migrate:local` | Apply `migrations/` to the local D1 (do this after adding a migration). |
| `pnpm db:migrate:remote` | Apply migrations to remote D1. |
| `pnpm lint` | ESLint (flat config). |
| `pnpm test` | Vitest run (unit + integration). |
| `pnpm test:unit` | `tests/unit` only — fast, no network/DB. |
| `pnpm test:integration` | `tests/integration` — needs a running server on `TEST_BASE_URL` (default `:3010`). |
| `pnpm test:e2e` | Playwright (`tests/e2e`), starts its own dev server on `:3010`. |

Always run `pnpm exec tsc --noEmit`, `pnpm lint` and `pnpm test:unit` before
considering a change done.

## Architecture

```
src/
  proxy.ts                    # Next 16 middleware: cheap cookie gate for /panel/*
  app/
    (site)/                   # Public site (Header/Footer/Widgets layout)
      page.tsx                # Home — composes CMS sections
      reservar/               # Public booking page
    panel/
      init/                   # First-run onboarding (only while 0 users exist)
      login/ register/        # Auth screens (AuthForm)
      actions.ts              # ALL server actions ("use server")
      (protected)/
        layout.tsx            # requireUser() + sidebar nav
        dashboard/ calendar/ appointments/ content/ settings/
    api/
      availability/           # GET public availability
      appointments/           # POST public booking
      appointments/export/    # GET CSV export (panel, session-gated)
      google/{auth,callback}/ # Google Calendar OAuth
  components/                 # booking/ common/ home/ panel/ ui/
  server/
    db.ts                     # getDb() → D1 binding (throws if missing)
    models.ts                 # Row + view-model types
    repositories/             # Raw SQL, one file per table
    services/                 # Business logic (validation, orchestration)
    scheduling/               # Pure slot/time/preset/calendar helpers
  types/                      # CMS + scheduling contracts (shared client/server)
  lib/                        # utils, timezones, csv, whatsapp
migrations/                   # D1 SQL migrations (0001 init, 0002 seed, …)
tests/                        # unit/ integration/ e2e/
```

### Layering (keep this separation)

`page/action → service → repository → D1`. Server actions in
`src/app/panel/actions.ts` are thin: parse `FormData`, call a service, then
`redirect`/`revalidatePath`. Business rules live in `src/server/services/*`;
SQL lives in `src/server/repositories/*`. Pure helpers in
`src/server/scheduling/*` must stay dependency-free so they are unit-testable
and safe to import from client components (e.g. `formatTimeLabel`).

### Data model (D1)

- `users` — panel admins (PBKDF2 hash/salt/iterations).
- `sessions` — opaque bearer tokens, 30-day TTL, httpOnly cookie.
- `content` — one row per CMS section (`section` unique, `data` = JSON).
- `settings` — single row (`id = 1`): business contact, `work_hours` (JSON),
  `timezone`, `session_duration`, `google_tokens`.
- `appointments` — bookings; unique active slot on `(date, start_time)`.
- `blocked_dates` — full-day closures that hide availability.

### CMS model

Sections are declared once in `src/types/cms.ts`
(`CmsSectionData`, `CMS_SECTION_KEYS`, `CMS_SECTION_LABELS`,
`isCmsSectionKey`). Each section has a structured editor in
`src/app/panel/(protected)/content/[section]/page.tsx` (plus client editors
`NavItemsEditor`, `ParagraphsEditor`, `ServicesItemsEditor`). **There are no
silent fallbacks**: `getContentOrThrow` throws if a row is missing — the seed
migration is mandatory.

To add a section: add the type + key + label in `types/cms.ts`, add a `case`
in `saveSectionAction` and in the `[section]` editor, and add a seed row in a
migration.

## Conventions

- Comments and UI copy are in **Spanish**; identifiers in **English**.
- Server actions have signature `(prevState, formData)` when used with
  `useActionState`; plain actions take `formData` only.
- `requireUser()` guards every mutating action; `getSessionUser()` for reads.
- Prefer `redirect(...?saved=...)` / `?error=...` query feedback over toasts.
- Styling: Tailwind utility classes, `cn()` for merging. Cards use
  `rounded-2xl border border-border bg-background p-6 shadow-xs`.
- Never introduce a new external service (email, SMS, analytics, …) without
  checking the Gravity Index and confirming with the user first.

## Testing

- **Unit** (`tests/unit`): pure helpers and services with repository mocks.
  Existing: `slots`, `time`, `validation`, `content`, `google`, `presets`,
  `calendar`, `csv`, `whatsapp`, `blockedDates`, `utils`.
- **Integration** (`tests/integration`): hits a running server for API shape and
  auth redirects.
- **E2E** (`tests/e2e`): Playwright flows for auth, public booking, CMS save.

Notes/gaps to keep in mind: tests hit a seeded local D1, so DB-dependent tests
require `pnpm db:migrate:local` first. There is no test yet for the appointments
service orchestration or for CSV export over HTTP; add them when touching those
paths.

## Gotchas

- `wrangler.jsonc` must be migrated after every new file in `migrations/`
  before the running dev server can use the new table.
- `pnpm dev` is required (not a bare `next dev`) so the D1 binding resolves;
  otherwise `getDb()` throws by design.
- Date/time logic is timezone-sensitive: `zonedDateKey(date, tz)` converts an
  instant to a `YYYY-MM-DD` key in the configured timezone. Use it instead of
  hardcoding `America/Caracas`.
- Slot generation steps by `session_duration` from each range start, so
  changing the duration changes every offered slot.

See `FEATURES.md` for what has been built and `README.md` for setup.
