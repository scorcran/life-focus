---
title: 'Story 1.4: Connect Both Google Calendars with Context Assignment'
type: 'feature'
created: '2026-07-14'
status: 'done'
baseline_revision: '83aae1777d3d9da18a3fcf66bafa1619c2c7fd0c'
final_revision: '1919134cc75572e10fb376edfb91bdbc2fb84217'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** The connector layer is a stub (`createGcalConnector` returns `{ accountId }`) and no calendar data can enter the system. Story 1.5's agenda view needs the user's real work and personal Google Calendars flowing into context-tagged, safe-to-rebuild source-mirror tables — with the privacy seam (AD-5/AD-6) intact from the first connection and sync failures disclosed, never silent (AD-7/FR-62).

**Approach:** Add a Google Calendar OAuth **data-source** connection flow (distinct from Better Auth sign-in): a connections screen where the user picks `work` or `personal` **before** the connection saves (AD-6, immutable), read-only calendar scope, tokens stored encrypted. Connected sources land in mutable `calendar_source` (operational: tokens, sync cursor, health) + `calendar_event_mirror` (AD-7 cache) tables; the connect and each sync-health outcome are recorded as AD-4 ledger events (`CalendarConnected`, `CalendarSynced`, `CalendarSyncFailed`). A pure gcal connector adapter (`packages/connectors/gcal`) normalizes Google events (recurring/all-day/timezone-DST per ADD-2) behind an injected HTTP client. pg-boss jobs run initial + incremental sync with retry/backoff; a revoked token flips the source to `revoked` and surfaces an in-app disclosure within one sync cycle. Connector failure never mutates or deletes domain rows.

## Boundaries & Constraints

**Always:**
- **AD-6 immutable context.** Context (`work` | `personal`) is chosen at connect time, carried through the OAuth `state`, and is a non-null column on `calendar_source` with a unique `(provider, account, context)` identity. There is **no update path** for context — changing it means a new connection (reconnect). `joint` is illegal on source rows (AD-5).
- **AD-7 cache semantics.** `calendar_event_mirror` and `calendar_source` are cache/operational (safe to drop + rebuild from Google). Calendar sync **never** writes domain state (no `commitment`/ledger domain mutation from calendar data) and **never** deletes or mutates domain rows. Promotion of mirror data into domain state is out of scope (an explicit future command).
- **AD-4 sync-health as events.** Connect and each sync outcome append to `ledger_event` via the existing `LedgerStore.append` (payloads validated once by the ledger catalog): `CalendarConnected`, `CalendarSynced`, `CalendarSyncFailed`. These carry the source's context; they have no sensitive fields and touch no projection (the commitment reducer ignores unknown types).
- **AD-1 direction.** `packages/connectors/gcal` is an adapter: it may import **types** from `ledger`, may do HTTP I/O via an **injected** client, and must **not** import `@life-focus/db` or any host. Google-event **normalization is pure** (no I/O) so the ADD-2 suite runs without network. Hosts (`apps/web`, `apps/worker`) do the wiring. Lint fixture proofs stay green.
- **Read-only + least privilege.** OAuth scope is read-only calendar (`https://www.googleapis.com/auth/calendar.readonly`) only. No write/mutate scopes (AD-8).
- **Secrets & privacy.** OAuth tokens are encrypted at rest under `LEDGER_MASTER_KEY` (reuse `packages/db` crypto). Mirror rows store only planning-necessary fields (id, summary/title, start, end, all-day, status, recurringEventId, updatedAt) — no event bodies, attachments, or attendee PII (NFR-6). New env only through `packages/config`; UUIDv7 ids; ISO-8601 UTC storage; Drizzle over plain Postgres (AD-9).
- **FR-62 disclosure.** A revoked/failed source surfaces an in-app disclosure on the connections screen within one sync cycle, using EXPERIENCE.md degraded-state voice ("Last synced … — reconnect to keep this calendar current"), status conveyed by icon **and** text (never color alone).

**Block If:**
- Delivering the OAuth data-source flow would require replacing or reconfiguring Better Auth's sign-in provider (the two OAuth surfaces must stay separate). HALT `blocked`.
- The mirror/source schema cannot be added through the existing drizzle-kit generate + journal mechanism without a schema-tool change. HALT `blocked`.

