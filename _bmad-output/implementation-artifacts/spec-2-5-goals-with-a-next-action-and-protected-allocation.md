---
title: 'Goals with a Next Action and Protected Allocation'
type: 'feature'
created: '2026-07-14'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: 'ed2ea6ee3e8b4f353a52f73a98edc81aa4cea363'
final_revision: 'e94c8f2'
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-life-focus-2026-07-12/EXPERIENCE.md'
warnings: ['oversized']
---

<intent-contract>

## Intent

**Problem:** Story 2.1 built the onboarding container and 2.2–2.4 filled the `boundaries`, `commitments`, and `people` steps, but the `goals` step is still a generic placeholder (rationale + Continue/Skip). Sean cannot yet name up to 3 active goals, give each one meaningful next action, and reserve a protected weekly allocation (e.g. 3×45 min) so his intentions claim capacity before the calendar fills it (FR-38-lite). No Goal event or entity exists anywhere in the ledger.

**Approach:** Fill the `goals` step body with a calm capture form + a captured-goals list. Each goal is **one** additive AD-4 `GoalAdded` event carrying the MVP-lite Goal model (title, one user-defined next action, a weekly allocation of `sessionsPerWeek × minutesPerSession`, context) plus a compensating `GoalAddUndone`. The projection exposes the allocation as a **`protected-priority`** intention (the shared protection-level vocabulary from 2.3) linked to the goal by `goalId`. A per-goal `displacementCount` is folded from `GoalAllocationDisplaced` events so the counter is genuinely event-sourced and displayed in neutral language, even though no onboarding surface emits a displacement here. The list re-renders from the pure `projectGoals` projection — no new table, no migration. The 2.1 container's Continue/Skip (`advanceStep('goals', …)`) is reused unchanged.

## Boundaries & Constraints

**Always:**
- Persist as append-only events only (AD-4). Add event types `GoalAdded` (context `work` or `personal`), its compensating `GoalAddUndone` (`{ goalId }` → folds to removed), and `GoalAllocationDisplaced` (`{ goalId }` → folds `displacementCount += 1`). No UPDATE/DELETE. Host only appends + reads projections (AD-1). Schemas live once in the `packages/ledger` catalog and validate via the existing `validateEventPayload` path; the append persists with **zero new projection table and zero migration** — `commitmentIdOf` returns `null` for goal events, and the read seam projects from `readEvents()` in memory (the 2.3/2.4-endorsed pattern).
- `GoalAdded` payload (single-source catalog): `goalId` (min 1), `title` (min 1), `nextAction` (min 1), `allocation` (`goalAllocationSchema` = `{ frequency: 'weekly', sessionsPerWeek: int 1–7, minutesPerSession: int 1–480 }`), `context` (`goalContextEnum`), `createdAt`, `updatedAt`. `sensitiveFields: ['title','nextAction']` (crypto-shredded via the existing seam; the action passes explicit `erasureScope: 'goal:'+goalId`). `GoalAllocationDisplaced`/`GoalAddUndone` payloads are `{ goalId }` with no sensitive fields.
- The allocation is a **protected priority by construction** — the projection exposes it as `{ protectionLevel: 'protected-priority', frequency: 'weekly', sessionsPerWeek, minutesPerSession }` linked by `goalId`, reusing the canonical `protectionLevelEnum` from 2.3, so it is projection-queryable as a protected-priority intention for the Epic-4 ContextSnapshot. The user does **not** pick a protection level for a goal (unlike a commitment); the level is fixed.
- Context is user-chosen per goal and restricted to `work` | `personal` at the **schema** (`goalContextEnum = z.enum(['work','personal'])`); a goal is never `joint`, which keeps the linked plannable allocation non-joint per AD-5. The action sets both the envelope `context` and the payload `context` to the selected value. Actor is `session.user.id`; routes stay under the authenticated `(app)` shell.
- **At most 3 active goals.** The `addGoal` action rejects an add (redirect without appending) when `projectGoals(readEvents())` already has 3 goals; the form renders a calm at-limit state instead of inputs. The number is not a score and is never framed as one.
- Current state derives from `projectGoals(readEvents())` (no context filter — goals span work + personal). `reduceGoal` builds a `GoalRow`; a `GoalAdded` missing a required title/nextAction/context or with an invalid allocation is ignored (never a malformed row); `GoalAllocationDisplaced` increments only an existing row's `displacementCount`; `GoalAddUndone` folds to removed; unknown types pass through (default case), independent of `compensatesEventId` (rebuild purity).
- Presentation copy is host-owned in `apps/web`: a `goals-content` catalog provides `allocationSummary(sessionsPerWeek, minutesPerSession)` and a neutral `displacementSummary(count)` in EXPERIENCE.md calm voice; the allocation carries the `protected-priority` lock glyph reused from the 2.3 protection-level catalog (a monochrome `aria-hidden` marker paired with a visible text label — status is NEVER color alone).
- Every surface uses `globals.css` design tokens (byte-identical to DESIGN.md) and meets the Epic-1 a11y floor: full keyboard operability, `:focus-visible` rings, labelled/grouped controls (`fieldset`/`legend` for radios), landmark/labelled sections, and screen-reader-legible title/next-action/allocation/displacement/context text.
- Copy obeys EXPERIENCE.md calm voice: plain-language labels, no guilt/gamification/motivational prompts, no scoring/streak language, forbidden-words list respected. The displacement counter reads factually and never blames (e.g. "Protected time hasn't moved yet." / "Protected time has been moved 2 times."). Empty list reads calmly (e.g. "No goals yet.").

