---
title: 'Story 1.2: Sign In to a Themed, Accessible Shell'
type: 'feature'
created: '2026-07-13'
status: 'done'
baseline_revision: '3b7caa725057d8a42eb25c44f37d39afa6dfe626'
final_revision: '4bfd4c74c87d7e8096e24cfb7937b3ade4a35c40'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-life-focus-2026-07-12/DESIGN.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-life-focus-2026-07-12/EXPERIENCE.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** The scaffold (Story 1.1) has an ungated web host with a placeholder `page.tsx` and no visual identity. Every later story needs an authenticated shell wearing the product's light-mode identity, so the app is "mine and unmistakably itself from the first render."

**Approach:** Add Better Auth (email+password, single-user gated sign-up) over a Drizzle/Postgres adapter; gate every surface via middleware so an unauthenticated visitor is redirected to sign-in. Ship the DESIGN.md core **light** tokens byte-identical as CSS variables, load Playfair Display + Public Sans, and render an authenticated shell with an 80px side-nav rail (Today / Interrupts / Inbox / Commitments) that has landmark roles, a `:focus-visible` ring, and full keyboard operability.

## Boundaries & Constraints

**Always:**
- Better Auth gates **every** surface except `/sign-in` and `/api/auth/*`; unauthenticated requests to any app route redirect to `/sign-in`. Auth lives in `apps/web` (AD-6, single-tenant; worker trusts the DB boundary).
- Sign-up is **gated to one user**: allowed only while the `user` table is empty; the first sign-up creates the single app user, after which sign-up is closed and only sign-in is offered.
- Light-mode color + typography tokens are **byte-identical** to DESIGN.md frontmatter (exact hex, exact px/weight/tracking). Tokens live as CSS custom properties; components reference variables — no hardcoded hex overrides anywhere.
- Playfair Display is used **only** for `display-lg`/`headline-*`; Public Sans for all body, labels, and nav text. Fonts self-hosted via `next/font` (no external font CDN, no first-paint FOUT).
- Side-nav: 80px rail at `≥ lg`; each item is icon + `label-caps` (12px/600/0.08em/uppercase) label; active item = `surface-container` fill + 2px `primary` right border. Landmark roles: `<nav>` for the rail, `<main>` for content, `<header>` for the surface header. Native `<a>`/`<button>` only — no `div` click handlers.
- Focus-visible ring: `outline: 2px solid var(--light-primary); outline-offset: 2px`, applied via `:focus-visible` only (never `:focus`), never clipped by parent `overflow:hidden`/`border-radius`. All interactive elements Tab-reachable in reading order.
- All new env reads go through `packages/config` (no `process.env` outside it — lint-enforced). Better Auth secret/URL are added to the typed config schema and `.env.example`.
- Auth tables reach Postgres through a Drizzle migration in `packages/db` (AD-9, plain Postgres — no Supabase Auth/SDK). The dev environment applies migrations automatically before authed routes serve.

**Block If:**
- DESIGN.md and EXPERIENCE.md disagree on a token/behavior in a way not already resolved by the epic scope decision (light-only for 1.2) — HALT `blocked`.
- Better Auth's current stable API cannot support gated single-user sign-up over the Drizzle adapter without a domain-model change — HALT `blocked`.

**Never:**
- No dark-mode tokens or theme switcher (System/Light/Dark, `localStorage` sync) — deferred to Epic 13 per epic context. Ship light only; do not build the toggle.
- No third-party UI kit (shadcn/MUI) for shell chrome — custom components on DESIGN.md tokens.
- No domain/event tables, calendar, or business surfaces — the four nav destinations are empty placeholder pages proving the shell + routing only.
- Do not weaken Story 1.1 gates (AD-1 dependency lint, no-process-env, jsx-a11y, typecheck of test files).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Unauthenticated visit | GET `/` (or any app route), no session | 302 → `/sign-in` | No error |
| First-run sign-up | `user` table empty, valid credentials submitted at `/sign-in` | Single user created; session set; redirect to `/` (shell) | Invalid input → inline field error, no user created |
| Sign-up after first user | `user` table non-empty, sign-up attempted | Rejected: "This app already has an account. Sign in instead." | Never creates a second user |
| Valid sign-in | Existing user, correct credentials | Session set; redirect to `/`; shell renders | Wrong credentials → "Email or password is incorrect." (no user enumeration) |
| Authenticated visit | Valid session, GET `/` | Shell renders with light tokens, fonts, side-nav | — |
| Keyboard-only nav | Tab through shell | Each nav item focusable in reading order; visible focus ring; Enter activates | — |