**Never:**
- No promotion of calendar events into domain `commitment`/planner state; no planner/policy/LLM logic; no Gmail/Slack/other connectors.
- No second OAuth on Better Auth sign-in; the single app user still signs in with email+password.
- No real Google network calls in the test gate — normalization, OAuth URL/state, sync orchestration, and the sync job all run against injected fakes; Postgres mirror integration tests skip cleanly without Docker/`TEST_DATABASE_URL`.
- Do not weaken Story 1.1/1.2/1.3 gates (AD-1 lint, no-process-env, jsx-a11y, typecheck of tests, ledger insert-only). Do not store tokens in plaintext or in the append-only log.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Connect, context chosen | OAuth callback with valid code + `state{context:'work',nonce}` | `calendar_source` row (unique work identity) with encrypted tokens; `CalendarConnected` appended; initial sync eligible | Missing/altered `state` or nonce mismatch → no save, redirect with error |
| Reconnect same identity | Second connect for existing `(gcal, account, work)` | Refresh tokens + re-activate the **same** source (context unchanged) | Attempt to save a *different* context for same account → new distinct source, never mutates existing |
| Initial sync | Active source, `sync_token IS NULL` | Full list (read-only), normalized rows replace mirror cache, `sync_token` stored, `CalendarSynced{syncType:'initial'}` | Transient HTTP error → pg-boss retry/backoff; exhausted → `CalendarSyncFailed`, no domain change |
| Incremental sync | Active source with `sync_token` | Delta fetched with token; mirror upserted/cancellations removed; new token stored; `CalendarSynced{syncType:'incremental'}` | `410 GONE` (token expired) → clear token + full resync next run |
| Recurring event | Google instances (`singleEvents=true`, `recurringEventId`, `originalStartTime`) | Each instance → one mirror row w/ correct UTC start/end; cancelled instance (`status:'cancelled'`) removed | — |
| All-day event | `start.date`/`end.date` (no time) | Mirror row `allDay=true`, date-only bounds preserved (no spurious tz shift) | — |
| Timezone / DST | `start.dateTime` with offset + `timeZone`, spanning a DST transition | Stored as ISO-8601 UTC; local render correct across the transition | — |
| Revoked token | Sync gets 401 / `invalid_grant` | Source `status='revoked'`, `last_sync_status='failed'`, `CalendarSyncFailed{authError:true}`; connections screen shows reconnect disclosure within one cycle | Never deletes/mutates domain or prior mirror rows |
| OAuth not configured | `GOOGLE_OAUTH_*` unset | Connect action disabled with an explanatory note; app still boots and gates | No throw at startup |

</intent-contract>

## Code Map

