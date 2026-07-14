---
title: 'Boundaries, Domains, and Starter Policies'
type: 'feature'
created: '2026-07-14'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: 'ad7bfad85e91889e3bb891a080946ff0f911174b'
final_revision: 'e65ad51e585bb13967763aeb72fc1555a06db4a4'
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-life-focus-2026-07-12/EXPERIENCE.md'
warnings: ['oversized']
---

<intent-contract>

## Intent

**Problem:** Story 2.1 built the onboarding container but the `boundaries` step is a placeholder (rationale + Continue/Skip). The planner needs Sean's non-negotiables before it can propose anything: his workday shape, 4:30 hard stop, sleep window, his life domains, and his accepted starter policies. None of that can yet be captured or persisted.

**Approach:** Fill the `boundaries` step body with three calm sub-sections — daily boundaries (workday start / hard stop / sleep window), the 11 default life domains (rename / disable / add), and the two MVP starter policy templates (accept-with-edits / decline). Each sub-section persists independently as additive AD-4 events on the existing `joint` stream and re-renders from pure projections — no new table, no migration. The container's Continue/Skip (`advanceStep('boundaries', …)`) is reused unchanged.

## Boundaries & Constraints

**Always:**
- Persist as append-only events only (AD-4). New event types (context `joint`): `BoundariesSet { workdayStart, hardStop, sleepStart, sleepEnd, updatedAt }` (`sensitiveFields: []`); `DomainRenamed { domainId, name, at }` and `DomainAdded { domainId, name, at }` (`sensitiveFields: ['name']`); `DomainSetEnabled { domainId, enabled, at }` (`[]`); `PolicyTemplateAccepted { templateId, content, at }` (`sensitiveFields: ['content']`); `PolicyTemplateDeclined { templateId, at }` (`[]`). Payload schemas defined once in `packages/ledger` catalog and validated via the existing `validateEventPayload` path. No UPDATE/DELETE; edits are latest-wins forward events. Host only appends + reads projections (AD-1).
- Times are `"HH:MM"` 24-hour strings, format-validated by the zod schema and re-validated in the action; no ordering constraint (sleep may cross midnight). Empty/blank names and malformed times are rejected without appending.
- Current state is derived by pure projections over `readEvents({ context: 'joint' })`: `projectBoundaries` (latest-wins singleton, `null` until first set), `projectDomains` (seed the canonical 11 defaults, then fold rename/enable/add — latest-wins), `projectPolicyTemplates` (per template: latest of accepted/declined wins → `pending | accepted | declined`). Every projection ignores unknown event types (default case), mirroring `projections/commitment.ts` and `projections/onboarding.ts`.
- The canonical `DEFAULT_DOMAINS` (11 stable kebab ids + default display names from PRD FR-1) and `POLICY_TEMPLATE_IDS` (`non-negotiables`, `work-boundaries`) live once in `packages/ledger` and are re-exported from its index; presentation copy (policy explanations + default policy text) lives in `apps/web`.
- Reuse the 2.1 container: the existing Continue/Skip still call `advanceStep('boundaries', 'entered'|'skipped')` to record step completion and advance — do not change the container or `projectOnboarding`. Each sub-form posts a `'use server'` action that appends then returns to `/onboarding/boundaries` (PRG redirect or `revalidatePath`) so the re-render reflects the projection.
- Actor on every append is `session.user.id`; routes stay under the authenticated `(app)` shell.
- Every surface uses `globals.css` design tokens (byte-identical to DESIGN.md) and meets the Epic-1 a11y floor: full keyboard operability, `:focus-visible` rings, landmark/labelled sections, screen-reader labels, and status conveyed by text + shape — a disabled domain and an accepted/declined template must read as such **without relying on color**.
- Copy obeys EXPERIENCE.md calm voice: plain-language template explanations, no guilt/gamification/motivational prompts, forbidden-words list respected. A declined template is recorded once and never nagged — its card shows a calm "you can add this later" state, no re-prompt.

