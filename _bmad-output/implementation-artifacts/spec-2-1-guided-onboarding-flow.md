---
title: 'Guided Onboarding Flow'
type: 'feature'
created: '2026-07-14'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: 'bf56cd04254022065b5ff949648bcef7375277e0'
final_revision: 'f1ab2555b5b443af7890cf48c8a71bf4b0db11a9'
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-life-focus-2026-07-12/EXPERIENCE.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** Epic 2 asks Sean to define his whole life model in one ≤45-minute sitting, but there is no container to walk that sequence — no resumable, skippable, progress-bearing flow, and no way to persist "how far along am I" so abandoning loses nothing.

**Approach:** Build the guided-onboarding *container* only (stories 2.2–2.5 fill the step bodies). A server-driven multi-step flow under `/onboarding` walks an ordered life-model step sequence; each step shows a "What this protects" rationale plus Continue / Skip; every advance is persisted immediately as an append-only ledger event, so resume and "lose nothing" fall out of the event log. Onboarding progress is served by a pure in-memory projection — no new DB table or migration.

## Boundaries & Constraints

**Always:**
- Persist progress as append-only events only (AD-4). New event types (context `joint`, no sensitive fields): `OnboardingStarted { startedAt }`, `OnboardingStepCompleted { stepId, mode: entered|skipped, at }`, `OnboardingCompleted { completedAt }`. Payload schemas defined once in `packages/ledger` catalog; validated via the existing `validateEventPayload` path. No UPDATE/DELETE, no direct state mutation from the host (AD-1).
- Current progress is derived by a pure projection over events (`projectOnboarding`), read via the existing `LedgerStore.readEvents`. `OnboardingStarted` is idempotent (first wins — re-entry never restarts the clock); a repeated `OnboardingStepCompleted` for the same step is latest-wins.
- Step sequence is canonical and ordered: `boundaries` → `commitments` → `people` → `goals` (mapping to stories 2.2–2.5). The valid step-id set lives in `packages/ledger`; presentation copy/order lives in `apps/web`.
- Flow is resumable and skippable: entering `/onboarding` resumes at the first step with no recorded completion; every step is advanceable by Continue (`entered`) or Skip (`skipped`). Each step names why it matters ("What this protects") in calm-voice copy.
- Every surface uses the `globals.css` design tokens (byte-identical to DESIGN.md) and meets the Epic-1 accessibility floor: full keyboard operability, `:focus-visible` rings, landmark roles (`<nav>`/`<main>`), screen-reader announcements, and status conveyed by text/shape — never color alone.
- Copy obeys EXPERIENCE.md calm voice: no guilt, cheerleading, gamification, or motivational prompts. First-run / empty state is calm and explanatory per the state-pattern contract.
- Actor on every append is `session.user.id`; onboarding routes live under the authenticated `(app)` shell.

**Block If:**
- A required design token, calm-voice rule, or accessibility requirement cannot be satisfied without inventing a new token or violating the byte-identity rule → HALT (blocked).
- The append/projection seam cannot record or resume progress without schema changes beyond the three additive events above (e.g. a projection table + migration is truly required) → HALT (blocked), since the migration path is flagged non-trivial in the deferred-work ledger.

**Never:**
- Do NOT build the step *content* (boundaries/domains/policies, commitments, people, goals inputs) — those are stories 2.2–2.5. Steps render the rationale + Continue/Skip only; no fake input fields.
- Do NOT implement the ≤45-minute assertion, the end-to-end journey replay, or re-entry entity-editing — those are story 2.6 / later. (Recording `startedAt`/`completedAt` to *enable* 2.6 is in scope; asserting the delta is not.)
- No relationship scores, no auto-advance without an explicit user action, no client-side wizard state library (stay RSC + server actions, matching the codebase).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fresh account | no onboarding events | `projectOnboarding` → `{ started:false, steps:{}, completed:false }`; `/onboarding` shows the welcome/first-run panel with "Begin setup" | No error expected |
| Begin | `OnboardingStarted` appended | progress `started:true`, `startedAt` set; redirect to first step (`boundaries`) | No error expected |
| Advance a step | `OnboardingStepCompleted { stepId:'commitments', mode:'entered' }` | that step recorded; redirect to next incomplete step | No error expected |
| Skip a step | `OnboardingStepCompleted { stepId:'people', mode:'skipped' }` | step recorded as `skipped`; flow advances identically | No error expected |
| Resume mid-flow | `Started` + `boundaries` completed only | `/onboarding` resumes at `commitments` (first with no completion) | No error expected |
| Repeat a step | two `StepCompleted` for `goals` (skipped then entered) | latest-wins → `goals` is `entered` | No error expected |
| All steps done | 4 steps recorded, not completed | redirect to `/onboarding/complete` (review + explicit Finish) | No error expected |
| Completed | `OnboardingCompleted` present | `/onboarding` shows calm done summary / Finish redirects to `/today` | No error expected |
| Invalid step id in URL | `/onboarding/nonsense` | redirect to `/onboarding` (resume) | Never 500; treat unknown id as not-a-step |
| Unrelated joint events present | non-onboarding `joint` events in stream | projection ignores unknown event types (default case) | No error expected |