- `packages/config/src/index.ts` (+ test) -- add optional `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` / `GOOGLE_OAUTH_REDIRECT_URI` to the zod env schema + an `isGoogleOAuthConfigured(config)` helper.
- `packages/ledger/src/events/catalog.ts` (+ `index.test.ts`) -- register `CalendarConnected`, `CalendarSynced`, `CalendarSyncFailed` payload schemas (`sensitiveFields: []`); export payload types.
- `packages/connectors/src/gcal/types.ts` -- NEW: `MirrorEvent` DTO, `GcalSourceRef`, `HttpClient` port (`(url, init) => Promise<{status, json()}>`), `TokenRevokedError`, `SyncTokenExpiredError`, read-only scope + endpoint constants.
- `packages/connectors/src/gcal/normalize.ts` (+ test) -- NEW **pure**: `normalizeEvent(googleEvent, {context}) → MirrorEvent | { cancelledExternalId } | null`; all-day vs timed, recurring-instance identity, DST-safe UTC conversion — the ADD-2 fixtures.
- `packages/connectors/src/gcal/oauth.ts` (+ test) -- NEW: `buildAuthUrl({clientId, redirectUri, state})`, `exchangeCode(http, {...})`, `refreshAccessToken(http, {...})`, `fetchAccountEmail(http, accessToken)` over the injected `HttpClient`.
- `packages/connectors/src/gcal/sync.ts` (+ test) -- NEW: `syncEvents(http, {accessToken, calendarId, syncToken}) → {events, cancelledIds, nextSyncToken, mode}`; pagination, `410`→`SyncTokenExpiredError`, `401`/`invalid_grant`→`TokenRevokedError`.
- `packages/connectors/src/index.ts` (+ `index.test.ts`) -- replace stub: re-export gcal module; `createGcalConnector` returns a real client-backed connector.
- `packages/db/src/schema/mirror.ts` -- NEW Drizzle tables: `calendar_source` (id, provider, account, context CHECK work|personal, google_calendar_id, status, wrapped tokens, sync_token, last_synced_at, last_sync_status, last_error, created_at; UNIQUE(provider,account,context)) and `calendar_event_mirror` (id, source_id FK, context, external_id, summary, starts_at, ends_at, all_day, status, recurring_event_id, updated_at; UNIQUE(source_id, external_id)). Export `mirrorSchema`.
- `packages/db/drizzle/0003_*.sql` + `meta/*` -- generated migration for the two mutable tables (no triggers).
- `packages/db/src/mirror/token-cipher.ts` (+ test) -- NEW: `encryptSecret`/`decryptSecret` under `LEDGER_MASTER_KEY` (reuse `crypto.ts`).
- `packages/db/src/mirror/store.ts` (+ integration test) -- NEW `createMirrorStore(client, {masterKey, ledger})`: `connectSource`, `listSources`, `getSource`, `getDecryptedTokens`, `updateAccessToken`, `replaceMirrorEvents`, `recordSyncSuccess`, `recordSyncFailure`, `readMirrorEvents(context)` — appends the AD-4 events via injected `LedgerStore`; context immutable; context-separated reads.
- `packages/db/src/index.ts` -- export `mirrorSchema` + `createMirrorStore`; add tables to client schema.
- `apps/worker/src/gcal-sync.ts` (+ test) -- NEW: `runGcalSync(deps, sourceId)` (thin over connector + mirror store; success→replace+recordSuccess, `TokenRevokedError`→recordFailure(authError), `SyncTokenExpiredError`→clear token) and `registerGcalSync(boss, deps)` (queue with `retryLimit`/`retryBackoff`; scheduled fan-out enqueuing one job per active source).
- `apps/worker/src/index.ts` -- wire `registerGcalSync` into `main()`.
- `apps/web/src/lib/stores.ts` -- NEW host wiring: build db client + `LedgerStore` + `MirrorStore` from `loadConfig()`.
- `apps/web/src/lib/gcal-oauth-state.ts` (+ test) -- NEW **pure**: sign/verify opaque `state` (context + CSRF nonce).
- `apps/web/src/app/(app)/settings/connections/page.tsx` -- NEW connections screen: lists sources (context tag, last-sync time, status disclosure) + Connect work / Connect personal.
- `apps/web/src/app/(app)/settings/connections/actions.ts` -- NEW server action `startGoogleConnect(context)`: guard config, set nonce cookie, redirect to Google consent; disabled note when unconfigured.
- `apps/web/src/app/api/connections/google/callback/route.ts` -- NEW OAuth callback: verify state+nonce, exchange code, resolve account email, `connectSource`, redirect back; error→redirect with message.
- `apps/web/src/components/side-nav.tsx` (+ test) -- add a Settings entry (icon + `label-caps`, `:focus-visible` ring) in the rail footer; primary 4-tab set unchanged.
- `.env.example`, `docker-compose.yml` -- add empty `GOOGLE_OAUTH_CLIENT_ID` / `_SECRET` / `_REDIRECT_URI` for web + worker.

## Tasks & Acceptance

