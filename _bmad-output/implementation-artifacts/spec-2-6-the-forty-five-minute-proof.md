---
title: 'Story 2.6: The Forty-Five-Minute Proof'
type: 'feature'
created: '2026-07-14'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: ['oversized']
baseline_revision: '6cc12d50d2c798ad0d48688e18e90a3d6bd2df6b'
final_revision: 'db740d05411e8fba21a540b1be073d62b3ccde50'
---

<intent-contract>

## Intent

**Problem:** AC-2 — the whole life model set up in a single sitting of ≤45 minutes — is the headline success criterion of Epic 2, yet nothing proves it end-to-end. Story 2.1 already persists an instrumented `OnboardingStarted`/`OnboardingCompleted` timestamp pair and every step already edits-in-place rather than duplicating, but there is no derivation that turns those timestamps into a ≤45-minute verdict and no automated test that replays a full sitting and confirms every entity is queryable.

**Approach:** Add one small pure "instrument" in `packages/ledger` deriving sitting duration (and a ≤45 predicate) from the persisted start/complete pair, then prove AC-2 with an automated end-to-end replay of a full, catalog-valid onboarding journey — asserted queryable from every projection, within the 45-minute limit, and edit-not-duplicate on re-entry. Run two ways: a pure always-on proof over the projections, and a Postgres-gated durable proof through the real `LedgerStore`.

## Boundaries & Constraints

**Always:**
- Every event in the replay fixture is validated against `EVENT_CATALOG` (`validateEventPayload`) so the journey cannot drift from the real event shapes the server actions emit.
- The instrument is pure and lives in `packages/ledger` (AD-1: no adapter/host/I/O imports); it derives only from the persisted `OnboardingStarted`/`OnboardingCompleted` pair (AD-4).
- The ≤45 boundary is inclusive (exactly 45 minutes passes).
- The pure proof runs with no Docker/Postgres; the durable proof reuses the existing `startPg()` harness and is `describe.skipIf(!hasPg)`.
- Re-entry idempotency is proven on the singletons (`OnboardingStarted` first-wins, `BoundariesSet`/domain/policy/`OnboardingStepCompleted` latest-wins); entity streams (commitments/people/goals) are id-keyed append-only and must show no duplicated rows on re-projection.

**Block If:**
- Proving any required entity minimum (boundaries, domains, policy, ≥3 hard commitments, ≥1 protected priority, ≤3 goals, ≥5 people with dates+rhythms) turns out to require inventing a new event type or entity rather than composing existing catalog events. It should not — HALT with that blocking condition if it does.

**Never:**
- No new browser/e2e framework (Playwright/Cypress) and no HTTP-driven UI automation — none exists in the repo, server actions require session/redirect context unavailable headless, and the durable spine (the ledger) is the system of record AC-2 is about.
- No new entities, events, store methods, migrations, or UI changes.
- No relationship scoring, rating, rank, or health metric anywhere (P5/FR-12).

## I/O & Edge-Case Matrix

Behavior of the new instrument (`onboardingSittingMinutes` / `isOnboardingWithinSittingLimit`) over an `OnboardingProgress`:

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Within limit | started 10:00, completed 10:40 | minutes ≈ 40; within = true | No error |
| Exactly at limit | completed = started + 45min | minutes = 45; within = true | Boundary inclusive |
| Over limit | completed = started + 46min | minutes = 46; within = false | Not an error; predicate false |
| Not yet completed | started, `completedAt` null | minutes = null; within = false | Returns null, never throws |
| Not started | empty progress | minutes = null; within = false | Returns null |
| Inverted/unmeasurable | completed earlier than started, or unparseable timestamp | minutes = null; within = false | Treated as unmeasurable |

</intent-contract>

## Code Map

