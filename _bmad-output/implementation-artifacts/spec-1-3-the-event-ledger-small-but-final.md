---
title: 'Story 1.3: The Event Ledger — Small but Final'
type: 'feature'
created: '2026-07-13'
status: 'done'
baseline_revision: '9807c401fa7b672db36c818d4eded622c6685879'
final_revision: '0de096797e1574612a6871fb51f6092e92f89dc1'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** The scaffold has a stub `packages/ledger` (`appendEvent` returns a hardcoded `eventSeq: 0`) and no domain/event tables. Every later story — starting with 1.4's calendar-sync commands — needs a real append-only, context-tagged, erasure-ready event ledger with one-step undo and cross-context audit, so commitments can never silently vanish and erasure is designed in before the first real event exists.

**Approach:** Decide and record the erasure design as an in-repo ADR **first** (ADD-5: crypto-shredding), then build the ledger as pure core (`packages/ledger`: event catalog with per-type zod payload schemas + sensitive-field declarations, projection reducers, undo builder, and a `LedgerStore` port interface) plus a Postgres adapter in `packages/db` (event table + projection tables + audit-via-events, application-side UUIDv7, DB-level UPDATE/DELETE rejection, sensitive-field encryption keyed per erasure scope). Wire `packages/broker` to emit a real cross-context audit event through the injected port. Prove append → project → undo → audit round-trips, context separation, DB-level immutability, and erasure with integration tests against an ephemeral Postgres, backed by always-run pure unit tests.

## Boundaries & Constraints

**Always:**
- **AD-1 direction holds.** `packages/ledger` (core) imports no adapter/host/I/O library — no `pg`, `drizzle-orm`, `@life-focus/db`, `node:crypto` for side-effectful key use, `planner`/`policy`. All append/read/encrypt/erase I/O lives in the `packages/db` adapter; `broker` performs the audit append only through the `LedgerStore` **port type** imported from `ledger` (dependency-injected by the caller). Lint fixture proofs stay green.
- **AD-4 append-only.** Every domain write appends a row to insert-only `ledger_event` with `id` (UUIDv7, app-generated), monotonic `event_seq bigint`, `event_type`, `actor`, non-null `context`, `payload jsonb`, nullable `caused_by`, nullable `compensates_event_id`, `created_at`. Attempted `UPDATE`/`DELETE` on event tables fails **at the DB level** via a `BEFORE UPDATE OR DELETE` trigger that raises (works for the table owner too, unlike bare `REVOKE`). Current state is served **only** from projection tables. Every command/event payload schema is defined **once**, in `ledger`.
- **AD-4 undo.** Undo emits a compensating **forward** event (past-tense, e.g. `CommitmentCaptureUndone`) with `compensates_event_id` set. `compensates_event_id` is audit linkage only — **projection reducers must never read it**; a full rebuild-from-events must yield the identical projection state (prove by test).
- **AD-5 context + AC-14 audit.** `context ∈ {work, personal, joint}` is a non-null column on every domain/event/projection row. Every cross-context read/emit appends a `CrossContextAccessAudited` event (the AC-14 instrument). A separation test must prove a work-context projection query can never return personal-context rows and vice versa.
- **Erasure per the ADR (crypto-shredding).** Each event payload schema declares its sensitive field paths; the adapter encrypts those fields at append under a per-`erasure_scope` data key (envelope-wrapped by `LEDGER_MASTER_KEY` from `packages/config`), storing ciphertext in place. `erasure_scope` is a nullable column on the event; erasing a scope deletes its data-key row (a mutable non-event table) so ciphertext is unrecoverable while the event row itself is never mutated.
- **Conventions.** UUIDv7 via the `uuidv7` npm package; ISO-8601 UTC timestamps; zod-validated payloads at the append boundary; new env reads only through `packages/config`; Drizzle over plain Postgres (AD-9); migrations applied by the existing `packages/db` runner and the compose `migrate` service.

**Block If:**
- DESIGN/architecture constraints force a choice the ADR cannot make unattended — e.g. an erasure-scope subject model that cannot be expressed without introducing Person/domain entities out of this story's scope. HALT `blocked`.
- The DB-level trigger cannot be delivered through the drizzle-kit custom-migration + journal mechanism without a schema-tool change. HALT `blocked`.