</intent-contract>

## Code Map

- `packages/ledger/src/events/catalog.ts` -- add onboarding step-id enum, 3 payload schemas, 3 `EVENT_CATALOG` entries (`sensitiveFields: []`), inferred payload type exports. Mirror the existing calendar-event block.
- `packages/ledger/src/projections/onboarding.ts` -- NEW pure projection: `OnboardingStepId`, `OnboardingStepMode`, `OnboardingProgress` types + `projectOnboarding(events)`. Mirror `projections/commitment.ts` (switch on `eventType` only).
- `packages/ledger/src/index.ts` -- export the new payloads, types, `projectOnboarding`, and the canonical `ONBOARDING_STEP_IDS` list.
- `packages/ledger/src/projections/onboarding.test.ts` -- NEW unit tests for the matrix rows.
- `apps/web/src/lib/onboarding/steps.ts` -- NEW ordered presentation catalog (`id`, `title`, `whatThisProtects` copy) keyed off `ONBOARDING_STEP_IDS`; helpers `firstIncompleteStep(progress)`, `nextStep(id)`, `isValidStep(id)`.
- `apps/web/src/lib/onboarding/progress.ts` -- NEW server reader: `readOnboardingProgress()` = `projectOnboarding(await getStores().ledger.readEvents({ context: 'joint' }))`.
- `apps/web/src/app/(app)/onboarding/actions.ts` -- NEW `'use server'` actions: `beginOnboarding()`, `advanceStep(stepId, mode)`, `finishOnboarding()` — append via `getStores().ledger.append({ actor: session.user.id, context: 'joint', ... })` then `redirect`.
- `apps/web/src/app/(app)/onboarding/page.tsx` -- NEW entry (`dynamic='force-dynamic'`): welcome / resume-redirect / done, based on progress.
- `apps/web/src/app/(app)/onboarding/[step]/page.tsx` -- NEW step renderer: progress indicator + title + rationale + Continue/Skip forms; invalid step → redirect.
- `apps/web/src/app/(app)/onboarding/complete/page.tsx` -- NEW review + explicit Finish.
- `apps/web/src/components/onboarding/onboarding-progress.tsx` -- NEW accessible progress indicator (current step via `aria-current`; done/skipped by text+shape, not color).
- `apps/web/src/components/side-nav.tsx` -- add a footer nav entry linking to `/onboarding` as the entry point to start setup.
- `apps/web/src/lib/onboarding/steps.test.ts`, `apps/web/src/components/onboarding/onboarding-progress.test.ts` -- NEW tests for resume/next/validation logic and accessible rendering.

## Tasks & Acceptance

**Execution:**
- [x] `packages/ledger/src/events/catalog.ts` -- add `onboardingStepIdEnum`, `onboardingStartedPayload`, `onboardingStepCompletedPayload` (`mode: z.enum(['entered','skipped'])`), `onboardingCompletedPayload`; register all three in `EVENT_CATALOG` with `sensitiveFields: []`; export inferred types -- extend the single-source catalog (AD-4).
- [x] `packages/ledger/src/projections/onboarding.ts` -- implement `projectOnboarding` and progress types; idempotent start, latest-wins step, completed flag; ignore unknown types -- pure derived state (AD-4).
- [x] `packages/ledger/src/index.ts` -- re-export new payloads/types/`projectOnboarding`/`ONBOARDING_STEP_IDS` -- keep the core's public surface complete.
- [x] `apps/web/src/lib/onboarding/steps.ts` -- presentation catalog + `firstIncompleteStep`/`nextStep`/`isValidStep` -- own order + copy in the host.
- [x] `apps/web/src/lib/onboarding/progress.ts` -- `readOnboardingProgress()` reader over `readEvents({ context: 'joint' })` -- the read seam (AD-1).
- [x] `apps/web/src/app/(app)/onboarding/actions.ts` -- `beginOnboarding`/`advanceStep`/`finishOnboarding` appending catalog-valid events with `actor = session.user.id`, `context: 'joint'`, then redirect -- the write seam (AD-1).
- [x] `apps/web/src/app/(app)/onboarding/page.tsx` -- entry: welcome (first-run), resume-redirect, or done -- container entry.
- [x] `apps/web/src/app/(app)/onboarding/[step]/page.tsx` -- step shell: progress indicator, title, "What this protects", Continue/Skip; invalid step → `/onboarding` -- the walked sequence.
- [x] `apps/web/src/app/(app)/onboarding/complete/page.tsx` -- calm review + explicit Finish → `/today` -- honest completion.
- [x] `apps/web/src/components/onboarding/onboarding-progress.tsx` -- accessible progress indicator -- non-color status + aria.
- [x] `apps/web/src/components/side-nav.tsx` -- add `/onboarding` footer entry -- the "start setup" entry point.
- [x] `packages/ledger/src/projections/onboarding.test.ts`, `apps/web/src/lib/onboarding/steps.test.ts`, `apps/web/src/components/onboarding/onboarding-progress.test.ts` -- cover the I/O matrix rows and accessible rendering.