</intent-contract>

## Code Map

- `packages/config/src/index.ts` -- extend zod env schema: `BETTER_AUTH_SECRET` (required, min 32 chars), `BETTER_AUTH_URL` (default `http://localhost:3000`) + tests
- `packages/db/src/schema/auth.ts` -- Drizzle tables: `user`, `session`, `account`, `verification` (Better Auth shape); exported from `packages/db`
- `packages/db/drizzle.config.ts` + `packages/db/src/migrate.ts` -- drizzle-kit config + programmatic migration runner; generated SQL under `packages/db/drizzle/`
- `apps/web/src/lib/auth.ts` -- Better Auth server instance (Drizzle adapter, email+password), lazy singleton; consumes `packages/config`
- `apps/web/src/lib/sign-up-gate.ts` -- server-side guard: allow sign-up only when `user` table empty
- `apps/web/src/lib/auth-client.ts` -- Better Auth React client
- `apps/web/src/app/api/auth/[...all]/route.ts` -- Better Auth request handler (GET/POST)
- `apps/web/src/middleware.ts` -- extend existing correlation-ID middleware to also redirect unauthenticated requests to `/sign-in` (allowlist `/sign-in`, `/api/auth`, static assets)
- `apps/web/src/app/sign-in/page.tsx` + `sign-in-form.tsx` -- public sign-in/first-run sign-up surface, themed
- `apps/web/src/app/(app)/layout.tsx` -- authenticated shell: `<header>` + `<nav>` 80px rail + `<main>`; session-required
- `apps/web/src/components/side-nav.tsx` + `sign-out-button.tsx` -- rail with active state; sign-out
- `apps/web/src/app/(app)/{today,interrupts,inbox,commitments}/page.tsx` -- four placeholder surfaces
- `apps/web/src/app/layout.tsx` -- root layout: `next/font` Playfair Display + Public Sans as CSS vars; import `globals.css`; `<html lang="en">` light baseline
- `apps/web/src/app/globals.css` -- DESIGN.md light tokens as `:root` CSS variables + focus-visible + base type; font-family mapping
- `apps/web/src/app/page.tsx` -- redirect `/` → `/today` (or render Today) inside the shell
- `.env.example`, `docker-compose.yml`, web Dockerfile/entry -- new auth env vars; automatic migration on dev startup

## Tasks & Acceptance

**Execution:**
- [x] `packages/config/src/index.ts` (+ test) -- add `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` to typed schema -- config discipline for auth secrets
- [x] `packages/db/src/schema/auth.ts` + export -- Better Auth table shapes in Drizzle -- AD-9 schema in `packages/db`
- [x] `packages/db/drizzle.config.ts` + `src/migrate.ts` + generated migration -- migration mechanism (first real schema) + programmatic runner -- tables exist before sign-in
- [x] `apps/web/src/lib/auth.ts`, `sign-up-gate.ts`, `auth-client.ts` -- Better Auth server/client + single-user gate -- gated auth per AD-6
- [x] `apps/web/src/app/api/auth/[...all]/route.ts` -- Better Auth handler -- auth endpoints
- [x] `apps/web/src/middleware.ts` -- add session redirect (keep correlation-ID behavior) -- gate every surface
- [x] `apps/web/src/app/sign-in/page.tsx` + `sign-in-form.tsx` -- themed sign-in / first-run sign-up -- entry surface
- [x] `apps/web/src/app/(app)/layout.tsx` + `components/side-nav.tsx` + `sign-out-button.tsx` -- authed shell w/ landmarks, active state, focus ring, keyboard nav -- shell AC
- [x] `apps/web/src/app/(app)/{today,interrupts,inbox,commitments}/page.tsx` + `page.tsx` redirect -- placeholder surfaces + default route -- nav proves routing
- [x] `apps/web/src/app/layout.tsx` + `globals.css` -- fonts + light tokens (byte-identical) + focus-visible -- visual identity AC
- [x] `.env.example` + `docker-compose.yml` + web Dockerfile/entry -- auth env vars + auto-migrate on `docker compose up` -- one-command dev with working sign-in
- [x] tests -- middleware gate redirect; sign-up-gate (empty vs non-empty user table); token-presence assertion (globals.css contains exact DESIGN.md hex); shell renders landmarks + focusable nav; I/O matrix edge cases -- gates proven