**Never:**
- No new domain surface beyond a **minimal** `Commitment` demonstrator (id, title, context, status, timestamps) needed to exercise append→project→undo; the full Commitment Ledger (FR-21–24 richness) is Epic 2. No `planner`/`policy` logic, no LLM calls, no connectors.
- No UI, server action, or `apps/web`/`apps/worker` change — the port is host-agnostic and 1.4 wires the first host caller. Append is a synchronous host DB write (not a pg-boss job).
- Do not weaken Story 1.1/1.2 gates (AD-1 lint, no-process-env, jsx-a11y, typecheck of test files). Do not make `npm test` require Docker — Postgres integration tests skip cleanly when no container/`TEST_DATABASE_URL` is available.
- No `UPDATE`/`DELETE` path on event tables anywhere in code; no negate-and-skip undo; no reading `compensates_event_id` in projection logic.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Append valid event | `CommitmentCaptured` payload, context `work` | Row inserted with UUIDv7 `id`, next `event_seq`, sensitive `title` stored encrypted; projection `commitment` row upserted in same txn | Invalid payload → zod error, nothing appended |
| Unknown event type | `event_type` not in catalog | Reject before insert | Typed error; no row |
| Project current state | Events replayed / read by context | Projection returns current rows for that context only | — |
| Undo a capture | `CommitmentCaptured` id → build undo | Appends `CommitmentCaptureUndone` (forward) with `compensates_event_id`; projection row removed; both events remain in log | Undoing unknown/absent event → typed error |
| DB-level mutation attempt | `UPDATE`/`DELETE` on `ledger_event` | Fails at DB (trigger raises) | Error surfaced; row unchanged |
| Cross-context read/emit | work store reads/emits toward personal | Denied by broker rules; `CrossContextAccessAudited` event appended | Audit always written even on deny |
| Context separation | work + personal commitments exist | `readCommitments('work')` returns only work rows | — |
| Erase a scope | `erase(scope)` after encrypted append | Data-key row deleted; sensitive fields now unrecoverable; event row (`id`, `event_seq`, non-sensitive fields) unchanged | Erasing unknown scope → no-op, no throw |

</intent-contract>

## Code Map