**Execution:**
- [x] `packages/config/src/index.ts` (+ test) -- add optional `GOOGLE_OAUTH_*` env + `isGoogleOAuthConfigured` -- creds via typed config only; app boots without them
- [x] `packages/ledger/src/events/catalog.ts` (+ test) -- register `CalendarConnected` / `CalendarSynced` / `CalendarSyncFailed` -- AD-4 sync-health facts validated once in core
- [x] `packages/connectors/src/gcal/{types,normalize}.ts` (+ normalize test) -- pure DTO + normalization -- ADD-2 recurring/all-day/DST cases without network
- [x] `packages/connectors/src/gcal/{oauth,sync}.ts` (+ tests) -- OAuth + sync orchestration over injected `HttpClient` -- read-only scope, 410/401 handling, testable via fakes
- [x] `packages/connectors/src/index.ts` (+ test) -- replace stub, export gcal, real `createGcalConnector` -- AD-1 adapter, no db/host import
- [x] `packages/db/src/schema/mirror.ts` + client wiring + `drizzle/0003_*` -- `calendar_source` + `calendar_event_mirror` tables (unique identity, mutable) -- AD-6 identity, AD-7 cache
- [x] `packages/db/src/mirror/token-cipher.ts` (+ test) -- encrypt/decrypt tokens under master key -- no plaintext secrets at rest
- [x] `packages/db/src/mirror/store.ts` (+ integration test) -- `createMirrorStore` (connect, sync-record, mirror replace, context-separated reads, appends AD-4 events) -- the adapter owning mirror + source state
- [x] `apps/worker/src/gcal-sync.ts` + wire `index.ts` -- `runGcalSync` + `registerGcalSync` (retry/backoff, scheduled fan-out) -- initial + incremental sync as pg-boss jobs
- [x] `apps/web/src/lib/{stores,gcal-oauth-state}.ts` (+ state test) -- host store wiring + signed OAuth state -- CSRF-safe context carrying
- [x] `apps/web/src/app/(app)/settings/connections/{page,actions}.tsx/.ts` + `api/connections/google/callback/route.ts` -- connections screen, connect action, callback -- choose-context-before-save (AD-6), FR-62 disclosure
- [x] `apps/web/src/components/side-nav.tsx` (+ test) -- add accessible Settings nav entry -- reachable connections screen, a11y floor intact
- [x] `.env.example` + `docker-compose.yml` -- add `GOOGLE_OAUTH_*` placeholders -- one-command dev config

**Acceptance Criteria:**
- Given the connections screen, when I OAuth a Google account, then I must select `work` or `personal` before the connection saves; the saved `calendar_source` has that non-null context, a unique `(provider, account, context)` identity, encrypted tokens, and a `CalendarConnected` event is appended — with no code path that mutates a saved connection's context.
- Given a saved source, when initial then incremental sync run as pg-boss jobs, then read-only calendar events land in the context-tagged `calendar_event_mirror` (cache) with a `CalendarSynced` event per run, and no domain/`commitment` row is ever created, mutated, or deleted by sync.
- Given the ADD-2 cases, when `normalizeEvent` processes recurring instances, all-day events, and timezone/DST-transition events, then each produces the correct mirror row (UTC bounds, all-day flag, recurring identity; cancelled instances removed) — proven by pure unit tests that run without Docker or network.
- Given a source whose token is revoked, when the next sync cycle runs and receives 401/`invalid_grant`, then the source flips to `status='revoked'`, a `CalendarSyncFailed{authError:true}` event is appended, domain rows are untouched, and the connections screen shows an in-app reconnect disclosure (icon + text) within that one cycle.
- Given a work-context and a personal-context source, when the mirror is read by context, then a work read never returns personal rows and vice versa (separation holds on the mirror as on the ledger).
- Given the repo, when `npm run typecheck`, `npm run lint`, and `npm test` run, then all pass (Story 1.1/1.2/1.3 gates intact, AD-1 fixtures still fail-closed, ≥1 new test per new concern) without requiring Docker; with Docker/`TEST_DATABASE_URL`, mirror integration round-trips (connect, sync-record, separation, revoke) pass.

## Spec Change Log

_No bad_spec loopback occurred; the intent contract and spec body held through review. All review findings were patches or defers._

## Review Triage Log