- `packages/ledger/src/projections/onboarding.ts` -- ADD the instrument: `ONBOARDING_SITTING_LIMIT_MINUTES = 45`, `onboardingSittingMinutes(progress): number | null` (null unless `started && completed` and both timestamps parse and completed ≥ started; else `(completed - started) / 60000`), `isOnboardingWithinSittingLimit(progress): boolean` (non-null minutes and ≤ limit). Existing projection/`OnboardingProgress` already exposes `startedAt`/`completedAt` (see line 73 note anticipating 2.6).
- `packages/ledger/src/index.ts` -- re-export the constant + two functions.
- `packages/ledger/src/projections/onboarding.test.ts` -- MODIFY: cover the I/O matrix for the instrument.
- `packages/ledger/src/onboarding-journey.test.ts` -- NEW pure end-to-end proof (see Tasks). Builds a catalog-valid full-sitting `DomainEvent[]`, validates each payload against `EVENT_CATALOG`, runs every projection, asserts minimums + within-limit + edit-not-duplicate. No DB.
- `packages/db/src/ledger/onboarding-journey.test.ts` -- NEW PG-gated durable replay: appends the same journey through `createLedgerStore(...)`, `readEvents()`, re-projects, asserts the same minimums + within-limit + edit-not-duplicate survive encrypt-at-rest/decrypt-on-read. Mirrors `store.test.ts` harness (`startPg`, `pgAvailable`, `MASTER_KEY`, `skipIf(!hasPg)`).
- `packages/ledger/src/index.test.ts` -- MODIFY: assert the new instrument exports resolve.

## Tasks & Acceptance

**Execution:**
- [x] `packages/ledger/src/projections/onboarding.ts` -- add `ONBOARDING_SITTING_LIMIT_MINUTES`, `onboardingSittingMinutes`, `isOnboardingWithinSittingLimit` -- pure instrument deriving the ≤45 verdict from the persisted start/complete pair (AD-4).
- [x] `packages/ledger/src/index.ts` + `packages/ledger/src/index.test.ts` -- export the new instrument and assert the exports resolve -- complete public surface.
- [x] `packages/ledger/src/projections/onboarding.test.ts` -- unit-test the instrument across the I/O matrix (within / exactly-45 / over / not-completed / not-started / inverted-or-unparseable) -- edge coverage.
- [x] `packages/ledger/src/onboarding-journey.test.ts` -- NEW pure proof: a `buildOnboardingJourney()` helper emits an ordered, catalog-valid `DomainEvent[]` for a full sitting — `OnboardingStarted` @T0 → `BoundariesSet` → one `DomainRenamed` on a real `DEFAULT_DOMAINS` id → ≥1 `PolicyTemplateAccepted` → 3 `CommitmentCaptured` `hard-commitment` + 1 `protected-priority` → 5 `PersonAdded` (each ≥1 important date + a rhythm) → 3 `GoalAdded` (next action + allocation) → 4 `OnboardingStepCompleted` `entered` → `OnboardingCompleted` @T0+40min. Assert each payload passes `validateEventPayload`; then assert every projection (`projectBoundaries`, `projectDomains` — 11 defaults, renamed in place, count unchanged — `projectPolicyTemplates`, `projectCommitments`, `projectPeople`, `projectGoals`, `projectOnboarding`) returns the required minimums, ≥1 protected-priority item exists, and `isOnboardingWithinSittingLimit` is true -- the always-on end-to-end proof.
- [x] `packages/db/src/ledger/onboarding-journey.test.ts` -- NEW PG-gated durable proof: append the same journey through the real `LedgerStore`, `readEvents()`, re-project, re-assert the minimums + within-limit; then append a second `OnboardingStarted` (new time), `BoundariesSet` (new values), and repeat `OnboardingStepCompleted`, re-read, and assert edit-not-duplicate (startedAt unchanged, boundaries/step latest-wins, entity counts unchanged) -- the sitting survives persistence + encryption and re-entry edits rather than duplicates.

**Acceptance Criteria:**
- Given a replayed full onboarding sitting, when every entity projection runs over the stream, then boundaries, the 11 domains, ≥1 accepted starter policy, ≥3 `hard-commitment` commitments, ≥1 `protected-priority` item, 3 goals (each with a next action and a protected-priority weekly allocation), and ≥5 people (each with ≥1 important date and a communication rhythm) are all present and queryable.
- Given the replayed sitting's `OnboardingStarted`/`OnboardingCompleted` pair, when the sitting duration is derived, then it is ≤45 minutes and `isOnboardingWithinSittingLimit` is true.
- Given the completed journey, when `OnboardingStarted`, `BoundariesSet`, and `OnboardingStepCompleted` are appended again with new timestamps/values (re-entering setup), then projections show edited-in-place singletons (`startedAt` unchanged; latest boundaries and step state) and no duplicated entities — re-entry edits rather than duplicates.
- Given the durable PG-gated replay, when the journey is appended through the real `LedgerStore` and re-read, then every sensitive field round-trips through encrypt-at-rest/decrypt-on-read and the same minimums and ≤45 verdict hold; when Docker/`TEST_DATABASE_URL` is absent the durable suite skips while the pure proof still runs.
- Given the replay fixtures, when the proof runs, then every event payload validates against `EVENT_CATALOG`, so the journey cannot silently diverge from the shapes the onboarding server actions emit.

