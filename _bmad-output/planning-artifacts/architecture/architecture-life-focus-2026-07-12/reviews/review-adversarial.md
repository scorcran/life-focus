---
type: adversarial-review
target: ARCHITECTURE-SPINE.md
date: 2026-07-12
reviewer: Claude Fable (adversarial pass)
verdict: The spine is coherent but leaves 8 seams underspecified enough that independent build sessions will diverge — most critically on ContextSnapshot shape, Person/Plan ownership, classification location, and undo semantics.
---

# Adversarial Review — Architecture Spine Life Focus Intelligence

## Verdict

The spine enforces good macro-invariants (no-I/O core, single-gate LLM, insert-only events, context tags) but omits enough internal wire formats and ownership assignments that two AI coding sessions, each faithfully obeying every AD and convention, will build independently incompatible pieces. Eight concrete incompatible pairs are catalogued below with proposed closing rules.

---

## Incompatible Pairs by Severity

### CRITICAL

---

#### C-1 — Two ContextSnapshot shapes for the planner

**Sessions:**
- **Session A (planner feature):** Builds `planner/index.ts`. AD-2 says the signature is `(ContextSnapshot, PolicySet, now) → PlanProposal | PlanDiff`. Session A invents `ContextSnapshot` as whatever it needs to produce sensible capacity math: probably `{ commitments: Commitment[], persons: Person[], availableMinutes: number, assertions: Assertion[] }`.
- **Session B (morning-plan UI + server action):** Builds the server action that calls the planner. It independently constructs a `ContextSnapshot` from DB projection rows: probably `{ commitments: CommitmentRow[], capacityBlocks: CapacityBlock[], contextTag: ContextTag, ... }` — different field names, different nesting, different assertion shape.

**How they each obey the spine:** AD-2 mandates the function signature but does not define `ContextSnapshot`. Conventions say "payloads zod-validated" but assign the schema to no package. Both sessions are compliant — and their types will not match.

**Severity:** CRITICAL — the planner cannot be called until one side rewrites its type.

**Closing rule (AD-2a):**
> `ContextSnapshot` is a named zod schema exported from `interpretation-schema`. Its top-level shape is frozen here:
> ```
> ContextSnapshot {
>   commitments: Commitment[]        // projection-layer type from ledger
>   persons: Person[]                // projection-layer type from ledger
>   capacityMinutes: number          // available minutes in planning window
>   planningWindow: { start: ISO8601, end: ISO8601 }
>   assertions: Assertion[]          // from interpretation-schema
>   contextFilter: ContextTag[]      // which contexts are in scope
> }
> ```
> Any session building a planner caller constructs a `ContextSnapshot` only by filling this schema; any session building the planner function imports it from `interpretation-schema`. No host constructs domain objects by hand (existing convention — applied here explicitly).

---

#### C-2 — Person projection: two writers (connector promotion vs. capture flow)

**Sessions:**
- **Session A (connectors/gmail):** Implements AD-7 source-mirror promotion. When promoting a Gmail sender to a Person, it appends a `PersonCreated` command. It decides the Person payload shape: `{ name, emailAddress, sourceRef, contextTag }`.
- **Session B (capture flow):** Implements FR-17–20 quick-capture. A captured note mentions a person by name. Session B needs to create or look up a Person, so it also appends a `PersonCreated` command — but its payload is `{ name, contextTag, captureSource: 'user-text' }` with no email address and a different `sourceRef` structure.

**How they each obey the spine:** AD-7 says promotion is an AD-4 command, which both respect. AD-6 says Person records merge by explicit action. Neither session is told who owns the canonical `PersonCreated` payload schema or how an un-emailed capture-Person later merges with a connector-sourced Person.

**Severity:** CRITICAL — two `PersonCreated` zod schemas in the system; the Person projection rebuild will fail or silently drop fields depending on which event it encounters first.

**Closing rule (AD-6a):**
> The `PersonCreated` command payload is defined once in `ledger` (the package that owns Person projections) and exported for all callers:
> ```
> PersonCreated {
>   personId: UUIDv7
>   displayName: string
>   contextTag: ContextTag
>   identifiers: Array<{ type: 'email'|'phone'|'name-only'|'connector-ref', value: string, sourceRef: string }>
>   captureSource: 'connector-promotion' | 'user-capture' | 'user-merge'
> }
> ```
> Capture flow and connector promotion both use this single schema. A capture-sourced Person with `type: 'name-only'` is later merged with a connector-sourced Person by a `PersonsMerged` command (also defined in `ledger`). No session invents a narrower payload.