**Block If:**
- A required token, calm-voice rule, or a11y requirement cannot be satisfied without inventing a new token or breaking byte-identity → HALT (blocked).
- Persisting boundaries/domains/policies would require a projection table or migration beyond the additive `joint` events above → HALT (blocked); the migration path is flagged non-trivial in the deferred-work ledger.
- The sensitive-field encryption path cannot encrypt `name`/`content` through the existing `validateEventPayload` + `LedgerStore.append` seam → HALT (blocked).

**Never:**
- Do NOT build the commitments / people / goals step bodies (stories 2.3–2.5), the Policy & Boundaries settings surface (2.7), or the ≤45-minute assertion / e2e replay (2.6).
- Do NOT ship the full policy catalog — only the two MVP templates. No relationship scores. No per-domain planning weights or silos (domains inform, they do not gate).
- No client-side wizard state library (stay RSC + server actions + native `<form>`, matching the codebase). No UPDATE/DELETE. No color-only status. No nagging on decline.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fresh boundaries step | no boundary/domain/policy events | boundary fields empty (placeholder), 11 default domains enabled, both templates `pending` | No error expected |
| Set boundaries | `BoundariesSet` valid times | times persist; re-render shows them; hard stop labelled as the firm line | Malformed time → no append, values unchanged |
| Rename a domain | `DomainRenamed { domainId, name }` | that domain's effective name updates (latest-wins) | Blank name → no append |
| Disable / re-enable a domain | `DomainSetEnabled { enabled:false }` then `{true}` | domain stays listed; disabled state shown by text+shape; latest-wins | Unknown domainId → ignored |
| Add a custom domain | `DomainAdded { domainId, name }` | new custom domain appended to the list, enabled | Blank name → no append |
| Accept a template (edited) | `PolicyTemplateAccepted { templateId, content }` | template shows `accepted` with the saved content | Empty content → no append |
| Decline a template | `PolicyTemplateDeclined { templateId }` | template shows a calm `declined` state; not re-prompted | No error expected |
| Re-accept after decline | decline then accept same template | latest-wins → `accepted` | No error expected |
| Continue | `advanceStep('boundaries','entered')` | `OnboardingStepCompleted` recorded; redirect to `commitments` | No error expected |
| Skip | `advanceStep('boundaries','skipped')` | recorded `skipped`; defaults (11 domains, unset times) remain; flow advances | No error expected |
| Unrelated joint events present | onboarding/other joint events in stream | each projection ignores unknown types (default case) | No error expected |

</intent-contract>

## Code Map

- `packages/ledger/src/events/catalog.ts` -- add 6 zod payload schemas + `EVENT_CATALOG` entries (correct `sensitiveFields`) + inferred type exports; mirror the `CommitmentCaptured` block.
- `packages/ledger/src/projections/boundaries.ts` -- NEW: `DailyBoundaries` type + `projectBoundaries(events)` (latest-wins singleton, `null` until set).
- `packages/ledger/src/projections/domains.ts` -- NEW: canonical `DEFAULT_DOMAINS` (11 ids+names), `DomainRow` type, `projectDomains(events)` (seed defaults, fold rename/enable/add).
- `packages/ledger/src/projections/policies.ts` -- NEW: `POLICY_TEMPLATE_IDS`, `PolicyTemplateState`, `projectPolicyTemplates(events)` (per-template latest-wins pending/accepted/declined).
- `packages/ledger/src/index.ts` -- re-export new payloads, types, projections, `DEFAULT_DOMAINS`, `POLICY_TEMPLATE_IDS`.
- `packages/ledger/src/projections/boundaries.test.ts`, `domains.test.ts`, `policies.test.ts` -- NEW unit tests for the matrix + projection rows.
- `apps/web/src/lib/onboarding/boundaries.ts` -- NEW reader: one `readBoundariesStepData()` reading `readEvents({ context:'joint' })` once, returning `{ boundaries, domains, policies }`.
- `apps/web/src/lib/onboarding/policy-templates.ts` -- NEW presentation catalog: `templateId → { title, explanation, defaultContent }` in calm voice.
- `apps/web/src/app/(app)/onboarding/boundaries-actions.ts` -- NEW `'use server'` actions: `saveBoundaries`, `renameDomain`, `setDomainEnabled`, `addDomain`, `acceptPolicyTemplate`, `declinePolicyTemplate` — append (actor `session.user.id`, `context:'joint'`) then re-render the step.
- `apps/web/src/components/onboarding/boundaries/boundaries-form.tsx` -- NEW: workday-start / hard-stop / sleep-window time inputs + save.
- `apps/web/src/components/onboarding/boundaries/domain-list.tsx` -- NEW: default+custom domain rows (rename form, enable/disable toggle) + add-custom form; disabled state by text+shape.
- `apps/web/src/components/onboarding/boundaries/policy-templates.tsx` -- NEW: two template cards (editable textarea + Accept / Decline; accepted/declined by text+icon).
- `apps/web/src/app/(app)/onboarding/[step]/page.tsx` -- MODIFY: when `step === 'boundaries'` render the three boundaries sections (reading `readBoundariesStepData()`) between rationale and Continue/Skip; other steps keep the generic placeholder.
- `apps/web/src/components/onboarding/boundaries/boundaries-step.test.ts`, `apps/web/src/lib/onboarding/policy-templates.test.ts` -- NEW: accessible-rendering + catalog tests.

