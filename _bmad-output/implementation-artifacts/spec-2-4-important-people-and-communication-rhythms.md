---
title: 'Important People and Communication Rhythms'
type: 'feature'
created: '2026-07-14'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: '113edfeccd95b2e89897cd99e62f744144695424'
final_revision: '031ccc8f9feb64a54856e6b4802c689dbd3a1924'
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-life-focus-2026-07-12/EXPERIENCE.md'
warnings: ['oversized']
---

<intent-contract>

## Intent

**Problem:** Story 2.1 built the onboarding container and 2.2–2.3 filled the `boundaries` and `commitments` steps, but the `people` step is still a generic placeholder (rationale + Continue/Skip). Sean cannot yet name his core people, their relationship intentions and important dates, or attach the one communication rhythm ("call Mom weekly") that gives relationships real planning space from day one (FR-10-lite). No Person event or entity exists anywhere in the ledger.

**Approach:** Fill the `people` step body with a calm capture form + a captured-people list. Each person is **one** additive AD-4 `PersonAdded` event carrying the MVP-lite Person model (name, relationship type, user-asserted importance, optional intention, optional user-asserted important dates, context) plus an **optional embedded weekly communication rhythm**. The projection exposes that rhythm as a `flexible-intention` (the shared protection-level vocabulary from 2.3) linked to the person by `personId`. The list re-renders from the pure `projectPeople` projection — no new table, no migration. The 2.1 container's Continue/Skip (`advanceStep('people', …)`) is reused unchanged and advances to `goals`.

## Boundaries & Constraints

**Always:**
- Persist as append-only events only (AD-4). Add ONE new event type `PersonAdded` (context `work` or `personal`) and its compensating `PersonAddUndone` (`{ personId }` → folds to removed). No UPDATE/DELETE. Host only appends + reads projections (AD-1). Schemas live once in `packages/ledger` catalog and validate via the existing `validateEventPayload` path; the append persists with **zero new projection table and zero migration** — the read seam projects from `readEvents()` in memory (the 2.3-endorsed pattern).
- `PersonAdded` payload (single-source catalog): `personId` (min 1), `name` (min 1), `relationshipType` (min 1 free text), `importance` (`personImportanceEnum`, **required, no default**), `intention` (min-1 string, optional), `importantDates` (array of `{ label:min 1, date }`, optional), `context` (`personContextEnum`), optional `rhythm`, `createdAt`, `updatedAt`. `sensitiveFields: ['name','intention']` (crypto-shredded via the existing seam; the action passes explicit `erasureScope: 'person:'+personId` so the scope is person-precise).
- **No relationship scoring, ever — enforced at the schema level (FR-12 / P5).** The `PersonAdded` schema and `PersonRow` contain NO numeric/rating/rank/health/score field of any kind. `importance` is a user-asserted categorical label from a canonical kebab-cased enum defined **once** in `packages/ledger` (`inner-circle` | `close` | `wider-circle`); it is stored as an opaque string, never computed, ordered, or used to rank people. `importantDates` are user-asserted only — never inferred from message content or any external source (there is no such input in the code path).
- Context is user-chosen per person and restricted to `work` | `personal` at the **schema** (`personContextEnum = z.enum(['work','personal'])`); a person is never `joint`, which keeps the linked plannable rhythm non-joint per AD-5. The action sets both the envelope `context` and the payload `context` to the selected value. Actor is `session.user.id`; routes stay under the authenticated `(app)` shell.
- The communication rhythm is optional and, when present, is `{ frequency: 'weekly', daysOfWeek: Weekday[] }` reusing the canonical `weekdayEnum`/`WEEKDAYS` from 2.3. `daysOfWeek` MAY be empty — an empty set means the flexible "sometime each week" window (this differs from commitment recurrence, which requires ≥1 day). The projection exposes a present rhythm as `{ protectionLevel: 'flexible-intention', frequency: 'weekly', daysOfWeek }` linked by `personId`, so it is projection-queryable as a flexible intention for the Epic-4 ContextSnapshot.
- Current state derives from `projectPeople(readEvents())` (no context filter — people span work + personal). `reducePerson` builds a `PersonRow`; a `PersonAdded` missing a required identity/context/importance value is ignored (never a malformed row); `PersonAddUndone` folds to removed; unknown types pass through (default case), independent of `compensatesEventId` (rebuild purity).
- Presentation copy is host-owned in `apps/web`: a `people-content` catalog maps each importance id → `{ label, meaning }` in EXPERIENCE.md calm voice, plus a rhythm-cadence summary and important-date formatting helper. Importance renders as a distinct non-color marker (`aria-hidden` monochrome glyph) paired with its visible text label — status is NEVER conveyed by color alone.
- Every surface uses `globals.css` design tokens (byte-identical to DESIGN.md) and meets the Epic-1 a11y floor: full keyboard operability, `:focus-visible` rings, labelled/grouped radio + checkbox controls (`fieldset`/`legend`), landmark/labelled sections, and screen-reader-legible name/relationship/importance/dates/rhythm/context text.
- Copy obeys EXPERIENCE.md calm voice: plain-language labels, no guilt/gamification/motivational prompts, no scoring language, forbidden-words list respected. Empty list reads calmly (e.g. "No one added yet.").

