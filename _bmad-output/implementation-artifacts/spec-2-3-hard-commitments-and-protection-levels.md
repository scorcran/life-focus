---
title: 'Hard Commitments and Protection Levels'
type: 'feature'
created: '2026-07-14'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: 'a5d8ec5030dbd3b1120754afe74af7e4306c941f'
final_revision: 'aea5f8fe68ef022f42c45b65d06a07ed7f02934e'
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-life-focus-2026-07-12/EXPERIENCE.md'
warnings: ['oversized']
---

<intent-contract>

## Intent

**Problem:** Story 2.1 built the onboarding container and 2.2 filled the `boundaries` step, but the `commitments` step is still a generic placeholder (rationale + Continue/Skip). Sean cannot yet name his standing hard commitments and protected priorities, and there is no way to assign the FR-3 protection level that guarantees "school pickup can never be scheduled over." The `CommitmentCaptured` event exists (Story 1.3 demonstrator) but carries no protection level and no recurrence.

**Approach:** Fill the `commitments` step body with a calm capture form + a list of captured items. Extend the existing `CommitmentCaptured` payload with a **required** four-level `protectionLevel` (schema-enforced: no untagged plannable item can exist), an **optional** weekly `recurrence`, and a user-chosen work/personal context. Each capture is one additive AD-4 event; the list re-renders from the pure `projectCommitments` projection — no new table, no migration. The 2.1 container's Continue/Skip (`advanceStep('commitments', …)`) is reused unchanged.

## Boundaries & Constraints

**Always:**
- Persist as append-only events only (AD-4). Extend `CommitmentCaptured` (context `work` or `personal`) — do NOT add a new event type. New required payload field `protectionLevel` ∈ the four FR-3 levels; new optional field `recurrence` (`null`/absent = one-off). `sensitiveFields` stays `['title']`. Schemas live once in `packages/ledger` catalog and validate via the existing `validateEventPayload` path. No UPDATE/DELETE. Host only appends + reads projections (AD-1).
- The four protection levels are canonical, ordered, kebab-cased ids defined **once** in `packages/ledger` and re-exported: `hard-commitment`, `protected-priority`, `flexible-intention`, `optional-opportunity`. `protectionLevel` is **required with no default** — a missing/unknown level rejects the append (schema-level guarantee that every plannable item is tagged).
- Recurrence at MVP is weekly-only: `{ frequency: 'weekly', daysOfWeek: Weekday[] }` with ≥1 weekday; `Weekday` is a canonical 7-value enum in `packages/ledger`. Any other/absent value means non-recurring. Capturing "Thursday 3:30 pickup" = weekly + `['thu']`; the time-of-day detail lives in the free-text `title` (mirrors the existing title-carries-specifics idiom).
- Context is user-chosen per commitment and restricted to `work` | `personal` (a specific plannable item is never `joint`, per AD-5); the action sets both the envelope `context` and the payload `context` to the selected value. Actor is `session.user.id`; routes stay under the authenticated `(app)` shell.
- Current state derives from `projectCommitments(readEvents())` (no context filter — commitments span work + personal). Extend `CommitmentRow` + `reduceCommitment` to carry `protectionLevel` and `recurrence`; `CommitmentCaptureUndone` still folds to `null`; unknown types ignored (default case).
- Presentation copy is host-owned in `apps/web`: a `protection-levels` catalog maps each level id → `{ label, meaning, icon }`. Each level's plain-language **meaning is shown at the moment of selection** in EXPERIENCE.md calm voice (e.g. hard commitment: "Should not move except for a genuine emergency."). Every level renders a distinct non-color indicator — lock (hard commitment) / shield (protected priority) / tune (flexible intention) / spark (optional opportunity) — as an `aria-hidden` monochrome glyph paired with the visible level name; protection status is NEVER conveyed by color alone.
- Every surface uses `globals.css` design tokens (byte-identical to DESIGN.md) and meets the Epic-1 a11y floor: full keyboard operability, `:focus-visible` rings, labelled/grouped radio + checkbox controls (`fieldset`/`legend`), landmark/labelled sections, and screen-reader-legible level/recurrence/context text.
- Copy obeys EXPERIENCE.md calm voice: plain-language level meanings, no guilt/gamification/motivational prompts, forbidden-words list respected. Empty list reads calmly (e.g. "Nothing captured yet.").