## Spec Change Log

## Review Triage Log

### 2026-07-14 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 6: (high 0, medium 2, low 4)
- defer: 0
- reject: 3
- addressed_findings:
  - `[medium]` `[patch]` The durable (Postgres) proof used absolute counts (`goals.toHaveLength(3)`) and iterate-all-rows loops (`startsWith('Goal ')`), which are contaminated by the sibling `store.test.ts` under the harness's supported shared-`TEST_DATABASE_URL` mode (append-only table, no truncate) — a spurious CI red. Scoped every entity assertion to the journey's own ids (`c-1..c-4`, `p-1..p-5`, `g-1..g-3`), matching `store.test.ts`'s id discipline, and asserted the `c-4` protected-priority commitment explicitly by id.
  - `[medium]` `[patch]` The "re-entering setup edits rather than duplicates" proof only re-appended singleton events, so the id-keyed entity-stream dedup (the actual AC-3 claim) was asserted vacuously (counts trivially unchanged). Both the pure and durable re-entry tests now re-append an existing-id `PersonAdded` (`p-1`) with edited fields and assert the journey still has exactly 5 people with `p-1` last-won in place.
  - `[low]` `[patch]` Added instrument unit cases the advertised fractional-minute/boundary contract lacked: zero-length sitting (equal timestamps → 0 min, within = true), fractional sitting (30s → 0.5 min), and empty-string timestamp (a state `reduceOnboarding` can persist → null).
  - `[low]` `[patch]` Replaced a misleading `toBeCloseTo(40, 10)` with an exact `toBe(40)`.
  - `[low]` `[patch]` Softened an overstated header comment claiming the fixture "cannot drift from the shapes the server actions emit" to the accurate guarantee (it guards catalog-schema drift, not value drift).
  - `[low]` `[patch]` Added an end-to-end over-limit (red-path) assertion to the pure proof: a T0+46min journey flips `isOnboardingWithinSittingLimit` to false through the full projection path, not only in isolated unit tests.
  - Rejected (dropped): adding timezone-form validation to the instrument (unreachable — every producer writes `new Date().toISOString()`, always UTC `Z`; strict-format validation would be over-engineering and could false-null valid offset forms); a clarifying `createdAt`-uniformity comment (by-design noise); a sub-millisecond unit case (JS `Date.parse` truncation is guaranteed, marginal value).

## Design Notes

Proof = ledger/DB replay, not browser automation: the repo has no e2e/browser harness (Vitest + a Postgres testcontainer only), the onboarding server actions need Next.js session/`redirect()` context that cannot run headless, and the append-only ledger *is* the system of record AC-2 speaks to ("full life model persisted … queryable from ledger projections"). Replaying every event a full sitting emits, through the real `LedgerStore`, is the honest end-to-end proof; a browser layer is a large dependency the epic does not sanction.

The ≤45 verdict lives in core (not a one-off test assertion) because it is a reusable derivation over the persisted pair — exported so the timestamp pair is genuinely *instrumented*, not merely present.

Two proofs, one journey: the pure proof (`packages/ledger`) runs in every CI without Docker and proves queryability + timing + edit-not-duplicate logically; the PG-gated proof (`packages/db`) proves the same journey survives real persistence + encryption. Each restates the fixture independently and validates every payload against `EVENT_CATALOG`, so neither can drift from the shapes the actions emit.

Edit-not-duplicate is proven on the singletons, the only place duplication could arise (`OnboardingStarted` first-wins; boundaries/domain-rename/policy/step latest-wins); commitments/people/goals are id-keyed append-only, so re-projection yields the same rows. The protected priority is a `CommitmentCaptured` with `protectionLevel: 'protected-priority'` (Story 2.3 allows all four), independent of goals' by-construction allocations.