**Block If:**
- Persisting people/rhythms/important-dates would require a projection table or migration beyond the additive `PersonAdded` event → HALT (blocked).
- The sensitive-field encryption path cannot encrypt `name`/`intention` through the existing `validateEventPayload` + `LedgerStore.append` seam for the new event (e.g. explicit `erasureScope` is not honored) → HALT (blocked).
- A required token, calm-voice rule, or a11y requirement cannot be satisfied without inventing a new token or breaking byte-identity → HALT (blocked).
- Capturing "importance" cannot be modeled without a numeric/computed score field → HALT (blocked). (It can: use the categorical user-asserted enum.)

**Never:**
- Do NOT build the goals step body (2.5), the Policy & Boundaries settings surface (2.7), or the ≤45-minute assertion / e2e replay (2.6). Do NOT add edit/remove/renegotiation UI for captured people — capture is add-only here, mirroring 2.2/2.3.
- Do NOT add any relationship score, rating, rank, "health," or computed-importance field or logic anywhere. Do NOT infer important dates, meaningful interactions, or life events — user-asserted only. No third-party internal-state reasoning (P5).
- Do NOT add a `joint` context on a person, monthly/interval/RRULE recurrence (weekly-only), a new projection table/migration, or a client-side wizard-state library (stay RSC + server actions + native `<form>`). No color-only status.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fresh people step | no `PersonAdded` events | empty form; list shows calm empty state | No error expected |
| Add a person with a rhythm | name, relationshipType, `importance: close`, `context: personal`, rhythm weekly `['sun']` | `PersonAdded` persists (`name`/`intention` encrypted); list shows name + relationship + importance label/marker + "Communication rhythm: weekly (Sun)" | — |
| Add a person without a rhythm | name, relationshipType, importance, context; no rhythm | persists; list shows the person, no rhythm line | — |
| Add a person with important dates | + `importantDates [{label:'Birthday', date:'03-14'}]` | persists; list shows "Birthday · Mar 14" (user-asserted) | — |
| Rhythm with no weekday | rhythm enabled, 0 weekdays | persists as a weekly flexible-window rhythm (`daysOfWeek: []` allowed) | — (NOT rejected) |
| Blank name | empty/whitespace name | no append; return to step | Rejected without appending |
| Missing importance | no importance selected | no append; return to step (schema/action rejects) | Rejected without appending |
| Invalid context | context tampered (`joint`/other) | no append; return to step | Rejected without appending |
| Malformed / partial important date | date not `MM-DD`/`YYYY-MM-DD`, or a row with only one of label/date filled | no append; return to step (never silently drop user data) | Rejected without appending |
| No relationship scoring | tampered form adds a `score` field | ignored; nothing scored; `PersonRow` has no numeric metric | Score never stored |
| Undone add present | `PersonAdded` then `PersonAddUndone` | that person absent from the projected list | — |
| Continue / Skip | `advanceStep('people','entered'|'skipped')` | container records step + advances to `goals`; captured people not lost on return | No error expected |

</intent-contract>

## Code Map