**Acceptance Criteria:**
- Given a fresh account, when I open `/onboarding`, then I see a calm first-run welcome (no gamification/guilt) that lets me start a multi-step flow with visible progress, styled with `globals.css` tokens.
- Given I am partway through, when I abandon and return to `/onboarding`, then I resume at the first step I have not completed and nothing I already did is lost (progress is reconstructed from events).
- Given any step, when I choose Skip, then the flow advances and the step is recorded as `skipped` (skippable-with-defaults; per-step default *values* arrive with 2.2–2.5).
- Given any step, when it renders, then it names why it matters ("What this protects") and is fully keyboard operable with a visible focus ring, landmark roles, and status conveyed without relying on color.
- Given I complete or skip all steps, when I finish, then `OnboardingCompleted` is recorded (pairing with `OnboardingStarted` to enable story 2.6's timing proof) and I land on `/today`.

## Spec Change Log

_No spec amendments — the review produced no intent_gap or bad_spec findings._

## Review Triage Log

### 2026-07-14 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 7: (high 0, medium 2, low 5)
- defer: 1: (high 0, medium 0, low 1)
- reject: 8
- addressed_findings:
  - `[medium]` `[patch]` `finishOnboarding` appended `OnboardingCompleted` unconditionally (double / start-less / re-finish) — added a started-and-not-completed guard so stray finishes append nothing and just redirect.
  - `[medium]` `[patch]` the `[step]` page rendered Continue/Skip when not-started or already-completed, allowing pre-start/post-completion step mutation and an impossible `started:false`+recorded state — added a guard redirecting stray visits to `/onboarding`.
  - `[low]` `[patch]` `advanceStep` used a second linear `nextStep` ordering that could disagree with the log — route solely on `firstIncompleteStep` (null → review screen); dropped the now-unused import.
  - `[low]` `[patch]` the projection `String()`-coerced payload timestamps/`mode` (missing field → literal `"undefined"`; unknown mode → silent `entered`) — narrowed to `typeof`-string + strict mode; malformed events are ignored.
  - `[low]` `[patch]` the progress `aria-label` conflated step position with completion count — announce position and recorded-count separately, a count-only form on the review screen, and a safe fallback for an unknown current step (test updated + review-screen test added).
  - `[low]` `[patch]` stale side-nav footer comments named only "Settings" — updated to name the Setup (Story 2.1) entry.
  - `[low]` `[patch]` the onboarding step-id list was duplicated (catalog `z.enum` literal vs projection `ONBOARDING_STEP_IDS`) — the catalog enum now derives from `ONBOARDING_STEP_IDS` (single source of truth).

## Design Notes

Server-driven, not a client wizard: state lives entirely in events, so resume/"lose nothing" need no client state and match the codebase's RSC + server-action + native-`<form>` idiom (see `settings/connections`). Each Continue/Skip is a form posting a server action that appends one event and `redirect()`s to the next incomplete step.

Context tag = `joint`: onboarding progress is meta over the whole life model (spans work + personal), so `joint` is the correct non-null AD-5 tag; document this at the catalog entries. Onboarding events carry no PII (`sensitiveFields: []`), so the encryption path is not exercised.

Why in-memory projection (no table): progress is a single-user singleton read only during onboarding; `readEvents({ context: 'joint' })` + a pure reducer satisfies "state served from projections" without a migration (flagged non-trivial in deferred-work). Reducer sketch:

```ts
// projectOnboarding(events): OnboardingProgress
case 'OnboardingStarted':      return p.started ? p : { ...p, started:true, startedAt };
case 'OnboardingStepCompleted': return { ...p, steps: { ...p.steps, [stepId]: { mode, at } } };
case 'OnboardingCompleted':     return { ...p, completed:true, completedAt };
default:                        return p; // ignore unrelated events
```

## Verification

**Commands:**
- `npm run typecheck` -- expected: passes (new files type-clean, exports resolve).
- `npm run lint` -- expected: passes, including fixture proofs and AD-1 dependency-direction rules.
- `npm test` -- expected: passes; new ledger projection tests and web onboarding tests green.

**Manual checks:**
- From a fresh account, tab through `/onboarding` and each step with keyboard only: focus ring visible, progress announced, Skip and Continue both advance and persist; refresh mid-flow resumes at the right step.

## Auto Run Result

Status: done

**Implemented change:** The guided-onboarding *container* (Story 2.1). A server-driven, resumable, skippable multi-step flow under `/onboarding` walks the ordered life-model sequence (`boundaries → commitments → people → goals`, filled by 2.2–2.5). Each step shows a calm "What this protects" rationale plus Continue / Skip; every advance appends one append-only ledger event (`context: 'joint'`, no PII). Progress is a pure in-memory projection over the event log — no DB table or migration — so resume and "lose nothing" fall out of the ledger. Start/finish timestamps are recorded to enable Story 2.6's ≤45-minute proof.

**Files changed:**
- `packages/ledger/src/events/catalog.ts` — added `OnboardingStarted` / `OnboardingStepCompleted` / `OnboardingCompleted` (joint, `sensitiveFields: []`); step-id enum derived from the single canonical `ONBOARDING_STEP_IDS`.
- `packages/ledger/src/projections/onboarding.ts` — canonical step-id list, progress types, and pure `reduceOnboarding`/`projectOnboarding` (idempotent start, latest-wins step, completed flag, malformed-event-safe).
- `packages/ledger/src/index.ts` — re-exports the new payloads, types, projection, and `ONBOARDING_STEP_IDS`.
- `apps/web/src/lib/onboarding/steps.ts` — ordered presentation catalog (titles + rationale) + `isValidStep`/`firstIncompleteStep`/`nextStep`/`stepContent`.
- `apps/web/src/lib/onboarding/progress.ts` — `readOnboardingProgress()` = project over `readEvents({ context: 'joint' })`.
- `apps/web/src/app/(app)/onboarding/actions.ts` — `beginOnboarding`/`advanceStep`/`finishOnboarding` server actions (append + redirect; guarded terminal transitions).
- `apps/web/src/app/(app)/onboarding/page.tsx` — entry: first-run welcome / resume-redirect / done summary.
- `apps/web/src/app/(app)/onboarding/[step]/page.tsx` — step shell: progress + title + rationale + Continue/Skip; stray-visit guard.
- `apps/web/src/app/(app)/onboarding/complete/page.tsx` — calm review + explicit Finish → `/today`.
- `apps/web/src/components/onboarding/onboarding-progress.tsx` — accessible progress indicator (status by text/shape, `aria-current="step"`, position vs. count announced separately).
- `apps/web/src/components/side-nav.tsx` — Setup footer nav entry (the "start setup" entry point).
- Tests: `packages/ledger/src/projections/onboarding.test.ts`, `apps/web/src/lib/onboarding/steps.test.ts`, `apps/web/src/components/onboarding/onboarding-progress.test.ts`, and `apps/web/src/components/side-nav.test.ts` (updated).
- Cleanup (required for the build to pass): removed three stale conflict-copy files accidentally committed earlier — `apps/web/src/middleware 2.ts`, `packages/broker/src/index 2.ts`, `packages/connectors/src/index.test 2.ts` (each a superseded duplicate of its canonical file; the stale test broke `tsc --build`).

**Review findings breakdown:** 7 patches applied (2 medium: guarded `finishOnboarding` and the step page against duplicate/orphan and pre-start/post-completion events; 5 low: single-source routing, projection defensive narrowing, accurate progress `aria-label`, single-source step-id enum, stale comments). 1 deferred (unbounded/no-actor `joint`-stream read — fine under the one-user architecture; logged to `deferred-work.md`). 8 rejected (repo-convention token usage with dark mode deferred to Epic 13; correct link-vs-button semantics; benign append-only duplicate rows; standard pure-reducer test; projection ordering contract matching the existing commitment projection; already-covered nav test; done+current status being legitimate; projection reflecting events by design). No intent_gap, no bad_spec — no spec amendment or re-derivation.

**Follow-up review recommended:** false — the review-driven changes are localized, low-consequence defensive/clarity hardening, fully covered by the gates and new tests; they do not alter the core happy path.

**Verification performed:** `npm run typecheck` PASS, `npm run lint` PASS (5/5 fixture proofs), `npm test` PASS (31 files, 259 tests; Postgres-backed suites ran and passed). Verified independently after the implementation subagent returned and again after the review patches.

**Residual risks:** The onboarding step BODIES are intentionally placeholder (rationale + Continue/Skip only) pending Stories 2.2–2.5 — the container is complete but not yet collecting life-model data. Surfaces are pinned to `--light-*` tokens (dark mode deferred to Epic 13 by design). The deferred `joint`-stream read is safe only while the one-app-user invariant (AD-5) holds.