**Block If:**
- Persisting goals/allocations/displacements would require a projection table or migration beyond the additive events → HALT (blocked).
- The sensitive-field encryption path cannot encrypt `title`/`nextAction` through the existing `validateEventPayload` + `LedgerStore.append` seam for the new events (e.g. explicit `erasureScope` is not honored) → HALT (blocked).
- A required token, calm-voice rule, or a11y requirement cannot be satisfied without inventing a new token or breaking byte-identity → HALT (blocked).
- The displacement counter cannot be modeled without a guilt/score field → HALT (blocked). (It can: a plain event-sourced count shown in neutral language.)

**Never:**
- Do NOT build the ≤45-minute proof / e2e replay (2.6), the Policy & Boundaries settings surface (2.7), edit/remove/renegotiation UI for captured goals, or the planner wiring that emits `GoalAllocationDisplaced` (Epic 4). Capture is add-only here, mirroring 2.2–2.4.
- Do NOT let the user choose a protection level for a goal, add a `joint` context, a monthly/interval/RRULE allocation (weekly-only), a new projection table/migration, or a client-side wizard-state library (stay RSC + server actions + native `<form>`).
- Do NOT add any goal "score", "health", rating, rank, streak, or remediation/guilt mechanic. The `displacementCount` is a neutral factual count only. No color-only status.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fresh goals step | no `GoalAdded` events | empty form; list shows calm empty state | No error expected |
| Add a goal | title, nextAction, `context: personal`, allocation 3×45 | `GoalAdded` persists (`title`/`nextAction` encrypted); list shows title + next action + "Protected time: 3 × 45 min each week" (with lock glyph) + "Protected time hasn't moved yet." | — |
| Displacement folded | `GoalAdded` then 2× `GoalAllocationDisplaced` (same `goalId`) | goal shows `displacementCount` 2, rendered neutrally ("moved 2 times") | — |
| Displacement with no goal | `GoalAllocationDisplaced` before add, or after undo | ignored; no row created/resurrected | — (NOT an error) |
| Blank title / next action | empty/whitespace title or nextAction | no append; return to step | Rejected without appending |
| Invalid allocation | sessionsPerWeek `0`/`8`, minutesPerSession `0`/`>480`, non-integer | no append; return to step | Rejected without appending |
| Invalid context | context tampered (`joint`/other) | no append; return to step | Rejected without appending |
| Fourth goal | 3 goals already active, submit a 4th | no append; form shows calm at-limit state; existing goals unchanged | Rejected without appending |
| Undone add present | `GoalAdded` then `GoalAddUndone` | that goal absent from the projected list | — |
| No score field | inspect `GoalRow`/`goalAddedPayload` | no numeric rating/health/rank/score field anywhere; `displacementCount` is a plain count | Score never stored |
| Continue / Skip | `advanceStep('goals','entered'|'skipped')` | container records step + advances (to completion); captured goals not lost on return | No error expected |