- `packages/ledger/src/events/catalog.ts` -- add `PERSON_IMPORTANCE`/`personImportanceEnum`, `personContextEnum` (`work`|`personal`), `importantDateSchema`, `rhythmCadenceSchema` (weekly, `daysOfWeek` may be empty; reuses `weekdayEnum`); add `personAddedPayload` (sensitiveFields `['name','intention']`) + `personAddUndonePayload` (`{personId}`, no sensitive fields) to `EVENT_CATALOG`; export inferred `PersonImportance`/`ImportantDate`/`RhythmCadence` types.
- `packages/ledger/src/events/types.ts` -- add `PersonRow` (id, name, relationshipType, importance, intention `| null`, importantDates, context, `rhythm: { protectionLevel:'flexible-intention', frequency:'weekly', daysOfWeek } | null`, createdAt, updatedAt).
- `packages/ledger/src/projections/person.ts` -- NEW `reducePerson` + `projectPeople` (fold by `personId`; missing required value → ignore; undone → removed; ignore-unknown; rhythm derived as flexible-intention).
- `packages/ledger/src/index.ts` -- re-export the new constants/enums/schemas, `reducePerson`/`projectPeople`, and the `PersonRow`/`PersonImportance`/`ImportantDate`/`RhythmCadence` types.
- `packages/ledger/src/projections/person.test.ts` -- NEW: fold all fields, rhythm present (with + without weekdays) / absent, latest-wins per id, undone → removed, missing importance/name/context → ignored (no untagged/unscored row), ignore-unknown, rebuild purity vs scrambled `compensatesEventId`, and an assertion that no numeric score field exists on `PersonRow`.
- `packages/ledger/src/index.test.ts` -- MODIFY: assert the new person exports resolve.
- `packages/db/src/ledger/store.test.ts` -- MODIFY: add a `PersonAdded` fixture (explicit `erasureScope: 'person:'+id`) + PG-gated test proving `name`/`intention` encrypt at rest and decrypt on `readEvents`, and that append succeeds with no projection table.
- `apps/web/src/lib/onboarding/people.ts` -- NEW read seam: `readPeopleStepData()` over one `readEvents()` → `{ people: projectPeople(events) }`.
- `apps/web/src/lib/onboarding/people-content.ts` -- NEW presentation catalog: per-importance `{ label, meaning, icon }` (calm voice), `rhythmSummary(daysOfWeek)`, `formatImportantDate(date)` + weekday/month labels.
- `apps/web/src/lib/onboarding/people-content.test.ts` -- NEW: one entry per `PERSON_IMPORTANCE` id, distinct non-color icons, calm voice / no forbidden or scoring words, rhythm + date formatting.
- `apps/web/src/app/(app)/onboarding/people-actions.ts` -- NEW `'use server'` `addPerson`: validate name / relationshipType / importance / context; parse optional intention, important-date rows (label+date, format-checked), rhythm (weekly + optional weekdays); append one `PersonAdded` (`actor`, selected `context`, `randomUUID` id, explicit `erasureScope`) then redirect to the step (PRG). Reject invalid input without appending.
- `apps/web/src/components/onboarding/people/person-form.tsx` -- NEW: name input, relationship-type input, importance radio group (each option shows meaning + non-color icon/label), optional intention field, a small fixed set of optional important-date rows (label + date), work/personal context radios, optional communication-rhythm section (weekly + weekday checkboxes), submit.
- `apps/web/src/components/onboarding/people/person-list.tsx` -- NEW: captured rows (name, relationship, importance icon+label, intention if present, important-dates summary, rhythm summary, context) + calm empty state; status by text+shape, never color; no edit/remove.
- `apps/web/src/components/onboarding/people/person-step.test.ts` -- NEW: accessible render — importance options + meanings, non-color icon+label, relationship/intention/date/rhythm/context controls, list + empty state, no scoring language.
- `apps/web/src/app/(app)/onboarding/[step]/page.tsx` -- MODIFY: when `step === 'people'` read `readPeopleStepData()` and render `<PersonForm/>` + `<PersonList/>`; boundaries/commitments branches unchanged; goals keeps the placeholder; Continue/Skip unchanged (advances to `goals`).

## Tasks & Acceptance