---

#### C-3 — Who owns the Plan projection?

**Sessions:**
- **Session A (planner package):** AD-2 says the planner returns a `PlanProposal`. Session A naturally puts `Plan` and `PlanDiff` types in `planner/` alongside the function that produces them.
- **Session B (ledger package):** AD-4 says "current state lives in projection tables rebuilt from events." The Capability Map says "Prioritization/capacity/planning → `planner`" but also "Commitment Ledger → `ledger`." Session B sees the ER diagram's `PLAN` as a projection and puts `Plan` projection logic and the DB schema in `ledger/` or `db/`.

**How they each obey the spine:** The spine never assigns Plan projection ownership explicitly. The ER diagram shows `PLAN` as a projection entity. The Capability Map assigns planning to `planner`. Both readings are textually defensible.

**Severity:** CRITICAL — if `Plan` is a type in `planner` and also a projection schema in `ledger`, the two packages will carry divergent types, or one will import the other (violating AD-1 if `ledger` imports `planner`).

**Closing rule (AD-4a):**
> `Plan` and `PlanDiff` are projection types owned by `ledger` (which owns all projections per AD-4). The `planner` package imports these types from `ledger` for its output signature. `planner` never defines a DB schema. The `PlanProposal` returned by the planner is an ephemeral in-memory value (not persisted); only after user approval does a `PlanAccepted` command append to `event_seq`, and `ledger` projects that into the `plans` table. This direction (`planner` imports `ledger`) is explicitly permitted; the reverse (`ledger` imports `planner`) is forbidden.

---

### HIGH

---

#### H-1 — Where does capture classification happen?

**Sessions:**
- **Session A (apps/web capture server action):** Implements the quick-capture form (FR-17–20). The text arrives; Session A wants to classify it (work vs. personal? commitment vs. reference?). It reasons: "classification is interpretation, so I call `llm-gateway` from the server action" — which is allowed (the dependency graph shows `WEB → ANTH`).
- **Session B (apps/worker extraction job):** Implements the extraction pipeline (FR-15, FR-41–46). Session B sees that all LLM interpretation flows through the worker as a pg-boss job, so it assumes captures are queued as `extract-capture` jobs and classification happens in the worker.

**How they each obey the spine:** AD-3 says LLM calls go through `llm-gateway`. The diagram shows both `WEB → ANTH` and `WRK → ANTH`. Neither session is wrong about the dependency. But one puts classification latency on the request path; the other queues it.

**Severity:** HIGH — capture items will either have a contextTag synchronously (if web classifies) or be stored context-untagged and tagged later (if worker classifies), making the AD-4 command payload and UI state machine different in each.

**Closing rule (AD-3a):**
> Capture classification follows a two-step model defined here:
> 1. `apps/web` server action appends a `CaptureReceived` command with `contextTag: null` and the raw text. This is synchronous and always fast.
> 2. A `classify-capture` pg-boss job (worker) calls `llm-gateway` to produce a `ClassificationAssertion` and appends a `CaptureClassified` command.
> The capture UI renders an "unclassified" state until step 2 completes. No LLM call is made on the synchronous server action path. This is the universal pattern: web action = command append only; interpretation = worker job.

---

#### H-2 — Two undo semantics (soft-reverse vs. new-forward-event)

**Sessions:**
- **Session A (commitment undo):** Implements FR-21–24 undo for a commitment deletion. AD-4 says "undo = compensating command referencing the original." Session A interprets this as appending a `CommitmentRestored` event (forward-event that reverses the effect) — semantically: "create a new commitment that looks like the old one."
- **Session B (plan undo):** Implements FR-30 plan-change undo. Session B interprets AD-4's "compensating command" as `PlanChangeReverted { causedBy: <original-event-id> }` — a soft-reverse that tells the projection "rebuild as if event X never happened."

**How they each obey the spine:** AD-4 says "undo = compensating command referencing the original" — this is ambiguous. "Compensating" in event-sourcing literature means either a semantic inverse (new forward event) or a negation/reversal. The spine does not choose.

**Severity:** HIGH — the projection rebuild logic must be consistent. If some compensating commands are semantic inverses and others are negations, the projection builder needs to handle two different patterns, and sessions building projection queries will make different assumptions about what "undo" means in the read model.