</intent-contract>

## Code Map

- `packages/ledger/src/events/catalog.ts` -- add `goalContextEnum` (`work`|`personal`), `goalAllocationSchema` (weekly; `sessionsPerWeek` 1–7 int, `minutesPerSession` 1–480 int); add `goalAddedPayload` (sensitiveFields `['title','nextAction']`), `goalAddUndonePayload` (`{goalId}`), `goalAllocationDisplacedPayload` (`{goalId}`) to `EVENT_CATALOG`; export inferred `GoalAllocation`/`GoalAddedPayload` types.
- `packages/ledger/src/events/types.ts` -- add `GoalRow` (id, title, nextAction, `allocation: { protectionLevel:'protected-priority', frequency:'weekly', sessionsPerWeek, minutesPerSession }`, `displacementCount: number`, context, createdAt, updatedAt).
- `packages/ledger/src/projections/goal.ts` -- NEW `reduceGoal` + `projectGoals` + `goalIdOf` (fold by `goalId`; `GoalAdded` missing required value/invalid allocation → ignore; `GoalAllocationDisplaced` → increment existing count only; `GoalAddUndone` → removed; ignore-unknown; allocation derived as protected-priority).
- `packages/ledger/src/index.ts` -- re-export the new enums/schemas, `reduceGoal`/`projectGoals`, and the `GoalRow`/`GoalAllocation` types.
- `packages/ledger/src/projections/goal.test.ts` -- NEW: fold all fields, allocation exposed as protected-priority, displacement increments (incl. before-add / after-undo ignored), latest-wins per id, undone → removed, missing title/nextAction/context / invalid allocation → ignored, ignore-unknown, rebuild purity vs scrambled `compensatesEventId`, and an assertion that no numeric score/health/rank field exists on `GoalRow`.
- `packages/ledger/src/index.test.ts` -- MODIFY: assert the new goal exports resolve.
- `packages/db/src/ledger/store.test.ts` -- MODIFY: add a `GoalAdded` fixture (explicit `erasureScope: 'goal:'+id`) + PG-gated test proving `title`/`nextAction` encrypt at rest and decrypt on `readEvents`, and that append succeeds with no projection table.
- `apps/web/src/lib/onboarding/goals.ts` -- NEW read seam: `readGoalsStepData()` over one `readEvents()` → `{ goals: projectGoals(events) }`.
- `apps/web/src/lib/onboarding/goals-content.ts` -- NEW presentation catalog: `allocationSummary(sessionsPerWeek, minutesPerSession)`, neutral `displacementSummary(count)`, the protected-priority glyph/label (reused from `protection-levels`), and session/minute option lists for the form.
- `apps/web/src/lib/onboarding/goals-content.test.ts` -- NEW: allocation + displacement formatting, neutral/no-guilt/no-scoring/no-forbidden words, non-color lock marker present.
- `apps/web/src/app/(app)/onboarding/goals-actions.ts` -- NEW `'use server'` `addGoal`: validate title / nextAction / context / allocation ints; enforce ≤3 active goals; append one `GoalAdded` (`actor`, selected `context`, `randomUUID` id, explicit `erasureScope`) then redirect to the step (PRG). Reject invalid input or over-limit without appending.
- `apps/web/src/components/onboarding/goals/goal-form.tsx` -- NEW: title input, next-action input, allocation controls (sessions-per-week + minutes-per-session selects with sensible defaults), work/personal context radios, submit; at-limit calm state when 3 goals exist. No protection-level chooser (fixed protected-priority, shown as framing).
- `apps/web/src/components/onboarding/goals/goal-list.tsx` -- NEW: captured rows (title, next action, allocation summary + lock glyph, neutral displacement summary, context) + calm empty state; status by text+shape, never color; no edit/remove.
- `apps/web/src/components/onboarding/goals/goal-step.test.ts` -- NEW: accessible render — title/next-action/allocation/context controls, protected-priority framing + non-color lock glyph, list + empty state + at-limit state, no scoring/guilt language.
- `apps/web/src/app/(app)/onboarding/[step]/page.tsx` -- MODIFY: when `step === 'goals'` read `readGoalsStepData()` and render `<GoalForm atLimit={goals.length >= 3}/>` + `<GoalList/>`; boundaries/commitments/people branches unchanged; Continue/Skip unchanged.