**Execution:**
- [x] `packages/ledger/src/events/catalog.ts` -- add importance/person-context enums + important-date + rhythm-cadence schemas; add `personAddedPayload` (sensitiveFields `['name','intention']`) + `personAddUndonePayload`; export inferred types -- single-source catalog with NO score field (AD-4 / FR-12 / P5).
- [x] `packages/ledger/src/events/types.ts` + `projections/person.ts` -- add `PersonRow` + `reducePerson`/`projectPeople` (missing required value → ignore; undone → removed; rhythm derived as flexible-intention linked by personId) -- derived state completeness.
- [x] `packages/ledger/src/index.ts` -- re-export new constants/enums/schemas/types + projection fns -- complete public surface.
- [x] `apps/web/src/lib/onboarding/people.ts` -- `readPeopleStepData()` over one `readEvents()` -- the read seam (AD-1).
- [x] `apps/web/src/lib/onboarding/people-content.ts` -- calm-voice importance catalog (label/meaning/icon) + rhythm & date formatting -- host-owned copy.
- [x] `apps/web/src/app/(app)/onboarding/people-actions.ts` -- `addPerson` appends a catalog-valid `PersonAdded` (selected `context`, explicit `erasureScope`); rejects blank name / missing importance / bad context / partial-or-malformed important date without appending -- the write seam (AD-1).
- [x] `apps/web/src/components/onboarding/people/person-form.tsx` + `person-list.tsx` -- capture form (importance radios with meanings + non-color icons, relationship, intention, important-date rows, context, optional weekly rhythm) and captured-people list with empty state -- the filled step body.
- [x] `apps/web/src/app/(app)/onboarding/[step]/page.tsx` -- render the people body for `people`; keep boundaries/commitments/goals + Continue/Skip -- wiring.
- [x] `packages/ledger/src/projections/person.test.ts`, `apps/web/src/components/onboarding/people/person-step.test.ts`, `apps/web/src/lib/onboarding/people-content.test.ts` -- cover the I/O matrix + accessible rendering + catalog completeness + the no-score-field guarantee.
- [x] `packages/ledger/src/index.test.ts`, `packages/db/src/ledger/store.test.ts` -- assert new exports resolve; add a `PersonAdded` append fixture proving `name`/`intention` encryption + no-table persistence.

**Acceptance Criteria:**
- Given the people step, when I add a person with a name, relationship type, an importance, a context, and (optionally) an intention, important dates, and a weekly communication rhythm, then a `PersonAdded` event persists and returning to the step lists the person with those attributes and, when set, the rhythm rendered as a weekly communication rhythm.
- Given FR-12 / P5, when any people surface or the ledger schema is inspected, then there is no relationship score/rating/rank/health field anywhere, importance is a user-asserted categorical label, and important dates are user-asserted only (never inferred).
- Given required fields, when I submit without a name, without an importance, with an invalid context, or with a partial/malformed important date, then nothing is appended and no malformed or untagged person is created.
- Given I have added (or skipped) people, when I choose Continue or Skip, then the 2.1 container records the step and advances to `goals` unchanged, and nothing I entered is lost on return.
- Given every people surface, when it renders, then it uses only `globals.css` tokens and is fully keyboard operable with visible focus rings, grouped/labelled controls, non-color status markers, and screen-reader-legible name/relationship/importance/dates/rhythm/context text.

## Spec Change Log

_No spec amendments — the review produced no intent_gap or bad_spec findings._

## Review Triage Log