**Closing rule (AD-4b):**
> All compensating commands are semantic-inverse forward events: they describe what happened, not what to erase. `CommitmentDeleted` is compensated by `CommitmentRestored { ...originalPayload, compensatesEventId: <uuid> }`. `PlanAccepted` is compensated by `PlanReverted { planId, compensatesEventId }`. Projections never look backward through `compensatesEventId` — they replay all events in sequence. The `compensatesEventId` field is for audit linkage only, not projection logic. No session invents a "negate and skip" projection strategy.

---

#### H-3 — Sync-health computation: connector vs. core vs. UI?

**Sessions:**
- **Session A (connectors/gmail):** Implements FR-62 sync health. It seems natural to compute staleness in the connector that knows the last-sync timestamp. Session A emits a `SyncHealthUpdated` event with a health score.
- **Session B (apps/web UI):** Implements the sync-health display. It queries the DB. But: is sync health a projection column on the source_identity table? A separate `sync_health` table? A computed value from the last event timestamp? Session B builds its own query.

**How they each obey the spine:** AD-7 says "each connector records sync health the UI surfaces." The spine never specifies the data shape, where the record lives, or which package computes staleness thresholds.

**Severity:** HIGH — without a defined schema, Session A writes to a table Session B does not know to query, or Session B computes staleness from raw timestamps while Session A wrote a summary record.

**Closing rule (AD-7a):**
> Sync health is a projection column `sync_health: 'ok' | 'stale' | 'error' | 'never-synced'` on the `source_identities` projection table, plus `last_synced_at: timestamptz` and `last_error: text | null`. Connectors never compute health status — they append `SyncCompleted { sourceIdentityId, itemCount }` or `SyncFailed { sourceIdentityId, error }` AD-4 events. The ledger projection computes `sync_health` from these events using a threshold defined in `policy` (e.g., stale > 2 hours). The UI reads `source_identities` directly. No connector owns a health table.

---

### MEDIUM

---

#### M-1 — pg-boss job definitions: which package/host defines them?