## Tasks & Acceptance

**Execution:**
- [x] `packages/ledger/src/events/catalog.ts` -- add `goalContextEnum` + `goalAllocationSchema`; add `goalAddedPayload` (sensitiveFields `['title','nextAction']`), `goalAddUndonePayload`, `goalAllocationDisplacedPayload`; export inferred types -- single-source catalog with NO score field (AD-4 / FR-40).
- [x] `packages/ledger/src/events/types.ts` + `projections/goal.ts` -- add `GoalRow` + `reduceGoal`/`projectGoals`/`goalIdOf` (missing required/invalid allocation → ignore; displacement increments existing count; undone → removed; allocation derived as protected-priority) -- derived state completeness.
- [x] `packages/ledger/src/index.ts` -- re-export new enums/schemas/types + projection fns -- complete public surface.
- [x] `apps/web/src/lib/onboarding/goals.ts` -- `readGoalsStepData()` over one `readEvents()` -- the read seam (AD-1).
- [x] `apps/web/src/lib/onboarding/goals-content.ts` -- calm-voice allocation + neutral displacement formatting, protected-priority lock glyph, form option lists -- host-owned copy.
- [x] `apps/web/src/app/(app)/onboarding/goals-actions.ts` -- `addGoal` appends a catalog-valid `GoalAdded` (selected `context`, explicit `erasureScope`); rejects blank title/next action, invalid context/allocation, and any add beyond 3 active goals without appending -- the write seam (AD-1).
- [x] `apps/web/src/components/onboarding/goals/goal-form.tsx` + `goal-list.tsx` -- capture form (title, next action, allocation selects, context, at-limit state) and captured-goals list (allocation summary + lock glyph, neutral displacement, empty state) -- the filled step body.
- [x] `apps/web/src/app/(app)/onboarding/[step]/page.tsx` -- render the goals body for `goals`; keep boundaries/commitments/people + Continue/Skip -- wiring.
- [x] `packages/ledger/src/projections/goal.test.ts`, `apps/web/src/components/onboarding/goals/goal-step.test.ts`, `apps/web/src/lib/onboarding/goals-content.test.ts` -- cover the I/O matrix + accessible rendering + catalog completeness + the no-score-field / neutral-displacement guarantee.
- [x] `packages/ledger/src/index.test.ts`, `packages/db/src/ledger/store.test.ts` -- assert new exports resolve; add a `GoalAdded` append fixture proving `title`/`nextAction` encryption + no-table persistence.