- `docs/adr/0001-event-ledger-erasure.md` -- NEW ADR: decide crypto-shredding vs redactable payloads; record decision + payload-shape consequence (ADD-5). Authored first.
- `packages/ledger/src/events/catalog.ts` -- NEW: event catalog — per `event_type` zod payload schema + `sensitiveFields` paths; `validateEventPayload(type, payload)`; register `CommitmentCaptured`, `CommitmentCaptureUndone`, `CrossContextAccessAudited`.
- `packages/ledger/src/events/types.ts` -- NEW: `DomainEvent`, `AppendEventInput`, `EventContext` (canonical), `LedgerStore` port interface (`append`, `readEvents`, projection reads, `erase`).
- `packages/ledger/src/projections/commitment.ts` -- NEW: pure reducer `(row|null, event) → row|null` for the `Commitment` projection; `projectCommitments(events)`; never reads `compensatesEventId`.
- `packages/ledger/src/undo.ts` -- NEW: `buildUndoEvent(original) → AppendEventInput` (past-tense type, `compensatesEventId` set, same actor/context).
- `packages/ledger/src/index.ts` -- replace stub `appendEvent`; re-export catalog/types/projections/undo/port. Keep `EventContext` canonical.
- `packages/ledger/src/**/*.test.ts` -- pure unit tests (catalog validation, reducer purity + rebuild equivalence, undo builder).
- `packages/db/src/schema/ledger.ts` -- NEW Drizzle tables: `ledger_event` (insert-only shape above), `commitment` projection, `ledger_erasure_key` (mutable data-key store). Export `ledgerSchema`; add to client schema.
- `packages/db/drizzle/000X_*.sql` + `drizzle/000X_ledger_insert_only.sql` -- generated table migration + a `--custom` migration adding the `ledger_reject_mutation()` function and `BEFORE UPDATE OR DELETE` triggers; journal updated by drizzle-kit.
- `packages/db/src/ledger/store.ts` -- NEW: `createLedgerStore(dbClient)` implementing `LedgerStore` — UUIDv7 id gen, sensitive-field encrypt/decrypt (`node:crypto` AES-256-GCM), envelope key mgmt keyed by `erasure_scope`, append+project in one transaction, `readEvents`, `readCommitments(context)`, `erase(scope)`.
- `packages/db/src/ledger/crypto.ts` -- NEW: pure-ish AES-256-GCM helpers (encrypt/decrypt field, wrap/unwrap data key) — unit-testable without Postgres.
- `packages/db/src/ledger/store.test.ts` + `crypto.test.ts` -- crypto round-trip unit tests (always run) + Postgres integration tests (`describe.skipIf` no Docker/`TEST_DATABASE_URL`).
- `packages/db/test/pg.ts` -- NEW: ephemeral-Postgres harness (prefer `TEST_DATABASE_URL`, else `@testcontainers/postgresql`, else skip) + `runMigrations` against it.
- `packages/db/package.json`, `src/index.ts` -- add deps `@life-focus/ledger`, `uuidv7`, dev `@testcontainers/postgresql`; export `createLedgerStore`; extend client `schema`.
- `packages/broker/src/index.ts` (+ test) -- accept an injected `LedgerStore`; on cross-context output append a real `CrossContextAccessAudited` event and return its `id` as `auditId`; drop the `crypto.randomUUID` TODO.
- `packages/config/src/index.ts` (+ test) -- add `LEDGER_MASTER_KEY` (base64/hex, decodes to 32 bytes) to the zod env schema.
- `.env.example`, `docker-compose.yml` -- add `LEDGER_MASTER_KEY` (dev default like `BETTER_AUTH_SECRET`) for `migrate`/web/worker.

## Tasks & Acceptance

**Execution:**
- [x] `docs/adr/0001-event-ledger-erasure.md` -- author ADR deciding crypto-shredding, with rationale + payload-shape consequence -- ADD-5 blocking dependency, done before schema
- [x] `packages/config/src/index.ts` (+ test) -- add `LEDGER_MASTER_KEY` env (decodes to 32 bytes) -- keyed erasure needs a master key via config
- [x] `packages/ledger/src/events/{types,catalog}.ts` + `projections/commitment.ts` + `undo.ts` + `index.ts` -- pure core: catalog, `LedgerStore` port, reducers, undo builder; replace stub -- AD-4 schemas/logic live once in core
- [x] `packages/ledger/src/**/*.test.ts` -- catalog validation, reducer purity, rebuild-equivalence (compensatesEventId ignored), undo builder -- prove core logic without a DB
- [x] `packages/db/src/schema/ledger.ts` + client wiring -- `ledger_event`, `commitment`, `ledger_erasure_key` tables -- AD-9 schema in db
- [x] `packages/db/drizzle/*` -- generate table migration + `--custom` trigger migration (`ledger_reject_mutation` + BEFORE UPDATE/DELETE) -- DB-level immutability
- [x] `packages/db/src/ledger/{crypto,store}.ts` + `test/pg.ts` -- crypto helpers + `createLedgerStore` (append+project txn, audit, erase, UUIDv7) + ephemeral-PG harness -- the adapter implementing the port
- [x] `packages/db/src/ledger/{crypto.test.ts,store.test.ts}` -- crypto round-trip (always run) + Postgres integration round-trips (skip w/o Docker) -- prove append→project→undo→audit, separation, DB-level reject, erasure
- [x] `packages/broker/src/index.ts` (+ test) -- inject `LedgerStore`, emit real `CrossContextAccessAudited`, return event id -- AC-14 audit is a real appended event
- [x] `.env.example` + `docker-compose.yml` -- add `LEDGER_MASTER_KEY` -- one-command dev with a working key