## Verification

**Commands:**
- `npm run typecheck` -- expected: passes (new instrument + exports type-clean).
- `npm run lint` -- expected: passes, including fixture proofs and AD-1 dependency-direction rules.
- `npm test` -- expected: passes; the pure onboarding-journey proof and instrument unit tests are green; the PG-gated durable proof runs when Docker/`TEST_DATABASE_URL` is present and skips cleanly otherwise.

**Manual checks:**
- With Docker available, run the suite and confirm the durable `onboarding-journey` proof executes (not skipped) and passes — the full sitting round-trips through Postgres with every entity queryable and the ≤45 verdict true.

## Auto Run Result

Status: done

**Implemented change:** Delivered the AC-2 proof for Story 2.6. The onboarding flow (Story 2.1) already persisted the instrumented `OnboardingStarted`/`OnboardingCompleted` pair and already edited-in-place on re-entry, so this story adds (1) a pure "instrument" in `packages/ledger` — `ONBOARDING_SITTING_LIMIT_MINUTES = 45`, `onboardingSittingMinutes(progress)` (fractional minutes, or `null` when unmeasurable — not started/completed, inverted, or unparseable; never throws), and `isOnboardingWithinSittingLimit(progress)` (inclusive ≤45 predicate) — and (2) an automated end-to-end replay of a full, catalog-valid onboarding sitting, proving every entity is queryable from ledger projections, the sitting is within 45 minutes, and re-entering setup edits rather than duplicates. The replay runs two ways: a pure always-on proof over the projections (`packages/ledger`) and a Postgres-gated durable proof through the real `LedgerStore` (`packages/db`). No new entities, events, store methods, migrations, UI, or e2e framework — only existing catalog events composed.

**Files changed:**
- `packages/ledger/src/projections/onboarding.ts` — added the pure sitting-duration instrument (constant + two functions), deriving the ≤45 verdict from the persisted timestamp pair.
- `packages/ledger/src/index.ts` — re-exported the instrument.
- `packages/ledger/src/projections/onboarding.test.ts` — instrument I/O-matrix unit tests (within / exactly-45 / over / fractional / zero-length / not-completed / not-started / inverted / empty-string / unparseable).
- `packages/ledger/src/index.test.ts` — assert the new exports resolve.
- `packages/ledger/src/onboarding-journey.test.ts` — NEW pure end-to-end proof (catalog-valid full-sitting replay; all projections; ≤45 verdict; over-limit red-path; id-keyed edit-not-duplicate on re-entry).
- `packages/db/src/ledger/onboarding-journey.test.ts` — NEW Postgres-gated durable proof (same journey through the real store; encrypt-at-rest round-trip; id-scoped assertions; durable edit-not-duplicate).

**Review findings breakdown:** 6 patches applied (medium 2, low 4), 0 deferred, 3 rejected, 0 intent_gap, 0 bad_spec (no spec re-derivation loopback). Patches: id-scoped the durable assertions to survive shared-`TEST_DATABASE_URL` contamination; made the re-entry dedup proof non-vacuous by re-appending an existing-id person; added fractional/zero-length/empty-string instrument cases; fixed a misleading `toBeCloseTo`; corrected an overstated drift-guarantee comment; added an end-to-end over-limit red-path assertion. Rejected: instrument timezone-form validation (unreachable — all producers emit UTC `toISOString()`), a by-design `createdAt` comment, and a sub-millisecond case (marginal).

**Verification:** `npm run typecheck` → exit 0; `npm run lint` → exit 0 (5/5 fixture proofs, AD-1 rules); `npm test` → exit 0, 47 files / 414 tests. The Postgres-gated durable proof executed against a real `postgres:17` testcontainer (not skipped, ~5.8s) and passed — the full sitting round-tripped through Postgres with every entity queryable and the ≤45 verdict true.

**Residual risks:** The durable proof is skipped when neither Docker nor `TEST_DATABASE_URL` is available; the always-on pure proof still runs in that case, so AC-2's projection-queryability, timing, and edit-not-duplicate guarantees remain enforced without Docker. The instrument trusts that persisted onboarding timestamps are UTC ISO-8601 (guaranteed today by `new Date().toISOString()` in every producer).