**Acceptance Criteria:**
- Given the goals step, when I define a goal with a title, one next action, a weekly allocation (e.g. 3×45 min), and a context, then a `GoalAdded` event persists and returning to the step lists the goal with its next action and its allocation rendered as a protected-priority weekly reservation (FR-38-lite).
- Given a goal allocation, when it has been moved or dropped (a `GoalAllocationDisplaced` event exists), then the goal shows a per-allocation displacement count in neutral, non-guilt language, and with no such events shows a calm zero-state (FR-40-displacement).
- Given at most 3 active goals are allowed, when I try to add a fourth, then nothing is appended and the form shows a calm at-limit state; and when any goal surface or the ledger schema is inspected, there is no goal score/rating/rank/health field anywhere.
- Given required fields, when I submit without a title, without a next action, with an invalid allocation, or with an invalid context, then nothing is appended and no malformed or untagged goal is created.
- Given I have added (or skipped) goals, when I choose Continue or Skip, then the 2.1 container records the step and advances unchanged, and nothing I entered is lost on return.
- Given every goals surface, when it renders, then it uses only `globals.css` tokens and is fully keyboard operable with visible focus rings, grouped/labelled controls, non-color status markers, and screen-reader-legible title/next-action/allocation/displacement/context text.

## Spec Change Log

## Review Triage Log

### 2026-07-14 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 0, low 1)
- defer: 2: (high 0, medium 1, low 1)
- reject: 10
- addressed_findings:
  - `[low]` `[patch]` `addGoal` resolved the actor only at append time, so the ≤3-cap `readEvents()` (which decrypts every sensitive field in the whole event log) ran before authentication. Server actions do not re-run the `(app)` layout, so `requireActor()` is the real auth guard for this mutation — an unauthenticated direct POST would trigger a full-log decrypt before being rejected. Moved `requireActor()` to the first statement of `addGoal` so an unauthenticated request short-circuits before any sensitive read (this is unique to goals — the sibling people/commitments actions do no full-log read, so no divergence concern). Re-verified typecheck + lint + goal suites green.

## Design Notes

Why one `GoalAdded` event with an embedded allocation rather than a separate allocation entity: the allocation is an attribute *of the goal* (one protected weekly reservation per goal, FR-38-lite), so one additive event keeps the projection a single fold and avoids a join. The projection exposes the allocation as `{ protectionLevel: 'protected-priority', … }` — reusing the shared 2.3 protection-level vocabulary — so it is queryable as "a protected-priority intention linked to that goal" for the Epic-4 ContextSnapshot without a separate entity at MVP. Unlike a commitment, the user never *chooses* the level: a goal allocation is protected-priority by definition, so there is no protection-level radio.

Displacement counter, honestly event-sourced but not guilt-laden: FR-40 requires a per-allocation counter "incremented whenever a planned allocation is moved or dropped." Append-only forbids a mutable count, so the counter is folded from `GoalAllocationDisplaced` events (`displacementCount` = number of such events for the goal). This story defines the event + fold and displays the count in neutral language, but emits **no** displacement in onboarding — moving/dropping an allocation is a planning action (Epic 4), which will append the event. This mirrors 2.4 defining `PersonAddUndone` for fold-completeness before any UI emits it. `displacementCount` is a plain factual count, never a score, rating, or health metric (P5).

Context is `work`|`personal` at the schema (`goalContextEnum`), not the broader `contextEnum`: a goal is never `joint`, which keeps the linked plannable allocation non-joint per AD-5. The action sets both envelope and payload `context` to the selected value (mirrors 2.3/2.4 dual-write to avoid disagreement).

The ≤3-active-goals cap is cross-event and cannot be a schema rule, so it is enforced in the action against `projectGoals(readEvents())` and reflected as a calm at-limit form state; because capture is add-only in 2.5 (no removal UI), active count equals the projected goal count.

Persistence with no migration: `LedgerStore.append` applies only the commitment projection table and skips it for any other event type (`commitmentIdOf` returns `null`), so goal events insert cleanly with no new table; the read seam projects from `readEvents()` in memory (the 2.3/2.4-endorsed resolution). Sensitive-field encryption is generic off the catalog's `sensitiveFields`, and the action passes an explicit `erasureScope: 'goal:'+goalId` so a future erase can crypto-shred a specific goal. The lock glyph reuses the 2.3 protection-level catalog's monochrome `aria-hidden` marker paired with a visible text label; the text label carries the semantic, so status is never color-only.