**Acceptance Criteria:**
- Given a valid domain write, when it executes against the ledger store, then a row appends to insert-only `ledger_event` with the required columns (non-null `context`, monotonic `event_seq`, UUIDv7 `id`) using the ADR's payload shape, and current state is served from a `commitment` projection rebuilt from events.
- Given an event table, when any code attempts `UPDATE` or `DELETE` on it, then the write fails at the DB level.
- Given a captured commitment, when I undo it, then a compensating forward event is appended (`compensatesEventId` audit-only) and the projection reflects the undo; a full rebuild-from-events that ignores `compensatesEventId` yields identical state.
- Given a cross-context read/emit, when it occurs, then a `CrossContextAccessAudited` event is appended; and a work-context projection query can never return personal-context rows (separation test passes both directions).
- Given an erasure decision recorded as an in-repo ADR before schema, when a scope is erased, then its sensitive fields become unrecoverable while the event rows stay byte-stable (append-only preserved).
- Given the repo, when `npm run typecheck`, `npm run lint`, and `npm test` run, then all pass (Story 1.1/1.2 gates intact, AD-1 fixtures still fail-closed, ≥1 new test per new concern) without requiring Docker.

## Spec Change Log

_No bad_spec loopback occurred; the intent contract and spec body held through review. All review findings were patches or defers._

## Review Triage Log

### 2026-07-14 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 8: (high 1, medium 5, low 2)
- defer: 2: (high 0, medium 1, low 1)
- reject: 7
- addressed_findings:
  - `[high]` `[patch]` Crypto-shredding was defeated by the projection: `erase(scope)` deleted only the wrapped data key, but the `commitment` projection stores the decrypted `title` as plaintext and was never scrubbed — an "erased" title survived fully queryable. `erase()` now runs in a transaction that also redacts the sensitive projected field (title → `REDACTED_MARKER`) for every commitment in the scope; the integration test now asserts `readCommitments` returns the redacted title after erase. [`packages/db/src/ledger/store.ts`, `store.test.ts`]
  - `[medium]` `[patch]` The insert-only trigger (`BEFORE UPDATE OR DELETE ... FOR EACH ROW`) did not cover `TRUNCATE` — a statement-level vector that would wipe the whole append-only log. Added a `BEFORE TRUNCATE ... FOR EACH STATEMENT` trigger and a test asserting `TRUNCATE ledger_event` throws. [`packages/db/drizzle/0002_ledger_insert_only.sql`, `store.test.ts`]
  - `[medium]` `[patch]` The committed dev `LEDGER_MASTER_KEY` default was a random-looking base64 value indistinguishable from a real key — a deployment forgetting to override it would silently share a repo-visible master key (all "erased" data trivially decryptable). Replaced with an obviously-insecure placeholder that base64-decodes to the ASCII `dev-only-insecure-ledger-key-32b`, plus a warning comment. [`.env.example`, `docker-compose.yml`]
  - `[medium]` `[patch]` Two independent, divergent master-key decoders existed (`decodeKeyBytes` in config, `decodeMasterKey` in crypto) — a latent key-mismatch bug. Exported the config decoder as the single canonical source and made the crypto adapter delegate to it. [`packages/config/src/index.ts`, `packages/db/src/ledger/crypto.ts`]
  - `[medium]` `[patch]` `readEvents` decryption threw the entire read on one bad row (rotated master key / tampered ciphertext) and re-unwrapped the scope key per row with no caching. Per-field decrypt now degrades to `REDACTED_MARKER` on failure, and scope keys are cached per read. [`packages/db/src/ledger/store.ts`]
  - `[medium]` `[patch]` `ensureScopeKey` did a SELECT-then-INSERT with no conflict handling — two concurrent first appends for the same scope would crash the loser on the `erasure_scope` PK. Now `onConflictDoNothing` + re-read so both get the winner's key. [`packages/db/src/ledger/store.ts`]
  - `[low]` `[patch]` The eslint env-read carve-out was globbed to `packages/*/test/**`, silently exempting any future package's test dir from the no-process-env rule. Narrowed to `packages/db/test/**`. [`eslint.config.js`]
  - `[low]` `[patch]` `buildUndoEvent` coerced `commitmentId` via `String(...)`, so a missing id produced a bogus `"undefined"` undo that no-ops silently. Now throws when `commitmentId` is not a non-empty string; added a unit test. [`packages/ledger/src/undo.ts`, `packages/ledger/src/index.test.ts`]