### 2026-07-14 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 6: (high 0, medium 4, low 2)
- defer: 6: (high 0, medium 2, low 4)
- reject: 14
- addressed_findings:
  - `[medium]` `[patch]` The OAuth callback redirected connect outcomes to `?connected=`/`?error=` but the connections page never read `searchParams`, so a declined/expired/failed connect returned silently with no user feedback (missed the AC "error → redirect with message"). The page now reads `searchParams` and renders an accessible status/alert banner in EXPERIENCE.md voice. [`apps/web/src/app/(app)/settings/connections/page.tsx`]
  - `[medium]` `[patch]` The degraded-state `aria-label` read "Sync failed — …", the exact phrasing the story's binding Design Note forbids (a11y floor: screen-reader users heard banned copy). Changed to "Needs reconnect — last synced …", mirroring the compliant visible text. [`page.tsx`]
  - `[medium]` `[patch]` The scheduled sweep enqueued per-source sync jobs with no `singletonKey`, so a sync outlasting the 5-min sweep could run concurrently with the next cycle and race the mirror upsert + sync-token write. Added `singletonKey: sourceId` to serialize per source (+ test via a fake boss). [`apps/worker/src/gcal-sync.ts`]
  - `[medium]` `[patch]` `getDecryptedTokens` ran before the sync try-block; a non-transient token-decrypt failure (corrupt ciphertext / rotated master key) escaped uncaught → endless pg-boss retries with no sync-health recorded. Guarded it to record a failure and return without rethrowing (+ test). [`gcal-sync.ts`]
  - `[low]` `[patch]` After reconnecting a revoked source, `lastSyncStatus='failed'` persisted, so the connections screen kept showing the degraded "reconnect" disclosure until the next sweep. Reconnect now resets `lastSyncStatus`/`lastError` and clears `syncToken` (clean full resync) (+ integration test). [`packages/db/src/mirror/store.ts`]
  - `[low]` `[patch]` The calendar sync-health payload schemas allowed `context: 'joint'`, contradicting AD-5 ("joint illegal on source rows"). Tightened the three calendar payloads to `z.enum(['work','personal'])` (+ test rejecting joint). [`packages/ledger/src/events/catalog.ts`]

Deferred (recorded in `deferred-work.md`): (1) source-row writes and their AD-4 sync-health events commit in separate transactions (crash-window audit divergence; needs a composable ledger tx); (2) all-day `endsAt` stores Google's exclusive end date — Story 1.5's renderer must treat it as exclusive; (3) sync refreshes the access token every run ignoring `accessTokenExpiresAt` and drops a rotated `refresh_token`; (4) mirror `startsAt`/`endsAt` are heterogeneous `text` with no read ordering — downstream chronological queries need care; (5) initial full sync sends no `timeMin`, pulling entire account history — a planning window should scope it; (6) `connectSource` select-then-insert is a TOCTOU on the identity under concurrent connects.

Rejected: db→connectors DTO import (lint-clean adapter→adapter, acyclic); `sameSite=lax` (correct/required for the top-level callback GET) + state-expiry (nonce already binds CSRF); unbounded pagination guard (requires Google to violate its pageToken contract); floating `dateTime` without offset and mixed all-day/timed bounds (Google always returns an offset and consistent bounds); null-refresh-on-connect (mitigated by `prompt=consent` + graceful `no_refresh_token` failure); recordSyncFailure-masks-original and non-JSON error body (both fall into the acceptable retry path); Invalid-Date / absurd-`expires_in` (our own writes / Google return valid values); two-tab concurrent connect nonce collision (unusual single-user flow); `verified_email` (own account); full-sync always returns a syncToken (Google contract).

## Design Notes