**Acceptance Criteria:**
- Given an unauthenticated browser, when I visit any app route, then Better Auth redirects me to `/sign-in`; and once signed in I land on the shell as the single app user.
- Given no account exists, when I complete first-run sign-up, then exactly one user is created and a second sign-up is refused thereafter.
- Given the authenticated shell, when it renders, then the DESIGN.md light tokens are byte-identical in `globals.css`, Playfair Display + Public Sans load with no external CDN, and the 80px side-nav rail renders with `nav`/`main`/`header` landmarks, a `:focus-visible` ring, active-item styling, and Tab/Enter keyboard operability.
- Given the repo, when `npm run typecheck`, `npm run lint`, and `npm test` run, then all pass (Story 1.1 gates intact, ≥1 new test per new concern).
- Given `docker compose up` on a clean checkout, when it starts, then migrations apply automatically and `/sign-in` is reachable and functional.

## Spec Change Log

_No bad_spec loopback occurred; intent contract and spec body held through review._

## Review Triage Log

### 2026-07-13 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 3: (high 0, medium 2, low 1)
- defer: 1: (high 0, medium 1, low 0)
- reject: 17
- addressed_findings:
  - `[low]` `[patch]` Middleware `isPublicPath` treated any path containing a dot as a public asset (over-broad auth-allowlist footgun). Replaced `pathname.includes('.')` with a trailing known-static-extension allowlist so real routes with dotted segments stay gated. [`apps/web/src/middleware.ts`]
  - `[medium]` `[patch]` Sign-in form reported every first-run sign-up failure as "This app already has an account" — mislabeling weak-password/other server errors during the sole user's onboarding. Now surfaces the server's actual message with a sensible fallback. [`apps/web/src/app/sign-in/sign-in-form.tsx`]
  - `[medium]` `[patch]` The "byte-identical" token test was a ~10-value substring spot-check that could not catch drift on the other ~40 tokens, and type-spec assertions collided across CSS rules. Rewrote it to parse all 52 `light-*` tokens from DESIGN.md and assert each verbatim, with type specs scoped to their selector block. [`apps/web/src/app/globals.test.ts`]

## Design Notes

- **Light-only scope is deliberate.** EXPERIENCE.md Foundation describes a 3-mode theme (System/Light/Dark) with `localStorage` + server-synced `<html class>`; the **epic context overrides this for Story 1.2** ("core light-mode tokens must be in place by end of Story 1.2 — dark tokens are deferred to Epic 13"). Ship light tokens only and do not build the switcher. Structure `globals.css` so a `.dark` scope can be added later without moving the light values.
- **Token fidelity is testable, not aspirational.** A unit/asserted test reads `globals.css` and confirms the exact DESIGN.md hex strings (e.g. `#fcf9f3`, `#17282a`, `#2d3e40`) and type specs are present. This is the "byte-identical" gate.
- **Gated sign-up = the single-user model.** No seeded credentials; the first sign-up *is* onboarding of the sole app user (AD-6). The gate is enforced server-side (checking the `user` table), not just hidden in the UI.
- **Stale `apps/web/dist/` stubs** (auth.d.ts, sign-in, `(app)/layout`, etc.) are leftover build artifacts from a prior pass — `src/` is the source of truth. Do not import from `dist/`; regenerate on build.
- **Auth tables are not domain entities** — AD-5's non-null `context` column applies to domain/event tables (Story 1.3), not Better Auth's `user`/`session`/`account`/`verification`.
- Focus ring token: `light-primary #17282a` on `light-surface #fcf9f3` = 16.26:1, far exceeds WCAG 2.4.13's 3:1.

## Verification