## Tasks & Acceptance

**Execution:**
- [x] `packages/ledger/src/events/catalog.ts` -- add `BoundariesSet`, `DomainRenamed`, `DomainAdded`, `DomainSetEnabled`, `PolicyTemplateAccepted`, `PolicyTemplateDeclined` payloads + catalog entries (`sensitiveFields` per Always) + type exports -- single-source catalog (AD-4/SEC-1).
- [x] `packages/ledger/src/projections/boundaries.ts` -- `projectBoundaries` latest-wins singleton -- pure derived state.
- [x] `packages/ledger/src/projections/domains.ts` -- `DEFAULT_DOMAINS` + `projectDomains` (seed 11, fold rename/enable/add, latest-wins, ignore unknown) -- canonical domain catalog.
- [x] `packages/ledger/src/projections/policies.ts` -- `POLICY_TEMPLATE_IDS` + `projectPolicyTemplates` (per-template pending/accepted/declined latest-wins) -- template state.
- [x] `packages/ledger/src/index.ts` -- re-export new payloads/types/projections/constants -- complete public surface.
- [x] `apps/web/src/lib/onboarding/boundaries.ts` -- `readBoundariesStepData()` over a single `readEvents({ context:'joint' })` -- the read seam (AD-1).
- [x] `apps/web/src/lib/onboarding/policy-templates.ts` -- calm-voice presentation catalog for the two templates -- host-owned copy.
- [x] `apps/web/src/app/(app)/onboarding/boundaries-actions.ts` -- 6 server actions appending catalog-valid events (`actor`, `context:'joint'`) then re-rendering the step; reject blank names / empty content / malformed times -- the write seam (AD-1).
- [x] `apps/web/src/components/onboarding/boundaries/boundaries-form.tsx` -- time inputs + save form -- daily boundaries capture.
- [x] `apps/web/src/components/onboarding/boundaries/domain-list.tsx` -- rename / enable-disable / add rows, disabled by text+shape -- domain review.
- [x] `apps/web/src/components/onboarding/boundaries/policy-templates.tsx` -- editable template cards with Accept/Decline, status by text+icon -- starter policies.
- [x] `apps/web/src/app/(app)/onboarding/[step]/page.tsx` -- render the boundaries body for `boundaries`, generic placeholder otherwise; keep Continue/Skip -- the filled step.
- [x] `packages/ledger/src/projections/{boundaries,domains,policies}.test.ts`, `apps/web/src/components/onboarding/boundaries/boundaries-step.test.ts`, `apps/web/src/lib/onboarding/policy-templates.test.ts` -- cover the I/O matrix + accessible rendering.

**Acceptance Criteria:**
- Given the boundaries step, when I set my workday start, hard stop, and sleep window with valid times, then a `BoundariesSet` event persists and returning to the step shows the saved values.
- Given the 11 default domains, when I rename one, disable one, and add a custom one, then each change persists as its own AD-4 event and the projected list reflects the effective names, enabled states, and the new custom domain — with disabled state conveyed without relying on color.
- Given the two starter policy templates rendered with plain-language explanations, when I edit and accept one and decline the other, then the accepted template stores my edited content and the declined one is recorded once and shown calmly without any re-prompt.
- Given I have configured (or skipped) the boundaries step, when I choose Continue or Skip, then the 2.1 container records the step and advances to `commitments` unchanged, and nothing I entered is lost on return.
- Given every boundaries surface, when it renders, then it uses only `globals.css` tokens and is fully keyboard operable with visible focus rings, labelled sections, and screen-reader-legible status.