- **Two separate OAuth surfaces.** Better Auth = the single app user's *sign-in* (email+password, unchanged). This story adds a *data-source* OAuth (authorization-code, read-only calendar) whose tokens live in `calendar_source`, not in Better Auth's `account` table. Keeping them separate avoids conflating "who is logged in" with "which calendars are connected."
- **Ledger events vs. cache reconciliation.** AD-4 governs *domain* state (served from projections). Calendar *event data* and operational fields (tokens, `sync_token`, health) are AD-7 **cache** — not derivable from events (they come from Google/OAuth) — so they live in mutable tables, safe to rebuild. The *facts* "connected with this context" and "sync succeeded/failed" ARE recorded as AD-4 events for the audit trail and sync-health signal. These events have no sensitive fields, so `append` writes them plaintext with `erasureScope=null` and the commitment reducer's default case leaves projections untouched (verified in `store.ts`).
- **Pure normalization = the ADD-2 seam.** Request `singleEvents=true` so Google expands recurrences into instances; `normalizeEvent` then handles instance identity (`recurringEventId`, `originalStartTime`), all-day (`start.date`) vs timed (`start.dateTime` + offset → UTC), and cancellations (`status:'cancelled'` → removal). No network in this module → the DST/all-day/recurring cases are ordinary unit tests. Example:
  ```
  // timed, DST-spanning → UTC ISO
  {start:{dateTime:'2026-03-08T01:30:00-05:00'}} → startsAt '2026-03-08T06:30:00.000Z', allDay:false
  // all-day → date-only, no tz shift
  {start:{date:'2026-07-04'}} → startsAt '2026-07-04', allDay:true
  ```
- **Initial vs incremental as one scheduled job.** `registerGcalSync` schedules a periodic sweep that enqueues one `gcal-sync` job per active source (pg-boss `retryLimit` + `retryBackoff`). Each job runs `runGcalSync`: initial (full) when `sync_token IS NULL`, else incremental with the stored token; `410 GONE` clears the token for a full resync next run. A freshly connected source is therefore synced on the next cycle — satisfying "initial + incremental run as pg-boss jobs" without coupling `apps/web` to job dispatch. "Within one sync cycle" for revocation follows from the same periodic sweep.
- **Token encryption.** Reuse `packages/db/src/ledger/crypto.ts` (`encryptField`/`decryptField`) with the master-key bytes as the data key — no new crypto primitive, tokens never at rest in plaintext.
- **Disclosure copy (EXPERIENCE.md).** Degraded state reads "Last synced {time} — reconnect to keep this calendar current," never "Error"/"Sync failed"; status shown with an icon **and** text (AC a11y floor: never color alone).

## Verification

**Commands:**
- `npm install` -- expected: clean install; lockfile updated if deps added
- `npm run typecheck` -- expected: exit 0 across all workspaces incl. test files
- `npm run lint` -- expected: exit 0; AD-1 / no-process-env / jsx-a11y fixtures still fail-closed (5/5); `packages/connectors` imports no `@life-focus/db`/host
- `npm test` -- expected: Vitest green without Docker (mirror integration suites skip cleanly); ADD-2 normalization, OAuth-state, sync-orchestration, and `runGcalSync` (success + revoked) unit tests pass; with Docker/`TEST_DATABASE_URL`, mirror store round-trips (connect + unique identity, sync-record, context separation, revoke → sync-health) pass
- `docker compose up migrate` (if Docker available) -- expected: `0003` mirror-table migration applies

**Manual checks (if no CLI):**
- Confirm `packages/connectors/src/gcal/normalize.ts` contains no import of `@life-focus/db`, `apps/*`, `pg`, or `pg-boss` (AD-1; pure module).
- Confirm no code path updates `calendar_source.context` after insert (AD-6 immutability).

## Auto Run Result

Status: done

**Implemented change:** Google Calendar data-source connectivity end to end, with the privacy seam intact from the first connection. A connections screen lets the single user OAuth a Google account and choose `work` or `personal` **before** the connection saves; the context is carried in a signed, nonce-protected `state` and is immutable thereafter (AD-6). Read-only calendar scope only (AD-8). A pure gcal connector adapter (`packages/connectors/gcal`) normalizes Google events (recurring instances, all-day, timezone/DST → UTC) behind an injected `HttpClient` — the ADD-2 suite runs with no network. Connected sources live in mutable `calendar_source` (encrypted tokens, sync cursor, health) + `calendar_event_mirror` (AD-7 cache); connect and each sync outcome are recorded as AD-4 ledger events (`CalendarConnected`/`CalendarSynced`/`CalendarSyncFailed`) via the injected `LedgerStore`. A pg-boss scheduled sweep enqueues one per-source sync job (retry/backoff, per-source `singletonKey`) that runs initial-or-incremental sync; a revoked token flips the source to `revoked`, records a sync-health failure, and the connections screen discloses "reconnect" within one cycle (FR-62). Calendar sync never creates, mutates, or deletes domain state.