**Commands:**
- `npm install` -- expected: clean install incl. `better-auth`, `drizzle-kit`; lockfile updated
- `npm run typecheck` -- expected: exit 0 (incl. test files across all workspaces)
- `npm run lint` -- expected: exit 0; no-process-env / AD-1 / jsx-a11y fixtures still fail-closed
- `npm test` -- expected: Vitest green; new tests for middleware gate, sign-up-gate, token presence, shell landmarks/keyboard
- `docker compose up -d` then `curl -sI localhost:3000/` -- expected: 307/302 → `/sign-in` when unauthenticated; migrations applied in logs
- Manual: sign up (first run) → land on shell; sign out → `/sign-in`; Tab through rail → visible focus ring on each item; second sign-up refused

## Auto Run Result

Status: done

**Implemented change:** Better Auth (email+password, server-gated single-user sign-up) over a Drizzle/Postgres adapter now gates every surface; unauthenticated requests redirect to `/sign-in`. The DESIGN.md core **light** design tokens (all 52 colors + type scale) ship byte-identical in `globals.css`, Playfair Display + Public Sans self-host via `next/font`, and an accessible authenticated shell renders an 80px side-nav rail (Today / Interrupts / Inbox / Commitments) with `nav`/`main`/`header` landmarks, a `:focus-visible`-only ring, active-item styling, and keyboard operability. First real DB schema + migration mechanism introduced in `packages/db`; dev environment auto-migrates on `docker compose up`.

**Files changed (grouped):**
- Config: `packages/config/src/index.ts` (+ test) — `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` env schema.
- DB: `packages/db/src/schema/auth.ts`, `migrate.ts`, `migrate-cli.ts`, `drizzle.config.ts`, generated `drizzle/0000_*.sql`, `Dockerfile`, `index.ts`/`package.json`/`tsconfig.json` wiring.
- Web auth: `lib/auth.ts`, `lib/sign-up-gate.ts`, `lib/auth-client.ts`, `app/api/auth/[...all]/route.ts`, `middleware.ts` (gate + correlation-ID preserved).
- Shell/surface: `app/(app)/layout.tsx`, `components/side-nav.tsx`, `components/sign-out-button.tsx`, four placeholder pages, `app/page.tsx` redirect, `app/sign-in/{page,sign-in-form}.tsx`.
- Theme: `app/layout.tsx` (fonts), `app/globals.css` (light tokens + focus ring), `css.d.ts`.
- Env/dev: `.env.example`, `docker-compose.yml` (one-shot `migrate` service gating web/worker).
- Tests: middleware auth-gate, sign-up-gate, `globals.css` full-token presence, side-nav landmark/keyboard.
- Incidental (flagged): `packages/planner/src/index.ts` — imported the canonical `ContextSnapshot`/`PolicySet` (AD-2) to fix a pre-existing Story 1.1 cold-cache typecheck break; strengthens, not weakens, the gate.

**Review findings breakdown:** 0 intent_gap, 0 bad_spec. 3 patches applied — (1) tightened middleware `isPublicPath` from `includes('.')` to a known-extension allowlist; (2) sign-in form now surfaces the real server error instead of always claiming an account exists; (3) rewrote the token test to assert all 52 DESIGN light tokens verbatim with selector-scoped type specs. 1 deferred — no DB-level backstop against a TOCTOU sign-up race (recorded in `deferred-work.md`). 17 rejected as noise / by-design / invalid (optimistic-middleware-by-design, negligible single-user perf, UX-deferred forced-colors & reduced-motion floors, and disproven claims: `.env.example` supplies a valid 38-char secret, the `before`-hook `false` abort is confirmed in better-auth source, and the sign-in button pairing matches DESIGN's `button-approve` spec).

**Verification:** `npm run typecheck` → exit 0; `npm run lint` → exit 0 (AD-1 / no-process-env / jsx-a11y fixtures still fail-closed, 5/5 fixture checks); `npm test` → 119 passed / 16 files (token test alone: 57 assertions confirming byte-identical fidelity, 0 mismatches vs DESIGN.md). Docker runtime not executed in this run; the auto-migrate compose wiring is verified statically.

**Residual risks:** (1) the deferred single-user TOCTOU race (practically unreachable for one operator); (2) docker `compose up` end-to-end sign-in path verified by configuration + gates, not by a live container run; (3) nav icons are placeholder glyphs pending the Material Symbols system; (4) worker/migrate compose fallback secret is dev-only — set a real `BETTER_AUTH_SECRET` before any non-dev use.