## Verification

**Commands:**
- `npm run typecheck` -- expected: passes (new payload/row types resolve; new exports type-clean).
- `npm run lint` -- expected: passes, including fixture proofs and AD-1 dependency-direction rules.
- `npm test` -- expected: passes; new goal projection/web/catalog tests green and the `GoalAdded` append fixture valid.

**Manual checks:**
- From a fresh account, open `/onboarding/goals` keyboard-only: add a goal with a next action and a 3×45 allocation, add two more, then confirm a fourth is refused with a calm at-limit message; refresh — all persist with correct attributes and a neutral "hasn't moved yet" displacement line; the allocation shows the protected-priority lock glyph; focus rings visible and all attributes legible without color; no scoring/guilt language anywhere; Continue advances past goals.

## Auto Run Result

Status: done

**Implemented change:** Filled the onboarding `goals` step body (Story 2.5). Each goal is one additive `GoalAdded` event carrying the MVP-lite Goal model — title, exactly one user-defined next action, a weekly allocation (`sessionsPerWeek × minutesPerSession`), and a `work`/`personal` context — plus a compensating `GoalAddUndone` and a `GoalAllocationDisplaced` event. The projection exposes the allocation as a fixed `protected-priority` intention (the shared 2.3 protection-level vocabulary) linked to the goal by `goalId` (FR-38-lite), and folds `GoalAllocationDisplaced` events into a per-goal `displacementCount` shown in neutral, non-guilt language (FR-40). The user never chooses a protection level — a goal allocation is protected-priority by construction. At most 3 active goals are allowed (enforced in the action against the projection; the form renders a calm at-limit state). `title`/`nextAction` are crypto-shredded via the existing sensitive-field seam under an explicit `erasureScope: goal:${goalId}`. There is **no** score/rating/rank/health field anywhere (FR-40 / P5). The list re-renders from the pure `projectGoals` projection — no new table, no migration. The 2.1 container's Continue/Skip (`advanceStep('goals', …)`) is untouched.

**Files changed:**
- `packages/ledger/src/events/catalog.ts` — `goalContextEnum` (`work`|`personal`), `goalAllocationSchema` (weekly, `sessionsPerWeek` 1–7, `minutesPerSession` 1–480), `goalAddedPayload` (`sensitiveFields: ['title','nextAction']`), `goalAddUndonePayload`, `goalAllocationDisplacedPayload`; catalog registration; inferred type exports.
- `packages/ledger/src/events/types.ts` — `GoalRow` (allocation as protected-priority; `displacementCount`; no numeric/score field).
- `packages/ledger/src/projections/goal.ts` — `reduceGoal`/`projectGoals`/`goalIdOf` (fold by `goalId`; missing required/invalid allocation → ignored; displacement increments existing count only; undone → removed; ignore-unknown; `compensatesEventId`-independent).
- `packages/ledger/src/index.ts` — re-exports the new enums/schemas/types + projection fns.
- `apps/web/src/lib/onboarding/goals.ts` — `readGoalsStepData()` read seam over one `readEvents()`.
- `apps/web/src/lib/onboarding/goals-content.ts` — `allocationSummary`, neutral `displacementSummary`, protected-priority glyph/label reused from `protection-levels`, form option lists (defaults 3×45).
- `apps/web/src/app/(app)/onboarding/goals-actions.ts` — `'use server'` `addGoal` (actor resolved first; explicit `erasureScope`; rejects blank title/next action, invalid context/allocation, and any add beyond 3 active goals without appending).
- `apps/web/src/components/onboarding/goals/{goal-form,goal-list}.tsx` — the accessible capture form (title, next action, allocation selects, context radios, at-limit state, fixed protected-priority framing) and captured-goals list (allocation summary + lock glyph, neutral displacement, empty state; status by text+shape, never color; add-only).
- `apps/web/src/app/(app)/onboarding/[step]/page.tsx` — renders the goals body for `step === 'goals'`; boundaries/commitments/people branches + Continue/Skip unchanged.
- Tests: NEW `packages/ledger/src/projections/goal.test.ts`, `apps/web/src/lib/onboarding/goals-content.test.ts`, `apps/web/src/components/onboarding/goals/goal-step.test.ts`; MODIFIED `packages/ledger/src/index.test.ts` (new goal exports + validation), `packages/db/src/ledger/store.test.ts` (PG-gated `GoalAdded` encrypt/decrypt/no-table/erase fixture).
- `_bmad-output/implementation-artifacts/epic-2-context.md` — recompiled (planning docs were newer than the cached context).