## Spec Change Log

_No spec amendments — the review produced no intent_gap or bad_spec findings._

## Review Triage Log

### 2026-07-14 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 0, low 2)
- defer: 2: (high 0, medium 0, low 2)
- reject: 11
- addressed_findings:
  - `[low]` `[patch]` `acceptPolicyTemplate`/`declinePolicyTemplate` appended a catalog-valid event for any non-empty `templateId` (tampered/stale form → permanent junk row the projection silently drops) — now reject unknown ids via the canonical `POLICY_TEMPLATE_IDS` set before appending, so the append is never a lie.
  - `[low]` `[patch]` the boundaries body was wrapped in a named `<section>` landmark whose only heading was a hand-rolled visually-hidden `<h2>` (deprecated inline `clip` hack), redundantly nesting three already-labelled child sections in the screen-reader landmark tree — replaced with a plain grouping `<div>`.

## Design Notes

Context tag = `joint`: boundaries, domains, and policy templates are life-model *configuration* spanning work + personal, so `joint` is the correct non-null AD-5 tag — and it lets `readBoundariesStepData()` reuse the same single `readEvents({ context:'joint' })` seam the onboarding projection already uses. When these later generate *plannable items* (Epics 3–4), those items get specific contexts; the config entities do not.

Sensitive fields: `DomainRenamed.name`, `DomainAdded.name`, and `PolicyTemplateAccepted.content` are user free-text that can carry work/customer specifics (SEC-1), so they are encrypted at rest via the existing sensitive-field path (as `CommitmentCaptured.title` is). Times and enabled flags are not identifying → not sensitive.

Domain projection seeds then folds (sketch):
```ts
// projectDomains(events): DomainRow[]
const rows = DEFAULT_DOMAINS.map(d => ({ ...d, enabled: true, custom: false }));
case 'DomainAdded':      rows.push({ id, name, enabled: true, custom: true });
case 'DomainRenamed':    row(id) && (row(id).name = name);        // latest-wins
case 'DomainSetEnabled': row(id) && (row(id).enabled = enabled);  // latest-wins
default:                 /* ignore */
```
Latest-wins uses event order (append order), matching the commitment/onboarding projections — no `compensatesEventId` reads (rebuild purity).

Sub-forms, not one mega-submit: each section (boundaries save, per-domain rename/toggle, add-domain, per-template accept/decline) is its own native `<form action={serverAction}>` posting one append and returning to the step — the PRG idiom already used across the app, keyboard/no-JS operable, no client wizard state.

## Verification

**Commands:**
- `npm run typecheck` -- expected: passes (new files type-clean, exports resolve).
- `npm run lint` -- expected: passes, including fixture proofs and AD-1 dependency-direction rules.
- `npm test` -- expected: passes; new ledger projection tests and web boundaries tests green.

**Manual checks:**
- From a fresh account, open `/onboarding/boundaries` keyboard-only: set times, rename/disable/add a domain, accept one template and decline the other; refresh — every change persisted and the declined template is not re-prompted; focus rings visible and disabled/accepted/declined states legible without color.

## Auto Run Result

Status: done

**Implemented change:** Filled the onboarding `boundaries` step body (Story 2.2) with three calm, independently-persisting sub-sections — daily boundaries (workday start / hard stop / sleep window), the 11 default life domains (rename / disable / add-custom), and the two MVP starter policy templates (accept-with-edits / decline). Every change is an additive AD-4 event on the existing `joint` stream, and current state is derived by three pure projections — no new table, no migration. The 2.1 container's Continue/Skip (`advanceStep('boundaries', …)`) and `projectOnboarding` are untouched.