**Block If:**
- A required token, calm-voice rule, or a11y requirement cannot be satisfied without inventing a new token or breaking byte-identity → HALT (blocked).
- Persisting commitments/protection/recurrence would require a projection table or migration beyond extending the additive `CommitmentCaptured` event → HALT (blocked).
- The sensitive-field encryption path cannot continue to encrypt `title` through the existing `validateEventPayload` + `LedgerStore.append` seam after the schema change → HALT (blocked).

**Never:**
- Do NOT build the people / goals step bodies (2.4–2.5), the Policy & Boundaries settings surface (2.7), or the ≤45-minute assertion / e2e replay (2.6). Do NOT add edit/remove/renegotiation UI for captured commitments (that is the 2.7 durable surface / FR-24 renegotiation) — capture is add-only here, mirroring 2.2's add-only domains.
- Do NOT ship full RRULE/monthly/interval recurrence — weekly-with-weekdays only. No `joint` context on a commitment. No relationship scores. No color-only status. No client-side wizard state library (stay RSC + server actions + native `<form>`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fresh commitments step | no `CommitmentCaptured` events | empty form; list shows calm empty state | No error expected |
| Add a one-off hard commitment | title, `protectionLevel: hard-commitment`, `context: personal`, no weekday | `CommitmentCaptured` persists; list shows title + lock indicator + "Personal", no recurrence | — |
| Add a weekly protected priority | title, `protected-priority`, `context: work`, days `['thu']` | persists with `recurrence {frequency:'weekly',daysOfWeek:['thu']}`; list shows shield indicator + "Repeats weekly: Thu" | — |
| Missing protection level | title present, no `protectionLevel` selected | no append; return to step (schema/action rejects untagged item) | Rejected without appending |
| Blank title | empty/whitespace title | no append; return to step | Rejected without appending |
| Invalid context | context not `work`/`personal` (tampered form) | no append; return to step | Rejected without appending |
| Weekly chosen with no weekday | recurrence intended but 0 days | treat as invalid → no append (avoid an empty weekly rule) | Rejected without appending |
| Each level's meaning shown | rendering the form | all four levels list their plain-language meaning at selection + a non-color icon+label | — |
| Undone capture present | `CommitmentCaptured` then `CommitmentCaptureUndone` | that commitment absent from the projected list | — |
| Continue / Skip | `advanceStep('commitments','entered'|'skipped')` | container records step + advances to `people`; captured items not lost on return | No error expected |

</intent-contract>

## Code Map

- `packages/ledger/src/events/catalog.ts` -- extend `commitmentCapturedPayload` with required `protectionLevel` + optional `recurrence`; add `protectionLevelEnum`, `PROTECTION_LEVELS`, `weekdayEnum`, `WEEKDAYS`, `commitmentRecurrenceSchema` + inferred `ProtectionLevel`/`Weekday`/`CommitmentRecurrence` type exports. `sensitiveFields` unchanged (`['title']`).
- `packages/ledger/src/events/types.ts` -- extend `CommitmentRow` with `protectionLevel: ProtectionLevel` and `recurrence: CommitmentRecurrence | null`.
- `packages/ledger/src/projections/commitment.ts` -- carry `protectionLevel` + `recurrence` (default `null`) through `reduceCommitment`; keep undone→`null`, ignore-unknown.
- `packages/ledger/src/index.ts` -- re-export `PROTECTION_LEVELS`, `WEEKDAYS`, the enums/schemas, and `ProtectionLevel`/`Weekday`/`CommitmentRecurrence` types.
- `packages/ledger/src/projections/commitment.test.ts` -- NEW: fold protectionLevel + recurrence, latest-wins on re-capture id, undone→removed, ignore-unknown.
- `packages/ledger/src/index.test.ts` -- MODIFY: add `protectionLevel` to the 3 existing `CommitmentCaptured` fixtures; assert new exports resolve.
- `packages/db/src/ledger/store.test.ts` -- MODIFY: add `protectionLevel` to the `captureInput` helper + any inline `CommitmentCaptured` payload so append-path fixtures stay catalog-valid.
- `apps/web/src/lib/onboarding/commitments.ts` -- NEW read seam: `readCommitmentsStepData()` over a single `readEvents()` → `{ commitments: projectCommitments(events) }`.
- `apps/web/src/lib/onboarding/protection-levels.ts` -- NEW presentation catalog: per-level `{ label, meaning, icon }` in calm voice + weekday labels.
- `apps/web/src/lib/onboarding/protection-levels.test.ts` -- NEW: one entry per `PROTECTION_LEVELS` id, calm voice / no forbidden words, distinct icons.
- `apps/web/src/app/(app)/onboarding/commitments-actions.ts` -- NEW `'use server'` `addCommitment`: validate title / protectionLevel / context / weekdays; append one `CommitmentCaptured` (`actor`, selected `context`, `randomUUID` id) then redirect to the step (PRG). Reject invalid input without appending.
- `apps/web/src/components/onboarding/commitments/commitment-form.tsx` -- NEW: title input, protection-level radio group (each option shows its meaning + non-color icon/label), work/personal context radios, weekday checkboxes, submit.
- `apps/web/src/components/onboarding/commitments/commitment-list.tsx` -- NEW: captured rows (title, level icon+label, recurrence summary, context) + calm empty state; status by text+shape, never color.
- `apps/web/src/components/onboarding/commitments/commitment-step.test.ts` -- NEW: accessible render — four levels + meanings, non-color icon+label, recurrence/context controls, list + empty state.
- `apps/web/src/app/(app)/onboarding/[step]/page.tsx` -- MODIFY: when `step === 'commitments'` read `readCommitmentsStepData()` and render `<CommitmentForm/>` + `<CommitmentList/>`; boundaries branch unchanged; other steps keep the placeholder; Continue/Skip unchanged.

## Tasks & Acceptance

**Execution:**
- [x] `packages/ledger/src/events/catalog.ts` -- add protection-level + weekday enums/constants + recurrence schema; extend `commitmentCapturedPayload` (required `protectionLevel`, optional `recurrence`); export inferred types -- single-source catalog (AD-4/SEC-1).
- [x] `packages/ledger/src/events/types.ts` + `projections/commitment.ts` -- extend `CommitmentRow` + `reduceCommitment` to carry `protectionLevel` and `recurrence` (`null` default) -- derived state completeness.
- [x] `packages/ledger/src/index.ts` -- re-export new constants/enums/types -- complete public surface.
- [x] `apps/web/src/lib/onboarding/commitments.ts` -- `readCommitmentsStepData()` over one `readEvents()` -- the read seam (AD-1).
- [x] `apps/web/src/lib/onboarding/protection-levels.ts` -- calm-voice per-level catalog (label/meaning/icon) + weekday labels -- host-owned copy.
- [x] `apps/web/src/app/(app)/onboarding/commitments-actions.ts` -- `addCommitment` appends a catalog-valid `CommitmentCaptured` (selected `context`); rejects blank title / missing-or-unknown level / bad context / empty weekly set without appending -- the write seam (AD-1).
- [x] `apps/web/src/components/onboarding/commitments/commitment-form.tsx` + `commitment-list.tsx` -- capture form (level radios with meanings + non-color icons, context, weekdays) and captured-item list with empty state -- the filled step body.
- [x] `apps/web/src/app/(app)/onboarding/[step]/page.tsx` -- render the commitments body for `commitments`; keep boundaries + placeholder + Continue/Skip -- wiring.
- [x] `packages/ledger/src/projections/commitment.test.ts`, `apps/web/.../commitment-step.test.ts`, `apps/web/src/lib/onboarding/protection-levels.test.ts` -- cover the I/O matrix + accessible rendering + catalog completeness.
- [x] `packages/ledger/src/index.test.ts`, `packages/db/src/ledger/store.test.ts` -- update existing `CommitmentCaptured` fixtures to include `protectionLevel` -- keep the suite catalog-valid after the required-field change.

_Note: `packages/db/src/ledger/store.ts` was also modified — widening `CommitmentRow` (required `protectionLevel`/`recurrence`) required `readCommitments` to derive rows from the context-scoped event stream via `projectCommitments` rather than the Story-1.3 projection table (which lacks those columns), honoring the no-migration Block-If while preserving the AD-5 context-separation filter and erase-cascade redaction (integration tests green)._

**Acceptance Criteria:**
- Given the commitments step, when I add an item with a title, one of the four protection levels, a context, and (optionally) weekly recurrence, then a `CommitmentCaptured` event persists and returning to the step lists the item with its level, recurrence, and context.
- Given the capture form, when it renders, then all four protection levels are selectable, each shows its plain-language meaning at the moment of selection, and each is marked by a distinct non-color icon (lock / shield / tune / spark) paired with a text label.
- Given protection level is mandatory, when I submit without selecting a level (or a blank title, an invalid context, or a weekly recurrence with no weekday), then nothing is appended and no untagged item is created.
- Given I have captured (or skipped) commitments, when I choose Continue or Skip, then the 2.1 container records the step and advances to `people` unchanged, and nothing I entered is lost on return.
- Given every commitments surface, when it renders, then it uses only `globals.css` tokens and is fully keyboard operable with visible focus rings, grouped/labelled controls, and screen-reader-legible level/recurrence/context status.

## Spec Change Log

_No spec amendments — the review produced no intent_gap or bad_spec findings._

## Review Triage Log

### 2026-07-14 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 1, low 1)
- defer: 1: (high 0, medium 1, low 0)
- reject: 14
- addressed_findings:
  - `[medium]` `[patch]` the protection-level radio group pre-selected the strongest level (`hard-commitment` via `defaultChecked={index === 0}`), biasing capture toward over-protection and rendering the required-choice guard practically unreachable — removed the default so the group starts unselected and `required` forces a deliberate, explicit level pick (aligns with "each level's meaning is shown at selection").
  - `[low]` `[patch]` the captured-commitments meta line rendered through `label-caps` (`text-transform: uppercase`), force-capsing the deliberately-calm mixed-case copy ("Repeats weekly: Thu · Hard commitment · Personal") — switched to `label-md` so the rendered text matches the authored calm voice (DOM text unchanged, so the render tests still pass).

## Design Notes

Why extend `CommitmentCaptured` rather than a new event: the entity already exists with `title`/`context`/`status`; protection level and recurrence are attributes *of that capture*, so one additive event keeps the projection a single fold and avoids a join. `protectionLevel` is required with no default because a default would silently tag items and defeat "no untagged plannable item exists" (PRD FR-3 / epic invariant) — enforcement belongs at the schema, so tampered/partial forms cannot create an untagged commitment.

Envelope vs payload context: `reduceCommitment` reads `event.context` (envelope), but `commitmentCapturedPayload` also carries `context`; the action sets **both** to the selected `work`/`personal` value so the two never disagree (pre-existing 1.3 shape — do not "fix" by dropping one).

Recurrence shape (MVP):
```ts
// commitmentRecurrenceSchema (nullable/optional)
{ frequency: 'weekly', daysOfWeek: z.array(weekdayEnum).min(1) }
// ≥1 checked weekday → weekly rule; 0 checked → recurrence omitted (one-off)
```
Weekly + weekdays is the minimal structure that satisfies the "Thursday pickup" example and stays projection-queryable/stable for the Epic-4 ContextSnapshot; full RRULE is deferred.

Icons follow the codebase idiom (no Material-Symbols font loaded): monochrome glyph + visible text label, glyph `aria-hidden`, matching 2.2's `●/○/◇/✓` pattern. The DESIGN.md conceptual names (lock/shield/tune) map to the top three levels; optional-opportunity uses a spark marker. The **text label** carries the semantic; the glyph is supplemental so status is never color-only.

Add-only capture (no edit/remove) matches 2.2's add-only domains and the review's scope discipline; editing/removing captured commitments belongs to the 2.7 Policy & Boundaries surface, and moving a hard commitment is the FR-24 renegotiation flow — both out of scope here.

## Verification

**Commands:**
- `npm run typecheck` -- expected: passes (extended payload/row types resolve; new exports type-clean).
- `npm run lint` -- expected: passes, including fixture proofs and AD-1 dependency-direction rules.
- `npm test` -- expected: passes; new commitment projection/web/catalog tests green and updated `CommitmentCaptured` fixtures valid.

**Manual checks:**
- From a fresh account, open `/onboarding/commitments` keyboard-only: add a one-off hard commitment and a weekly protected priority; refresh — both persist with correct level/recurrence/context; each level's meaning shows at selection; focus rings visible and level/recurrence/context legible without color; Continue advances to `people`.

## Auto Run Result

Status: done

**Implemented change:** Filled the onboarding `commitments` step body (Story 2.3) with a calm capture form + a captured-commitments list. Each commitment is one additive `CommitmentCaptured` event carrying a **required, no-default** FR-3 `protectionLevel` (schema-enforced so no untagged plannable item can exist), an **optional** weekly `recurrence`, and a user-chosen `work`/`personal` context. Each level's plain-language meaning is shown at selection and marked by a distinct non-color glyph + text label (lock/shield/tune/spark). The list re-renders from the pure `projectCommitments` projection — no new table, no migration. The 2.1 container's Continue/Skip (`advanceStep('commitments', …)`) is untouched and advances to `people`.

**Files changed:**
- `packages/ledger/src/events/catalog.ts` — `PROTECTION_LEVELS`/`protectionLevelEnum`, `WEEKDAYS`/`weekdayEnum`, `commitmentRecurrenceSchema`; extended `commitmentCapturedPayload` (required `protectionLevel`, optional nullable `recurrence`); `ProtectionLevel`/`Weekday`/`CommitmentRecurrence` type exports; `sensitiveFields: ['title']` unchanged.
- `packages/ledger/src/events/types.ts` + `projections/commitment.ts` — `CommitmentRow` + `reduceCommitment` carry `protectionLevel` and `recurrence` (a `CommitmentCaptured` lacking a level is ignored, never an untagged row); undone→`null`, ignore-unknown preserved.
- `packages/ledger/src/index.ts` — re-exports the new constants/enums/schemas/types.
- `apps/web/src/lib/onboarding/commitments.ts` — `readCommitmentsStepData()` (single unfiltered `readEvents()` → `projectCommitments`).
- `apps/web/src/lib/onboarding/protection-levels.ts` — calm-voice per-level catalog (label/meaning/icon) + weekday labels + `recurrenceSummary`.
- `apps/web/src/app/(app)/onboarding/commitments-actions.ts` — `addCommitment` (validate title/level/context/weekdays; append one `CommitmentCaptured`; PRG redirect).
- `apps/web/src/components/onboarding/commitments/{commitment-form,commitment-list}.tsx` — the accessible capture form and captured-item list (status by text+shape, never color; empty state).
- `apps/web/src/app/(app)/onboarding/[step]/page.tsx` — renders the commitments body for `step === 'commitments'`; boundaries branch + Continue/Skip unchanged.
- `packages/db/src/ledger/store.ts` — `readCommitments` derives rows from the context-scoped event stream via `projectCommitments` (extracted a shared `readEventsInternal`), honoring the no-migration Block-If while preserving the AD-5 context filter and erase-cascade redaction.
- Tests: NEW `packages/ledger/src/projections/commitment.test.ts`, `apps/web/src/components/onboarding/commitments/commitment-step.test.ts`, `apps/web/src/lib/onboarding/protection-levels.test.ts`; UPDATED `packages/ledger/src/index.test.ts`, `packages/db/src/ledger/store.test.ts` (added `protectionLevel` to existing `CommitmentCaptured` fixtures).

**Review findings breakdown:** 2 patches applied — `[medium]` removed the strongest-level `defaultChecked` on the protection-level radios so the level is a deliberate, forced choice rather than a silent over-protection default; `[low]` switched the captured-list meta line from `label-caps` (forced uppercase) to `label-md` so the calm mixed-case copy renders as authored. 1 deferred — the `commitment` projection table lacks the 2.3 columns, so `readCommitments` derives from the full context event stream (over-decrypts unrelated events + a latent placeholder invariant + now-vestigial erase-to-table redaction); safe at MVP scale, logged for a future projection-table migration. 14 rejected — mostly pre-existing patterns the 2.2 review already settled (redirect-without-return matches the codebase idiom, no title max-length convention, PG-gated store tests that did run here, projection defensive-narrowing weaker than the schema, thin server-action not unit-tested), by-design choices (unfiltered read per spec; monochrome glyph + text label given no icon-font is loaded), and speculative schema-bypass hardening. No intent_gap, no bad_spec — no spec amendment or re-derivation.

**Follow-up review recommended:** false — the two review-driven changes are localized, low-consequence (one removed attribute, one CSS-class swap), fully covered by the gates and existing tests, and do not alter the core capture/persist/project path.

**Verification performed:** `npm run typecheck` PASS, `npm run lint` PASS (5/5 fixture proofs), `npm test` PASS (39 files, 326 tests; Postgres-backed ledger/mirror suites ran and passed). Run independently after the implementation subagent returned, and again after the two review patches.

**Residual risks:** Surfaces are pinned to `--light-*` tokens (dark mode deferred to Epic 13 by design). Protection-level glyphs are labeled monochrome markers rather than true lock/shield/tune icons (no icon font is loaded — established 2.2 idiom); the text label carries the semantic, so the a11y floor holds. `readCommitments` derives from the event stream (see the deferred item) — correct and safe at MVP scale but O(context events) per read until the projection table is migrated. The people/goals step bodies remain placeholders pending Stories 2.4–2.5; re-entry editing and the ≤45-minute proof are Stories 2.6–2.7.