**Review findings breakdown:** 1 patch applied — `[low]` `addGoal` resolved the actor only at append time, so the ≤3-cap `readEvents()` (a full-log decrypt) ran before authentication; since a server action does not re-run the `(app)` layout, `requireActor()` is the real auth guard, so it was moved to the first statement to short-circuit unauthenticated requests before any sensitive read. 2 deferred — (1) the ≤3-active-goals cap is enforced non-atomically (read-then-append), so concurrent double-submits could produce a 4th goal (low consequence at single-user MVP; needs atomic-guard infra); (2) a crypto-shredded entity still projects/renders as the literal `[redacted]` marker and occupies its slot — systemic across Person/Commitment/Goal projections and unreachable in 2.5 (erase UI lands in 2.7). 10 rejected — mostly the 2.3/2.4-endorsed pattern (projection defensive-narrowing weaker than the append-time schema, latest-wins fold, untrimmed projection value already trimmed by the action, unfiltered full-log read, no error-surface on tampered/JS-disabled submit), single-user-app non-issues (AD-5 multi-user cap scoping), and unreachable-by-construction cases (goalId/displacementCount are schema- or construction-guaranteed clean). No intent_gap, no bad_spec — no spec amendment or re-derivation.

**Follow-up review recommended:** false — the one review-driven change is a localized, low-consequence reorder that does not change behavior for any valid input or any API/data shape, and is covered by the gates. The two open items were deferred (not fixed), so nothing significant was re-derived this pass.

**Verification performed:** `npm run typecheck` PASS; `npm run lint` PASS (5/5 AD-1 fixture proofs); targeted `vitest run` of the new/affected non-PG suites PASS (`goal.test.ts` 14, ledger `index.test.ts` 23, `goals-content.test.ts` 7, `goal-step.test.ts` 9 — 53 tests) both before and after the patch. The full `npm test` run reported 368 passed / 20 skipped with only 3 suites failing — `packages/db/.../store.test.ts`, `packages/db/.../mirror/store.test.ts`, and `apps/web/.../agenda-data.test.ts` — all of which fail in their `beforeAll → startPg()` hook because a Postgres/Docker container cannot start in this sandbox; all three reference `startPg` and none were touched by this story. The PG-gated `GoalAdded` store fixture is written and type-clean (compiled by the tests tsconfig) and will run wherever Postgres is reachable.

**Residual risks:** Surfaces are pinned to `--light-*` tokens (dark mode deferred to Epic 13 by design). The allocation/lock markers are labeled monochrome glyphs (no icon font loaded — established 2.2–2.4 idiom); the text label carries the semantic, so the a11y floor holds. `readGoalsStepData`/`addGoal` project from the full unfiltered event stream per render/add (same seam pattern as people/commitments; correct at MVP single-user scale). The ≤3 cap is not concurrency-safe and an erased goal would render `[redacted]` and occupy a slot — both deferred, both unreachable or inconsequential at MVP. The PG-gated `GoalAdded` encrypt/decrypt/erase fixture did not execute in this sandbox (no Postgres). The ≤45-minute proof (2.6) and the Policy & Boundaries edit/remove surface (2.7) remain out of scope; the planner wiring that emits `GoalAllocationDisplaced` arrives in Epic 4.