Deferred (recorded in `deferred-work.md`): (1) context/subject-qualified erasure scope — the derived scope `commitment:<id>` lacks a context component, a theoretical cross-context key-sharing risk that UUIDv7 ids make practically unreachable and that the future Person/subject model will resolve; (2) projection ordering & `event_seq` causal order under genuinely concurrent appends (last-writer-wins on the same commitment) — a concurrency-hardening concern beyond single-user MVP, with rebuild-from-events as the always-correct fallback.

### 2026-07-14 — Follow-up review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 0, low 2)
- defer: 7: (high 0, medium 4, low 3)
- reject: 7
- addressed_findings:
  - `[low]` `[patch]` A declared-sensitive field that was present but not a string silently fell through the encrypt loop and persisted as plaintext (defeating crypto-shred erasure). Cannot trigger today (zod enforces `title: string`) but the catalog declares sensitivity independently of the schema; added an explicit `throw` for a present non-string sensitive value so the invariant fails loudly. [`packages/db/src/ledger/store.ts`]
  - `[low]` `[patch]` The Docker liveness probe `execSync('docker info', …)` had no timeout, so an unresponsive daemon would hang test bootstrap instead of skipping the integration suites. Added `timeout: 5000`. [`packages/db/test/pg.ts`]

Deferred this pass (recorded as NEW entries in `deferred-work.md`): (1) envelope encryption uses no AAD binding ciphertext to event id/scope/field, so a DB-write attacker could substitute ciphertext between events sharing a scope key; (2) `LEDGER_MASTER_KEY` decoder guesses hex-then-base64 rather than requiring an explicit format prefix (ambiguous for some key strings); (3) an entity's `context` is not immutable — a re-`CommitmentCaptured` for an existing id under a different context would move it across the SEC-2 boundary via `onConflictDoUpdate`; (4) the erase projection-cascade and append encryption are hardcoded to `commitment.title` / two event types rather than driven by the sensitive-field catalog + a general event→projection map (future sensitive projected fields/types, and re-capture-after-erasure, would leave plaintext); (5) any decrypt failure degrades to the same `REDACTED_MARKER` as lawful erasure, making tamper/corruption/key-rotation indistinguishable from erasure with no signal; (6) `readEvents` has no LIMIT/pagination and decrypts the whole log in memory as it grows; (7) the committed dev `LEDGER_MASTER_KEY` default in compose means a misconfigured prod comes up green with a repo-visible erasure key.

