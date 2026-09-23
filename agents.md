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
    (site)/                   # Public site (Header/Footer/Widgets layout), ISR 15 min
      page.tsx                # Home — composes CMS sections + FAQ JSON-LD
      reservar/               # Public booking page (dynamic: live availability)
      politicas/  privacidad/ # CMS-driven legal pages
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
    sitemap.ts  robots.ts     # SEO routes (sitemap from PUBLIC_ROUTES)
  components/                 # booking/ common/ home/ legal/ panel/ ui/
  server/
    db.ts                     # getDb() → D1 binding, async (throws if missing)
    models.ts                 # Row + view-model types
    repositories/             # Raw SQL, one file per table
    services/                 # Business logic (validation, orchestration)
    scheduling/               # Pure slot/time/preset/calendar/analytics helpers
  types/                      # CMS + scheduling contracts (shared client/server)
  lib/                        # utils, timezones, csv, whatsapp, seo
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
`CMS_SECTION_GROUPS`, `isCmsSectionKey`). Current sections: `site.meta`,
`site.nav`, `home.hero`, `home.services`, `home.about`, `home.gallery`,
`home.testimonials`, `home.faq`, `home.contact`, `home.cta`, `legal.terms`,
`legal.privacy`.

Each section has a structured editor in
`src/app/panel/(protected)/content/[section]/page.tsx` (plus client editors
`NavItemsEditor`, `ParagraphsEditor`, `ServicesItemsEditor` and the generic
`RepeaterEditor` used by gallery/testimonials/FAQ/legal lists). **There are no
silent fallbacks**: `getContentOrThrow` throws if a row is missing — the seed
migrations are mandatory.

To add a section: add the type + key + label in `types/cms.ts` (and to a group
in `CMS_SECTION_GROUPS`), add a `case` in `saveSectionAction` and in the
`[section]` editor, then add a seed row in a migration.

### Rendering & caching

- Public site pages are **static (ISR)**: `revalidate = 900` in
  `(site)/layout.tsx` / `(site)/page.tsx`, 24 h for the legal pages,
  `sitemap.ts` and `robots.ts`. `/reservar` and everything under `/panel` stay
  dynamic.
- Saving anything from the panel calls `revalidatePath("/", "layout")`, so CMS
  edits are live immediately — never add a page that can't be revalidated this
  way without updating the actions.
- `NEXT_PUBLIC_APP_URL` feeds `metadataBase`, canonical URLs, sitemap and
  robots; keep it set per environment.

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
  `calendar`, `csv`, `whatsapp`, `blockedDates`, `seo`, `analytics`,
  `cms-sections`, `utils` (115 tests).
- **Integration** (`tests/integration`): hits a running server for API shape,
  public/SEO routes, JSON-LD presence and auth redirects.
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
- `getDb()` is **async** — always `(await getDb()).prepare(...)`. The async
  Cloudflare context is also what lets `next build` prerender the static pages
  against the local D1; the sync variant throws outside a request scope.
- Adding/removing a public route means updating `PUBLIC_ROUTES` in
  `src/lib/seo.ts` (sitemap) and the integration test expectations.
- Date/time logic is timezone-sensitive: `zonedDateKey(date, tz)` converts an
  instant to a `YYYY-MM-DD` key in the configured timezone. Use it instead of
  hardcoding `America/Caracas`.
- Slot generation steps by `session_duration` from each range start, so
  changing the duration changes every offered slot.

See `FEATURES.md` for what has been built and `README.md` for setup.