**Sessions:**
- **Session A (apps/worker):** Builds the worker host. Naturally defines all pg-boss job type strings and handler registrations in `apps/worker/jobs/`.
- **Session B (connectors/gmail):** Needs to enqueue a `sync-gmail` job (either from the worker's scheduler or from a web server action after auth). Session B defines the job name string `'sync-gmail'` and its input schema in `connectors/gmail/`.

**How they each obey the spine:** The spine assigns connectors to `packages/connectors/*` and the worker host to `apps/worker`. No AD specifies where job contracts (name strings + input/output zod schemas) live.

**Severity:** MEDIUM — job name string duplication and divergent input schemas; a worker handler expects `{ sourceIdentityId }` but the enqueuer sends `{ accountId }`.

**Closing rule (new AD-11):**
> **AD-11 — Job contracts live in the package that owns the work.**
> Each package that performs background work exports a `jobs.ts` file defining job name constants and zod schemas for job input and output. `apps/worker` imports these contracts and registers handlers against them; it defines no job schemas itself. `apps/web` and other enqueuers import the same contracts. No job name string is spelled out in more than one place.

---

#### M-2 — Better Auth session check: server actions vs. worker notifications

**Sessions:**
- **Session A (apps/web server actions):** Uses Better Auth middleware/session utilities to authenticate every server action. Straightforward — Better Auth is in `apps/web`.
- **Session B (apps/worker notifications):** Implements FR-56 notifications. The worker needs to know *which user* to notify (single-tenant but still needs a user ID). Session B, seeing that Better Auth is in `apps/web` and the worker "trusts the DB boundary," reads the users table directly. But now it has its own DB query pattern for user identity that may drift from the web layer's session shape.

**How they each obey the spine:** The convention table says "Auth: Better Auth in `apps/web`; worker trusts the DB boundary (single-tenant)." This is intentionally permissive but leaves the worker's user-identity lookup unspecified.

**Severity:** MEDIUM — notification jobs hardcode user-ID lookups that diverge from how the web layer understands the user record; if Better Auth's user table schema changes, the worker breaks silently.

**Closing rule (new AD-12):**
> **AD-12 — User identity is read from one place.**
> The `db` package exports a `getUserById(db, userId)` query function. Both `apps/web` (post-session) and `apps/worker` use this function exclusively for user-record lookups — neither hand-rolls a `SELECT * FROM users` query. The worker always receives `userId` as a job input field; it never queries for "the" user by assuming table position or count.

---

#### M-3 — Assertion payload schema: who validates, what fields are required?

**Sessions:**
- **Session A (llm-gateway):** Builds the extraction pipeline per AD-3. Produces `Assertion` objects with `{ confidence, provenance: { sourceRef, model, promptVersion }, contextTag, value: unknown }`.
- **Session B (interpretation-schema):** Builds the typed extraction shapes. For a `DeadlineAssertion`, it defines `{ assertionType: 'deadline', value: { date: ISO8601, commitmentId }, confidence, ... }` — but omits `provenance.promptVersion` because Session B doesn't know about prompt versioning.

**How they each obey the spine:** AD-3 says assertions carry `confidence`, `provenance (source ref + model + prompt version)`, and `context` tag. The convention says "payloads zod-validated." But the base `Assertion` schema and the typed sub-schemas are in `interpretation-schema` — and two sessions may build incompatible base vs. subtype shapes.

**Severity:** MEDIUM — assertion subtypes missing `provenance.promptVersion` pass their own zod validation but fail the gateway's base validation; cost/audit logging is incomplete for some assertion types.

**Closing rule (AD-3b):**
> `interpretation-schema` exports a single `BaseAssertion` zod schema with all required fields (`assertionId: UUIDv7`, `assertionType: string`, `confidence: number 0–1`, `provenance: { sourceRef: string, model: string, promptVersion: string }`, `contextTag: ContextTag`, `createdAt: ISO8601`). Every typed assertion (e.g., `DeadlineAssertion`) is `BaseAssertion.extend({ assertionType: z.literal('deadline'), value: DeadlineValue })`. `llm-gateway` validates each output against the specific typed schema, not just `BaseAssertion`. `promptVersion` is a required string — the gateway passes it; the schema enforces it.

---

## Summary Table

| ID | Pair | Incompatibility | Proposed Rule | Severity |
|----|------|----------------|---------------|----------|
| C-1 | planner build vs. server-action build | `ContextSnapshot` shape invented independently | AD-2a: schema in `interpretation-schema`, frozen | CRITICAL |
| C-2 | connector promotion vs. capture flow | `PersonCreated` payload diverges | AD-6a: canonical payload in `ledger` | CRITICAL |
| C-3 | planner package vs. ledger package | `Plan` type owned by both | AD-4a: projections in `ledger`; `planner` imports `ledger` types | CRITICAL |
| H-1 | web capture action vs. worker extraction | classification on-request vs. queued | AD-3a: web appends command only; classification is always a worker job | HIGH |
| H-2 | commitment undo vs. plan undo | semantic-inverse vs. negation | AD-4b: all compensating commands are forward events; no "skip" projection | HIGH |
| H-3 | connector sync vs. UI display | health schema and computation owner | AD-7a: projection column on `source_identities`; ledger computes from events | HIGH |
| M-1 | worker host vs. connector package | job name strings and input schemas | AD-11: job contracts in the package that owns the work | MEDIUM |
| M-2 | web session auth vs. worker notification | user-ID lookup pattern | AD-12: `db.getUserById` only; userId always in job input | MEDIUM |
| M-3 | llm-gateway assertions vs. interpretation-schema subtypes | `BaseAssertion` fields diverge | AD-3b: `BaseAssertion` in `interpretation-schema`; typed sub-schemas extend it | MEDIUM |

**Counts:** 3 CRITICAL · 3 HIGH · 3 MEDIUM

---

## Proposed New / Tightened ADs

| ID | Status | Text (summary) |
|----|--------|----------------|
| AD-2a | NEW | `ContextSnapshot` schema frozen in `interpretation-schema`; no caller invents its own shape |
| AD-3a | NEW | Web server actions append commands only; all LLM calls are worker jobs |
| AD-3b | NEW | `BaseAssertion` in `interpretation-schema`; all typed assertions extend it; `promptVersion` required |
| AD-4a | NEW | `Plan`/`PlanDiff` projections owned by `ledger`; `planner` imports ledger types; `PlanProposal` is ephemeral |
| AD-4b | NEW | Compensating commands are semantic-inverse forward events; projections replay all events in order |
| AD-6a | NEW | `PersonCreated` canonical payload in `ledger`; all sessions use it; capture-sourced and connector-sourced persons share the schema |
| AD-7a | NEW | Sync health = projection columns on `source_identities`; ledger computes from events using policy thresholds |
| AD-11 | NEW | Job contracts (name + zod schemas) live in the package that owns the work; worker and enqueuers import them |
| AD-12 | NEW | User-record lookup via `db.getUserById` only; worker receives `userId` as job input field |