Rejected this pass: audit written under the acting context and same-context calls also audited (intentional, tested); derived-scope-lacks-context and `event_seq` concurrent-ordering (both already tracked in `deferred-work.md` from the first pass — not re-added); `ensureScopeKey` re-select non-null assertion (reviewer's own analysis: `ON CONFLICT DO NOTHING` blocks on the concurrent inserter and sees the committed row); stored-vs-validated payload divergence (vague, no concrete path); double-`CommitmentCaptured` `createdAt` rebuild divergence and no-op-reduce projection delete (both require unsupported/hypothetical future flows).

## Design Notes

- **Erasure = crypto-shredding (ADR 0001).** It is the only approach compatible with AD-4's absolute "no UPDATE/DELETE on event tables, ever" *and* true erasure: the event row (payload ciphertext, `event_seq`, `caused_by`) never changes; erasure destroys a per-scope data key in the mutable `ledger_erasure_key` table. Redactable-in-place payloads would mutate event rows (violates AD-4); a plaintext redaction-sidecar splits payloads and forces projections to join a mutable table, weakening "state served only from projections rebuilt from events." Record both options and this rationale in the ADR.
- **Sensitive-field shape.** Catalog entries declare `sensitiveFields: string[]` (dot-paths). The adapter replaces each with `{ __enc: base64, iv, tag }` at append and decrypts on read when the scope key exists; after erase, decryption is impossible and reads return a redacted marker. Events with no sensitive fields have `erasure_scope = null` and store plaintext.
- **Undo purity (AD-4).** Reducer signature `(current, event) => next` switches on `event.eventType` only. `CommitmentCaptureUndone` reduces the row away. A test appends capture+undo, then rebuilds the projection from the raw event list and asserts equality with the incrementally-maintained projection — proving `compensatesEventId` is never consulted.
- **DB-level immutability via trigger, not REVOKE.** The dev/app role owns the tables; `REVOKE UPDATE/DELETE` does not constrain an owner. A `BEFORE UPDATE OR DELETE` trigger calling `RAISE EXCEPTION` blocks all roles. Deliver it as a drizzle-kit `--custom` migration so it is registered in `meta/_journal.json` and runs through the existing migrator.
- **Test infra.** `packages/db/test/pg.ts`: use `TEST_DATABASE_URL` if set, else start `@testcontainers/postgresql` (postgres:17 to match compose), else `describe.skip`. Pure unit tests (catalog, reducers, undo, crypto) always run so the gate is green without Docker.
- **Broker port injection keeps AD-1 clean.** `broker` imports only the `LedgerStore` *type* from `ledger`; the caller (future host) injects the db-backed implementation, so `broker` never imports `db`.

## Verification

**Commands:**
- `npm install` -- expected: clean install incl. `uuidv7`, `@testcontainers/postgresql`; lockfile updated
- `npm run typecheck` -- expected: exit 0 across all workspaces incl. test files
- `npm run lint` -- expected: exit 0; AD-1 / no-process-env / jsx-a11y fixtures still fail-closed (5/5)
- `npm test` -- expected: Vitest green without Docker (integration suites skip cleanly); with Docker or `TEST_DATABASE_URL`, ledger integration round-trips (append/project/undo/audit/separation/DB-reject/erasure) pass
- `docker compose up migrate` (if Docker available) -- expected: table + trigger migrations apply; a manual `UPDATE ledger_event ...` is rejected

**Manual checks (if no CLI):**
- Inspect `docs/adr/0001-event-ledger-erasure.md` exists, decides crypto-shredding, and is dated before the schema commit.
- Confirm `packages/ledger` contains no `pg`/`drizzle-orm`/`@life-focus/db` import (AD-1).

## Auto Run Result

Status: done

**Implemented change:** A real append-only event ledger replaces the Story 1.1 stub. Pure core `packages/ledger` now holds the event catalog (per-type zod payload schemas + declared sensitive fields), the commitment projection reducer, the undo builder (compensating forward event, `compensatesEventId` audit-only), and the `LedgerStore` port — importing no adapter/host/I/O (AD-1). The `packages/db` adapter adds the `ledger_event` (insert-only), `commitment` projection, and mutable `ledger_erasure_key` tables; a `createLedgerStore` implementing the port (UUIDv7 ids, per-erasure-scope AES-256-GCM field encryption, append+project in one transaction, context-separated reads, crypto-shred erase); and a `--custom` migration installing `BEFORE UPDATE OR DELETE` **and** `BEFORE TRUNCATE` triggers that raise (DB-level immutability for all roles). `packages/broker` now emits a real `CrossContextAccessAudited` event through the injected port (AC-14). Erasure strategy is recorded as ADR 0001 (crypto-shredding) authored before the schema. `LEDGER_MASTER_KEY` added to typed config with a single canonical decoder shared by the crypto adapter.

**Files changed (grouped):**
- ADR: `docs/adr/0001-event-ledger-erasure.md` — crypto-shredding decision + rejected alternatives.
- Config: `packages/config/src/index.ts` (+ test) — `LEDGER_MASTER_KEY` env + exported canonical key decoder.
- Ledger (core): `src/events/{types,catalog}.ts`, `src/projections/commitment.ts`, `src/undo.ts`, `src/index.ts` (+ rewritten `index.test.ts`, `package.json` gains zod).
- DB (adapter): `src/schema/ledger.ts`, `src/ledger/{crypto,store}.ts`, `src/index.ts`, `test/pg.ts`, `crypto.test.ts`, `store.test.ts`, `drizzle.config.ts`, `tsconfig.json`, `package.json` (+@life-focus/ledger, uuidv7, @testcontainers/postgresql), `drizzle/0001_ledger_tables.sql`, `drizzle/0002_ledger_insert_only.sql`, `drizzle/meta/*`.
- Broker: `packages/broker/src/index.ts` (+ test) — real audit via injected port.
- Env/dev: `.env.example`, `docker-compose.yml` (obviously-insecure dev `LEDGER_MASTER_KEY`), `eslint.config.js` (narrowed test-harness env carve-out).

**Review findings breakdown:** 0 intent_gap, 0 bad_spec. 8 patches applied — 1 high (crypto-shred now cascades into the plaintext projection, closing an erasure leak), 5 medium (TRUNCATE immutability trigger; obviously-insecure committed dev key; unified master-key decoder; resilient+cached read decryption; concurrent-safe scope-key creation), 2 low (narrowed eslint env carve-out; undo `commitmentId` guard). 2 deferred to `deferred-work.md` (context-qualified erasure scope; per-commitment projection ordering under concurrency). 7 rejected as by-design/noise (audit tagged to the acting context; broker fail-closed on audit-write failure; integration tests skip-without-Docker is the spec's explicit choice; reducer coercion validated upstream; absent-path encryption already guarded; all-zeros key operator error; internal malformed-wrapped-key error).

**Verification:** `npm run typecheck` → exit 0. `npm run lint` → exit 0 (AD-1 / no-process-env fixtures still fail-closed, 5/5). `npm test` → exit 0, 149 passed / 18 files; the `packages/db` Postgres integration suite RAN against a live testcontainer (postgres:17, ~5.5s) — proving append→project→undo→audit round-trips, context separation (both directions), DB-level UPDATE/DELETE **and TRUNCATE** rejection, and erasure unrecoverable in both the event stream and the projection while event rows stay byte-stable. AD-1 verified: `packages/ledger` has no adapter/host/I/O import.

**Residual risks:** (1) `followup_review_recommended: true` — the high-severity erasure-leak fix and the security-sensitive key/immutability patches warrant an independent follow-up review. (2) The two deferred items (erasure-scope context qualification; projection concurrency ordering) — both low-probability for a single-user MVP, tracked in `deferred-work.md`. (3) Integration tests skip cleanly without Docker/`TEST_DATABASE_URL`; a CI job that sets one is not part of this story, so on a Docker-less CI the ledger's DB-level guarantees would be unverified by the gate (they ran and passed here). (4) The dev `LEDGER_MASTER_KEY` is obviously-insecure and MUST be overridden in any non-dev deployment.

### Follow-up review pass — 2026-07-14

**Trigger:** the first pass set `followup_review_recommended: true`; this is that independent follow-up review (`review_loop_iteration` reset to 0, fresh Blind Hunter + Edge Case Hunter over the full diff since baseline).

**Outcome:** 0 intent_gap, 0 bad_spec — the implementation held. 2 low-severity patches applied, 7 findings deferred, 7 rejected.

**Patches applied this pass:**
- `packages/db/src/ledger/store.ts` — a declared-sensitive field present but not a string used to fall through the encrypt loop and persist as plaintext; now throws. Cannot trigger today (zod enforces `title: string`) but hardens the erasure invariant, which the catalog declares independently of the schema.
- `packages/db/test/pg.ts` — added `timeout: 5000` to the `docker info` liveness probe so an unresponsive daemon skips the integration suites instead of hanging bootstrap.

**Deferred this pass (7 NEW `deferred-work.md` entries):** no-AAD envelope encryption; hex/base64 key-format ambiguity; entity-context immutability across re-capture; catalog-driven (vs hardcoded) erase cascade & encryption; tamper-vs-erasure indistinguishability; unbounded `readEvents`; committed dev-key compose default. All are real but out of the deliberately-minimal Commitment-demonstrator / single-writer-MVP scope this story drew.

**Verification:** `npm run typecheck` → exit 0. `npm run lint` → exit 0 (fixtures 5/5 fail-closed). `npm test` → 149 passed / 18 files; the `packages/db` Postgres integration suite RAN against a live testcontainer (~6.3s) and passed with both patches in place.

**Follow-up recommendation:** `false` — this pass made only two localized, low-consequence changes (one guard for a case unreachable today, one test-harness robustness tweak); no further independent review is warranted.