**Files changed:**
- `packages/ledger/src/events/catalog.ts` — 6 new event payloads + catalog entries (`DomainRenamed.name`, `DomainAdded.name`, `PolicyTemplateAccepted.content` sensitive; times/flags not) + inferred type exports.
- `packages/ledger/src/projections/boundaries.ts` — `projectBoundaries` (latest-wins singleton, null until set).
- `packages/ledger/src/projections/domains.ts` — canonical `DEFAULT_DOMAINS` (11 stable kebab ids, PRD FR-1) + `projectDomains` (seed defaults, fold add/rename/enable latest-wins, ignore unknown/malformed/duplicate).
- `packages/ledger/src/projections/policies.ts` — `POLICY_TEMPLATE_IDS` + `projectPolicyTemplates` (per-template pending/accepted/declined latest-wins).
- `packages/ledger/src/index.ts` — re-exports the new payloads, types, projections, and constants.
- `apps/web/src/lib/onboarding/boundaries.ts` — `readBoundariesStepData()` (single `readEvents({ context: 'joint' })`, three projections).
- `apps/web/src/lib/onboarding/policy-templates.ts` — calm-voice presentation catalog for the two templates.
- `apps/web/src/app/(app)/onboarding/boundaries-actions.ts` — 6 `'use server'` actions (append `joint`, actor `session.user.id`, PRG redirect); reject blank names / empty content / malformed times / unknown template ids without appending.
- `apps/web/src/components/onboarding/boundaries/{boundaries-form,domain-list,policy-templates}.tsx` — the three accessible section components (status by text + shape/icon, never color alone).
- `apps/web/src/app/(app)/onboarding/[step]/page.tsx` — renders the boundaries body only for `step === 'boundaries'`; other steps keep the generic placeholder; Continue/Skip unchanged.
- Tests: `packages/ledger/src/projections/{boundaries,domains,policies}.test.ts`, `apps/web/src/components/onboarding/boundaries/boundaries-step.test.ts`, `apps/web/src/lib/onboarding/policy-templates.test.ts`.

**Review findings breakdown:** 2 patches applied (both low: rejected unknown `templateId` in the accept/decline actions so the append-only log can't accumulate silently-dropped junk rows; replaced a redundant named-landmark wrapper + hand-rolled `clip` hidden-heading with a plain grouping `<div>`). 2 deferred (per-event erasure scopes give sensitive config free-text no collective crypto-shred grouping; the boundaries step reads the `joint` stream a second time per render — both logged to `deferred-work.md`). 11 rejected: silent no-append-without-error (explicitly the specified behavior — inputs are `required` + typed), `redirect()`-without-`return` (matches the existing onboarding `actions.ts` idiom), no domain-remove / no accept→decline UI (within the rename/disable/add spec scope; re-acceptance belongs to the "not nagged" Story 2.7 surface), redacted-marker pre-fill (speculative; no erasure path active in 2.2), `sleepStart === sleepEnd` semantics (Epic 4 planner concern), no max-length (no cap convention — `CommitmentCaptured.title` has none either), double-click toggle race (inherent to the mandated PRG/no-client-state design), duplicate custom-domain names (unspecified product decision), core/host template-catalog drift (already guarded by the completeness test), and projection defensive-narrowing being "weaker" than the schema (matches the existing commitment/onboarding projection pattern; empty strings are already blocked by the catalog `.min(1)` + action trim). No intent_gap, no bad_spec — no spec amendment or re-derivation.

**Follow-up review recommended:** false — the two review-driven changes are localized, low-consequence defensive/clarity hardening, fully covered by the gates and existing tests; they do not alter the core happy path.

**Verification performed:** `npm run typecheck` PASS, `npm run lint` PASS (5/5 fixture proofs), `npm test` PASS (36 files, 301 tests; Postgres-backed ledger/mirror suites ran and passed). Run independently after the implementation subagent returned, and again after the two review patches.

**Residual risks:** Surfaces are pinned to `--light-*` tokens (dark mode deferred to Epic 13 by design). Sensitive config free-text lacks a collective erasure scope and the boundaries step reads the `joint` stream twice per render — both safe at MVP scale and logged to `deferred-work.md` for the erasure/Policy-surface work. The commitments/people/goals step bodies remain placeholders pending Stories 2.3–2.5; re-entry editing and the ≤45-minute proof are Story 2.6.
