---
title: 'Story 1.5: See My Real Days'
type: 'feature'
created: '2026-07-14'
status: 'done'
baseline_revision: '7354f79d977ad2a949deacecc18a903bdf9f2b09'
final_revision: '60e50618964e8d13dc04ae6f0e94da64b888f954'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-life-focus-2026-07-12/EXPERIENCE.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** Story 1.4 landed real Google Calendar events in the context-tagged `calendar_event_mirror`, but nothing surfaces them. The `/today` route is still a placeholder, so the steel thread is unproven: a user cannot yet see their actual day, correctly tagged, with honest sync status. Story 1.5 closes the loop.

**Approach:** Turn `/today` into a read-only agenda that reads today's events from **both** contexts through the existing `MirrorStore`, composes them into one joint, planning-layer view, and renders each event with a work/personal tag and DST-correct local time plus a per-source last-sync disclosure. Because the view is a cross-context join, every included context is output into `'joint'` through the existing broker so an audit row is written (AC-14); per-context reads keep work and personal separate (SEC-1). No planner, no writes to domain state.

## Boundaries & Constraints

**Always:**
- Read-only surface: the ONLY write is the broker's `CrossContextAccessAudited` audit event. No mirror rows, domain rows, or new event types are created/mutated/deleted.
- Every context whose events appear in the joint view emits `checkCrossContextOutput(ledger, context, 'joint', {isPlanningArtifact: true})` → allowed + audited (AC-14). Never call a direct `work`→`personal` output.
- Read each context only via `mirror.readMirrorEvents(context)`; separation is structural, never assumed (SEC-1).
- Local times are DST-safe via `Intl.DateTimeFormat` with an IANA `timeZone` from typed config — no manual offset math. All-day `endsAt` is treated as **exclusive** (spec-1-4 deferred contract). Heterogeneous `text` times (all-day = `YYYY-MM-DD`, timed = UTC ISO) are normalized for ordering.
- Status shown by icon + text, never color alone; degraded framing uses the EXPERIENCE.md "Last synced …" voice — never "Error"/"Sync failed", in visible text or `aria-label`.
- Env access only through `@life-focus/config`. AD-1 direction: the web host may import `broker`/`db`/`ledger`; the pure agenda-shaping module imports no I/O (no `db`, `pg`, host, or `next`).

**Block If:**
- A required cross-context audit cannot be emitted through the existing broker + `LedgerStore` without introducing a new event schema (would signal the AC-14 seam moved).

**Never:**
- No planner, Plan-Intelligence panel, timeline rail, confidence chips, or "Modify Plan" affordances — there is no planner/LLM in Epic 1; those arrive in Epic 4. This is a plain agenda list.
- No calendar bodies/attachments or any field beyond what already lands in the mirror (NFR-6).
- No dark-mode tokens (Epic 13). No new ledger event types beyond the existing catalog.

## I/O & Edge-Case Matrix

Applies to the pure `shapeAgenda(events, { timeZone, now })`:

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Timed event today | `startsAt` UTC ISO on today's local date, `allDay:false` | Included, formatted local `HH:MM`, context tag | No error |
| All-day event today | `startsAt`/`endsAt` date-only, today's local date ∈ `[startsAt, endsAt)` | Included, shown as "All day", no tz shift | No error |
| All-day exclusive end | `endsAt = 'YYYY-MM-DD'` = the day after | Not shown on the end date | No error |
| DST-transition day | Timed event 2026-03-08 (US spring-forward), start `-05:00` / end `-04:00` | Local time correct across the gap | No error |
| Event not today | Local start/coverage on another date | Excluded from the view | No error |
| Mixed-context list | Work + personal events for today | Merged, chronologically ordered, each tagged | No error |
| Cancelled/removed | (Already removed from mirror by 1.4) | Absent — nothing to render | No error |

</intent-contract>

## Code Map