### 2026-07-14 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 1, low 1)
- defer: 1: (high 0, medium 0, low 1)
- reject: 20
- addressed_findings:
  - `[medium]` `[patch]` `importantDateSchema` validated date *shape* only (`/^(\d{4}-)?\d{2}-\d{2}$/`), so impossible dates (`13-45`, `02-31`, `04-31`, `99-99`, `00-00`) passed and were appended — a direct deviation from the I/O-matrix "malformed date → rejected without appending." Added a calendar-validity `.refine()` (month 1–12, day within the month's real length; Feb allows 29 so a leap-day birthday is accepted as a bare `MM-DD`), so impossible dates now reject at append AND are dropped by the projection's re-validation. Locked with rejection assertions in `index.test.ts`.
  - `[low]` `[patch]` the two P5 scoring-word test lists diverged — `person-step.test.ts` used `['score','rating','ranked','health']` (missing `rank`, `grade`) while `people-content.test.ts` used the fuller `['score','rating','rank','ranked','health','grade']`, so the rendered component copy was guarded by a weaker list than the catalog copy. Aligned `person-step.test.ts` to the full list so the same complete guard covers both surfaces.

## Design Notes

Why one `PersonAdded` event with an embedded rhythm rather than two events: the rhythm is an attribute *of the person* (one rhythm per core person, FR-10-lite), so one additive event keeps the projection a single fold and avoids a join. The projection exposes the rhythm as `{ protectionLevel: 'flexible-intention', … }` — reusing the shared 2.3 protection-level vocabulary — so it is queryable as "a flexible intention linked to that Person" for the Epic-4 ContextSnapshot without a separate entity at MVP.

No score, by construction: FR-12 / P5 forbids relationship scoring "at the schema level." The concrete, testable guarantee is that neither `personAddedPayload` nor `PersonRow` has any numeric/rating/rank/health/score field. `importance` is a user assertion drawn from a small canonical enum of closeness circles (`inner-circle`/`close`/`wider-circle`) stored as an opaque string; the system never computes, orders, or ranks it. Important dates are captured verbatim from the user with no inference source in the code path.

Context is `work`|`personal` at the schema (`personContextEnum`), not the broader `contextEnum`: a person is never `joint`, which keeps the linked plannable rhythm non-joint per AD-5. The action sets both envelope and payload `context` to the selected value (mirrors the 2.3 dual-write to avoid disagreement).

Rhythm cadence vs commitment recurrence: the rhythm reuses `weekdayEnum` but has its own `rhythmCadenceSchema` because `daysOfWeek` may be **empty** — an empty set is the flexible "sometime each week" window ("call Mom weekly"), whereas commitment recurrence requires ≥1 day. This is deliberate and is why the schemas are not shared.

Persistence with no migration: `LedgerStore.append` applies only the commitment projection table and skips it for any other event type (`commitmentIdOf` returns `null`), so `PersonAdded` inserts cleanly with no new table; the read seam projects from `readEvents()` in memory (the 2.3-endorsed resolution). Sensitive-field encryption is generic off the catalog's `sensitiveFields`, and the action passes an explicit `erasureScope: 'person:'+personId` so a future erase can crypto-shred a specific person.

Icons follow the codebase idiom (no icon font loaded): a monochrome `aria-hidden` glyph paired with a visible text label; the **text label** carries the semantic, so status is never color-only (matches 2.2/2.3).

Add-only capture (no edit/remove) matches 2.2/2.3 and the epic's scope discipline; editing/removing people belongs to the 2.7 Policy & Boundaries surface. `PersonAddUndone` is defined for AD-4 fold-completeness (the compensating-forward-event model) even though no UI emits it yet — 2.7 will.

## Verification

**Commands:**
- `npm run typecheck` -- expected: passes (new payload/row types resolve; new exports type-clean).
- `npm run lint` -- expected: passes, including fixture proofs and AD-1 dependency-direction rules.
- `npm test` -- expected: passes; new person projection/web/catalog tests green and the `PersonAdded` append fixture valid.

**Manual checks:**
- From a fresh account, open `/onboarding/people` keyboard-only: add a person with an importance, an important date, and a weekly rhythm, and another without a rhythm; refresh — both persist with correct attributes; each importance meaning shows at selection; focus rings visible and all attributes legible without color; no scoring language anywhere; Continue advances to `goals`.

## Auto Run Result

Status: done

**Implemented change:** Filled the onboarding `people` step body (Story 2.4). Each core person is one additive `PersonAdded` event carrying the MVP-lite Person model — name, relationship type, user-asserted `importance` (a categorical closeness label — there is **no** score/rating/rank/health field anywhere: FR-12 / P5 enforced at the schema), optional relationship intention, optional user-asserted important dates, and a `work`/`personal` context — plus an **optional embedded weekly communication rhythm**. The projection exposes a present rhythm as a `flexible-intention` (the shared 2.3 protection-level vocabulary) linked to the person by `personId` (FR-10-lite). The list re-renders from the pure `projectPeople` projection — no new table, no migration. `name`/`intention` are crypto-shredded via the existing sensitive-field seam under an explicit `erasureScope: person:${personId}`. The 2.1 container's Continue/Skip (`advanceStep('people', …)`) is untouched and advances to `goals`.

**Files changed:**
- `packages/ledger/src/events/catalog.ts` — `PERSON_IMPORTANCE`/`personImportanceEnum` (`inner-circle`/`close`/`wider-circle`), `personContextEnum` (`work`|`personal`), `importantDateSchema` (shape **+ real-calendar-validity** refine), `rhythmCadenceSchema` (weekly, `daysOfWeek` may be empty = flexible window), `personAddedPayload` (`sensitiveFields: ['name','intention']`) + `personAddUndonePayload`; catalog registration; inferred type exports. No score field anywhere.
- `packages/ledger/src/events/types.ts` — `PersonRow` (rhythm exposed as flexible-intention; no numeric/score field).
- `packages/ledger/src/projections/person.ts` — `reducePerson`/`projectPeople` (fold by `personId`; missing required value → ignored; undone → removed; ignore-unknown; `compensatesEventId`-independent).
- `packages/ledger/src/index.ts` — re-exports the new constants/enums/schemas/types + projection fns.
- `apps/web/src/lib/onboarding/people.ts` — `readPeopleStepData()` read seam over one `readEvents()`.
- `apps/web/src/lib/onboarding/people-content.ts` — calm-voice importance catalog (label/meaning/non-color glyph), `rhythmSummary`, `formatImportantDate`, weekday/month labels.
- `apps/web/src/app/(app)/onboarding/people-actions.ts` — `'use server'` `addPerson` (explicit `erasureScope`; rejects blank name/relationship, missing importance, bad context, partial/malformed important dates without appending; optional rhythm with possibly-empty weekdays).
- `apps/web/src/components/onboarding/people/{person-form,person-list}.tsx` — the accessible capture form and captured-people list (status by text+shape, never color; empty state; add-only).
- `apps/web/src/app/(app)/onboarding/[step]/page.tsx` — renders the people body for `step === 'people'`; boundaries/commitments/goals branches + Continue/Skip unchanged.
- Tests: NEW `packages/ledger/src/projections/person.test.ts`, `apps/web/src/lib/onboarding/people-content.test.ts`, `apps/web/src/components/onboarding/people/person-step.test.ts`; MODIFIED `packages/ledger/src/index.test.ts` (new person exports + impossible-date rejection assertions), `packages/db/src/ledger/store.test.ts` (PG-gated `PersonAdded` encrypt/decrypt/no-table/erase fixture).
- `package-lock.json` — one-line reconciliation adding `@life-focus/broker` (a pre-existing `apps/web` dependency the lockfile was missing; `npm install` corrected it — no new dependency introduced).

**Review findings breakdown:** 2 patches applied — `[medium]` tightened `importantDateSchema` from shape-only to real-calendar validity so impossible dates (`13-45`, `02-31`, `99-99`, …) are rejected at append and dropped by the projection (honoring the I/O-matrix "malformed date → rejected"), locked with rejection assertions; `[low]` aligned the two divergent P5 scoring-word test lists so the rendered component copy is guarded by the same complete list as the catalog. 1 deferred — the PG-gated store fixture does not assert the embedded `rhythm` round-trips through the DB adapter (covered by the projection unit test; logged for when the Postgres suite runs in CI). 20 rejected — mostly patterns the 2.3 review already settled (thin server-action not unit-tested, no free-text max-length convention, projection defensive-narrowing weaker than the schema, speculative erasure-scope hardening), single-user-app non-issues (no actor/tenant scoping — AD-5 has one app user; the unfiltered full-log read mirrors `readCommitmentsStepData` exactly and can't filter to a single `eventType` without breaking undo folding), and by-design choices (empty-weekday flexible rhythm window, add-only capture with no dedup, monochrome glyph + text label, `<h1>` already provided by the step shell). No intent_gap, no bad_spec — no spec amendment or re-derivation.

**Follow-up review recommended:** false — the two review-driven changes are localized and low-consequence (one schema-validation tightening fully covered by new assertions, one test-list alignment), do not change behavior for valid input or any API/data shape, and are fully covered by the gates and tests.

**Verification performed:** `npm run typecheck` PASS; `npm run lint` PASS (5/5 fixture proofs); targeted `vitest run` of the affected suites PASS (`person.test.ts`, `commitment.test.ts`, `index.test.ts`, `people-content.test.ts`, `person-step.test.ts` — 56 tests, incl. the new impossible-date rejections and the aligned scoring-word guard). The full `npm test` suite was confirmed green during implementation (39 files / 336 tests, 3 PG-gated suites skipped); post-patch it exceeds the 2-minute shell limit purely because the Postgres/Docker container probe cannot pull `postgres:17` in this sandbox — an environmental constraint identical for the untouched pre-existing PG suites, not a code failure. All patched files are non-PG and verified green above.

**Residual risks:** Surfaces are pinned to `--light-*` tokens (dark mode deferred to Epic 13 by design). Importance/rhythm markers are labeled monochrome glyphs rather than an icon font (no font loaded — established 2.2/2.3 idiom); the text label carries the semantic, so the a11y floor holds. `readPeopleStepData` projects from the full unfiltered event stream per render (same seam pattern as boundaries/commitments; correct and safe at MVP single-user scale). The PG-gated `PersonAdded` store fixture (and its `name`/`intention` encryption round-trip) did not execute in this sandbox because Postgres could not be started — it is type-checked and will run wherever a real Postgres is reachable; the rhythm round-trip assertion is logged as deferred. The goals step body remains a placeholder pending Story 2.5; re-entry editing and the ≤45-minute proof are Stories 2.6–2.7.