**Files changed (grouped):**
- Config: `packages/config/src/index.ts` (+ test) — optional `GOOGLE_OAUTH_*` + `isGoogleOAuthConfigured`.
- Ledger (core): `packages/ledger/src/events/catalog.ts` (+ `index.test.ts`) — `CalendarConnected`/`CalendarSynced`/`CalendarSyncFailed` payload schemas (context tightened to work|personal), `index.ts` re-exports.
- Connectors (adapter): new `packages/connectors/src/gcal/{types,normalize,oauth,sync}.ts` (+ 3 tests); rewrote `src/index.ts` (+ test) with a real client-backed `createGcalConnector`; `package.json`/`tsconfig.json`.
- DB (adapter): new `src/schema/mirror.ts`, `src/mirror/{token-cipher,store}.ts` (+ 2 tests), `drizzle/0003_mirror_tables.sql` + snapshot + journal; `src/index.ts` exports; `package.json`/`tsconfig.json`.
- Worker (host): new `src/gcal-sync.ts` (+ test), wired `src/index.ts`; `package.json`/`tsconfig.json`.
- Web (host): new `src/lib/{stores,gcal-oauth-state}.ts` (+ state test), `src/app/(app)/settings/connections/{page.tsx,actions.ts}`, `src/app/api/connections/google/callback/route.ts`; edited `src/components/side-nav.tsx` (+ test); `package.json`/`tsconfig.json`.
- Env/dev: `.env.example`, `docker-compose.yml` (empty `GOOGLE_OAUTH_*` placeholders).

**Review findings breakdown:** 0 intent_gap, 0 bad_spec. 6 patches applied — 4 medium (silent connect-outcome disclosure now rendered; banned "Sync failed" a11y label fixed; per-source `singletonKey` to prevent overlapping syncs; guarded token-decrypt failure so it records health instead of retrying forever) and 2 low (reconnect resets degraded health + forces a clean resync; calendar payload context tightened to reject `joint` per AD-5). 6 deferred to `deferred-work.md` (cross-transaction audit atomicity; all-day exclusive-end downstream contract; expiry-gated refresh + rotated-token persistence; typed/ordered mirror times; bounded initial-sync window; connect-identity TOCTOU). 14 rejected as by-design/noise/mitigated.

**Verification:** `npm run typecheck` → exit 0. `npm run lint` → exit 0 (AD-1 / no-process-env / jsx-a11y fixtures still 5/5 fail-closed; `packages/connectors` imports no `@life-focus/db`/host; `normalize.ts` is pure — type-only imports). `npm test` → 206 passed / 25 files. Docker was available, so the `packages/db` mirror + ledger Postgres integration suites RAN against a live testcontainer (postgres:17): connect + unique `(provider,account,context)` identity, reconnect refreshes the same row with context unchanged and clears degraded health, different context = distinct source, sync-record + `CalendarSynced`, context separation (both directions), revoke → `status='revoked'` + `CalendarSyncFailed{authError:true}` with domain rows untouched, tokens encrypted at rest. Unit proofs (ADD-2 normalization: recurring/all-day/DST; OAuth URL + signed state CSRF; sync 410/401 handling; `runGcalSync` success/revoked/410/transient/decrypt-failure; sweep singletonKey; catalog joint-reject) all run without Docker.

**Residual risks:** (1) The six deferred items — all real but low-probability for a single-user MVP (crash-window audit divergence; downstream all-day-end and mirror-ordering contracts that Story 1.5 must honor; token-refresh efficiency; unbounded initial-sync window; connect TOCTOU) — tracked in `deferred-work.md`. (2) Integration suites skip cleanly without Docker/`TEST_DATABASE_URL`; on a Docker-less CI the mirror DB guarantees would be unverified by the gate (they ran and passed here). (3) The OAuth flow is exercised only against injected fakes — no live Google round-trip was performed; real client credentials and redirect URI must be provisioned before the connect flow works against production Google. (4) `GOOGLE_OAUTH_*` are unset by default, so the connect action stays disabled until an operator configures them.