- `packages/config/src/index.ts` (+ test) -- add optional `APP_TIMEZONE` (IANA string) to the zod env schema, default `America/New_York` (matches the DST fixtures' US-Eastern offsets); export via typed config for render-time local conversion.
- `apps/web/src/lib/agenda.ts` (+ test) -- NEW **pure**: `shapeAgenda(events, { timeZone, now }) → { items: AgendaItem[] }` — filter to today in `timeZone`, order across heterogeneous `text` times, DST-safe local-time formatting via `Intl.DateTimeFormat`, all-day exclusive-end handling, carry the per-event context tag. The render-side ADD-2 seam; no I/O.
- `apps/web/src/lib/sync-disclosure.ts` (+ test) -- NEW: extract the source→`{icon,label,text}` degraded-voice helper (currently inline in `settings/connections/page.tsx`) so the banned-copy-sensitive logic lives once and both surfaces reuse it (icon + text; never "Error"/"Sync failed").
- `apps/web/src/app/(app)/settings/connections/page.tsx` -- refactor to import `syncDisclosure`/`formatSyncTime` from the shared module (no behavior change).
- `apps/web/src/lib/agenda-data.ts` (+ integration test) -- NEW: `loadAgenda({ mirror, ledger }, { now, timeZone }) → { items, sources }` — reads `readMirrorEvents('work')` + `readMirrorEvents('personal')` (SEC-1), emits `checkCrossContextOutput(ledger, ctx, 'joint', { isPlanningArtifact: true })` per context that contributes to the view (AC-14), merges then delegates ordering/formatting to `shapeAgenda`; also returns `listSources()` for per-source disclosure.
- `apps/web/src/app/(app)/today/page.tsx` -- REWRITE: server component (`export const dynamic = 'force-dynamic'`); calls `loadAgenda` with `getStores()` + `loadConfig().APP_TIMEZONE`; renders the agenda list (context tag + local time per event), per-source last-sync disclosure, and an empty state — all in EXPERIENCE.md voice, `role="status"`/`aria-live="polite"` for the sync-health region, a11y floor intact.

## Tasks & Acceptance

**Execution:**
- [x] `packages/config/src/index.ts` (+ test) -- add optional `APP_TIMEZONE` env (default `America/New_York`) -- single-user render tz via typed config; app boots without it
- [x] `apps/web/src/lib/agenda.ts` (+ test) -- pure `shapeAgenda`: today-filter, order, DST-safe local format, all-day exclusive end -- proves the I/O matrix without Docker or network
- [x] `apps/web/src/lib/sync-disclosure.ts` (+ test) + refactor `settings/connections/page.tsx` to import it -- degraded-voice disclosure in one place -- no banned-copy drift, DRY
- [x] `apps/web/src/lib/agenda-data.ts` (+ integration test) -- `loadAgenda`: per-context reads (SEC-1) + per-context joint audit (AC-14) + merge -- the cross-context seam, DB-verified
- [x] `apps/web/src/app/(app)/today/page.tsx` -- rewrite to render the read-only agenda + per-source sync disclosure + empty state -- the steel-thread surface, a11y floor intact

**Acceptance Criteria:**
- Given both calendars are synced, when I open `/today`, then today's events from both contexts render as one chronologically ordered list, each with a `work`/`personal` tag and a DST-correct local time, and each connected source shows its last-sync time.
- Given the agenda composes work + personal into one joint view, when it loads, then a `CrossContextAccessAudited` event is appended for each context included (AC-14) — proven by an automated test — and a `readMirrorEvents('work')` call never returns personal rows and vice versa (SEC-1) — proven by a separation test.
- Given a source whose last sync failed or whose token was revoked, when I open the agenda, then that source shows the "Last synced … — reconnect to keep this calendar current" degraded framing with an icon and text (never "Error"/"Sync failed", never color alone, in visible text or `aria-label`).
- Given no connected sources or no events today, when I open the agenda, then an empty state renders in EXPERIENCE.md voice with no error framing.
- Given the repo, when `npm run typecheck`, `npm run lint`, and `npm test` run, then all pass (Story 1.1–1.4 gates intact, AD-1 fixtures still fail-closed, ≥1 new test per new concern) without Docker — the pure `shapeAgenda` DST/all-day cases run offline; with Docker/`TEST_DATABASE_URL`, the `loadAgenda` integration test proves the AC-14 audit rows and SEC-1 separation.

## Spec Change Log

_No bad_spec loopback occurred; the intent contract and spec body held through review. All review findings were patches, defers, or rejects._

## Review Triage Log

### 2026-07-14 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 3: (high 0, medium 1, low 2)
- defer: 3: (high 0, medium 1, low 2)
- reject: 15
- addressed_findings:
  - `[medium]` `[patch]` The `/today` page's `catch {}` collapsed every load failure into `{items:[], sources:[]}`, so a transient mirror/DB read error rendered the "Connect your calendars…" / "No calendars connected yet." copy — an actively false statement on the flagship trust surface. Added a `loadFailed` flag and a pure `agendaEmptyNotice({loadFailed, hasSources})` helper (+ tests) that routes a failure to an honest degraded notice in EXPERIENCE.md voice (never "Error"/"Sync failed"); the sync region likewise no longer claims "no calendars connected" on failure. [`apps/web/src/lib/agenda.ts`, `apps/web/src/app/(app)/today/page.tsx`]
  - `[low]` `[patch]` `shapeAgenda`'s all-day branch lacked the NaN/format guard its timed branch has, so a single malformed all-day date made `addDays`→`toISOString` throw `RangeError` and crash the entire agenda (into the false-empty state above). Added a `DATE_ONLY` guard that skips a malformed all-day row (symmetric with the timed skip) plus a defensive Invalid-Date guard in `addDays` (+ test). [`apps/web/src/lib/agenda.ts`]
  - `[low]` `[patch]` `formatSyncTime` returned a raw "Invalid Date" string to the UI for a malformed timestamp. Now falls back to the same honest "not yet synced" phrasing (+ test). [`apps/web/src/lib/sync-disclosure.ts`]

Deferred (recorded in `deferred-work.md`): (1) declined / attendee-response events render as attended — the mirror stores no attendee response (NFR-6 minimal fields), beyond the Epic-1 steel thread; (2) `formatSyncTime` renders the last-sync time in the server's timezone/locale (`toLocaleString()` with no args), not `APP_TIMEZONE` — pre-existing from story 1.4's connections page, now also visible on the tz-explicit `/today`; (3) `loadAgenda`'s per-context audits are non-atomic — if the second context's read/audit throws after the first is appended, an orphaned audit row persists (same class as spec-1-4's deferred cross-transaction audit-atomicity item).

Rejected: broker `allowed` verdict discarded (joint + `isPlanningArtifact` is definitionally allowed; enforcing it adds an unreachable branch); empty-but-connected context emits no audit (correct — nothing from it is output into the joint view, so no cross-context output occurred); per-view audit growth on every GET (AD-4/AC-14 mandate an audit row per cross-context read/emit — by design); DST test has no failing "naive" twin and audit-count test uses `.slice(-2)` (test-quality nits; vitest runs a file serially); SEC-1 test targets the store not the merge (the merge's context tagging is already covered by the `loadAgenda` "both contexts, each row tagged" test); cross-source dedup / ADD-3 (out of scope for the Epic-1 read-only thread); all-day alphabetical tie-break and `en-US`/`hour12` formatting (cosmetic; single US-Eastern user); `addDays` coercing `end<start` to a single day (reasonable fallback for a read-only view); broker `"*"` version (monorepo workspace convention); `role="status"`/`aria-live` on server-rendered content (harmless semantic marker); two-sources-same-`id` React key (source ids are unique UUIDv7); `APP_TIMEZONE` `EST`/`UTC` abbreviation accepted (can't require a `/` — `UTC` is valid) and empty-string `APP_TIMEZONE` (verified `Intl` rejects `''` → config fails fast).

## Design Notes

- **Read-only agenda, not the full Today surface.** Epic 1 has no planner or LLM, so `/today` here is a plain list of today's mirror events — deliberately not the timeline-rail + Plan-Intelligence panel + confidence chips that EXPERIENCE.md describes for the eventual Today surface (that needs the Epic 4 planner). Story 1.5 proves only the steel thread: real events flow, are correctly context-tagged, with honest per-source sync status.
- **AC-14 seam = joint planning artifact.** The combined view is a planning-layer artifact, so each contributing context is *output into* `'joint'`: `checkCrossContextOutput(ledger, 'work', 'joint', {isPlanningArtifact:true})` and the same for `'personal'` → both `allowed` and both write a `CrossContextAccessAudited` audit row. A direct `work`→`personal` output is never requested (it would be blocked). SEC-1 separation is structural: each context is fetched by its own `readMirrorEvents(context)`; the view merges already-separated lists.
- **Heterogeneous times + DST.** Mirror times are `text`: all-day = `YYYY-MM-DD` (end exclusive), timed = UTC ISO. `shapeAgenda` normalizes to comparable instants for ordering and formats local times with `Intl.DateTimeFormat(locale,{timeZone})` — DST-safe, no offset arithmetic. Honors spec-1-4's deferred contracts (all-day exclusive end; ordered heterogeneous text). Fixture example:
  ```
  // US spring-forward day, timed → local render
  { startsAt:'2026-03-08T14:30:00.000Z', allDay:false }  // tz America/New_York → "9:30 AM"
  // all-day → date-only, no shift, exclusive end
  { startsAt:'2026-07-04', endsAt:'2026-07-05', allDay:true } // shows on Jul 4 only, "All day"
  ```
- **Timezone source.** No life-model exists yet (Epic 2 onboarding), so the single user's tz is `APP_TIMEZONE` in typed config (default `America/New_York`, matching the DST fixtures' `-05:00`/`-04:00` offsets), applied at render only per the epic-context time rule.
- **Degraded voice reuse.** The source→disclosure mapping already exists inline on the connections page and is copy-sensitive (must never say "Error"/"Sync failed"). Extract it to `sync-disclosure.ts` so both surfaces share one implementation and can't diverge.

## Verification

**Commands:**
- `npm run typecheck` -- expected: exit 0 across all workspaces incl. test files
- `npm run lint` -- expected: exit 0; AD-1 / no-process-env / jsx-a11y fixtures still fail-closed; `apps/web/src/lib/agenda.ts` imports no `@life-focus/db`, host, `pg`, or `next` (pure)
- `npm test` -- expected: Vitest green without Docker (integration suites skip cleanly); `shapeAgenda` today-filter / DST / all-day-exclusive-end cases pass; with Docker/`TEST_DATABASE_URL`, the `loadAgenda` integration test asserts a `CrossContextAccessAudited` row per context (AC-14) and context separation (SEC-1)

**Manual checks (if no CLI):**
- Confirm `apps/web/src/lib/agenda.ts` has no import of `@life-focus/db`, `apps/*`, `pg`, `pg-boss`, or `next/*` (AD-1; pure module).
- Confirm `/today` renders no "Error"/"Sync failed" copy for a degraded source (visible text and `aria-label`).

## Auto Run Result

Status: done

**Implemented change:** The read-only `/today` agenda that closes the Epic-1 steel thread. It reads today's events from BOTH the work and personal calendar mirrors (populated by story 1.4), composes them into one joint, planning-layer view, and renders each event with a `work`/`personal` context tag and a DST-correct local time, plus a per-source last-sync disclosure. The combined view is a cross-context join, so each contributing context is output into `'joint'` through the existing broker — appending a real `CrossContextAccessAudited` audit row (AC-14). Work/personal separation is structural: each context is read by its own `readMirrorEvents(context)` (SEC-1). Local times use `Intl.DateTimeFormat` with an IANA `APP_TIMEZONE` (no offset math, DST-safe); all-day `endsAt` is honored as exclusive; the mirror's heterogeneous `text` times are normalized for ordering. The only write is the audit event — no domain or mirror state is created, mutated, or deleted.

**Files changed (grouped):**
- Config: `packages/config/src/index.ts` (+ test) — optional IANA `APP_TIMEZONE` (default `America/New_York`), `Intl`-validated.
- Web (pure): new `apps/web/src/lib/agenda.ts` (+ test) — `shapeAgenda` (today-filter, DST-safe local format, all-day exclusive-end, ordering) + `agendaEmptyNotice` (honest empty/degraded copy).
- Web (host): new `apps/web/src/lib/agenda-data.ts` (+ Postgres integration test) — `loadAgenda` (per-context reads = SEC-1, per-context joint audit = AC-14, merge).
- Web (shared): new `apps/web/src/lib/sync-disclosure.ts` (+ test) — degraded-voice disclosure extracted from the connections page and reused by both surfaces.
- Web (surfaces): rewrote `apps/web/src/app/(app)/today/page.tsx` (agenda + per-source disclosure + honest empty/degraded states); `settings/connections/page.tsx` imports the shared disclosure (behavior-identical); `apps/web/package.json` + `tsconfig.json` add the `@life-focus/broker` dep/reference.

**Review findings breakdown:** 0 intent_gap, 0 bad_spec. 3 patches applied — 1 medium (a transient load failure no longer renders the false "no calendars connected" copy on the flagship trust surface; routed through a tested `agendaEmptyNotice` helper) and 2 low (the all-day path is now NaN-guarded so one malformed row can't crash the whole agenda; `formatSyncTime` no longer leaks "Invalid Date"). 3 deferred to `deferred-work.md` (declined-event rendering; server-tz `formatSyncTime`; non-atomic per-context audit). 15 rejected as by-design/noise/verified-non-issue (incl. empty-string `APP_TIMEZONE`, which `Intl` rejects → config fails fast).

**Verification:** `npm run typecheck` → exit 0. `npm run lint` → exit 0 (AD-1 / no-process-env / jsx-a11y fixtures still 5/5 fail-closed; `agenda.ts` is pure — zero imports). `npm test` → 235 passed / 28 files. Docker/testcontainers was available, so the `loadAgenda` Postgres integration test RAN (not skipped): it proves a `CrossContextAccessAudited` row is appended per contributing context with `targetContext:'joint'`, `allowed:true`, `isPlanningArtifact:true` (AC-14), and that `readMirrorEvents('work')` never returns the personal row and vice versa (SEC-1). Pure proofs (DST spring-forward + pre-gap, all-day exclusive-end, multi-day spans, local-midnight boundaries, non-US timezone, malformed-row skip, empty/degraded notices) run without Docker.

**Residual risks:** (1) The three deferred items — declined-event fidelity, last-sync timestamp shown in server tz, and non-atomic audit — all real but low-consequence for a single-user MVP; tracked in `deferred-work.md`. (2) On a Docker-less CI the AC-14/SEC-1 integration guarantees would be unverified by the gate (they ran and passed here). (3) The agenda audits a cross-context read on every `/today` GET (append-only ledger grows with viewing) — this is the mandated AC-14 behavior, not a defect. (4) `APP_TIMEZONE` accepts non-slash zone names like `EST`/`UTC`; the single operator is expected to set a proper IANA zone (default is `America/New_York`).
