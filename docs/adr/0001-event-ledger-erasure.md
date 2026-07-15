# ADR 0001 — Event Ledger Erasure Strategy

- **Status:** Accepted
- **Date:** 2026-07-13
- **Deciders:** Life Focus engineering (Story 1.3)
- **Binds:** AD-4 (append-only ledger), AD-5 (context tagging), ADD-5 (erasure design), SEC-1

## Context

AD-4 makes the event ledger the single mechanism for all domain mutation:
every domain write appends a row to an insert-only table, and there is
**never** an `UPDATE` or `DELETE` on event tables — enforced at the database
level. Current state is served exclusively from projection tables rebuilt from
those events.

We also owe the user real erasure: when a subject's data must be removed
(GDPR-style right-to-erasure, or simply "forget this"), sensitive content must
become genuinely unrecoverable. These two requirements are in direct tension:
true erasure normally means deleting or overwriting the bytes, but AD-4
forbids mutating event rows.

The erasure approach must be decided and recorded **before** the event table
schema is finalized, because it dictates the physical shape of event payloads
(where sensitive fields live and how they are stored).

## Decision

**Erasure is implemented by crypto-shredding.**

1. Each event type's payload schema declares, in `packages/ledger`, a static
   list of **sensitive field paths** (`sensitiveFields: string[]`, dot-paths
   into the payload — e.g. `["title"]`).
2. At append time the adapter (`packages/db`) encrypts each sensitive field
   **in place** under a per-**erasure-scope** symmetric data key (AES-256-GCM).
   The ciphertext, IV, and auth tag replace the plaintext value inside the same
   `payload jsonb` column: `{ "__enc": "<base64 ct>", "iv": "...", "tag": "..." }`.
   The event row shape is otherwise unchanged.
3. The per-scope data key is itself **envelope-encrypted** ("wrapped") under a
   single `LEDGER_MASTER_KEY` (32 bytes, supplied through `packages/config`) and
   stored in a separate, **mutable** table `ledger_erasure_key`
   (`erasure_scope` PK → `wrapped_data_key`). This table is *not* an event
   table; it may be mutated and rows may be deleted.
4. `erasure_scope` is a **nullable** column on `ledger_event`. Events that
   declare no sensitive fields carry `erasure_scope = null` and store their
   payload as plaintext (nothing to erase).
5. **Erasing a scope deletes its `ledger_erasure_key` row.** The wrapped data
   key is gone, so the data key is unrecoverable, so the ciphertext in every
   event for that scope can never be decrypted again. The event rows themselves
   are never touched — `id`, `event_seq`, `caused_by`, `context`, and all
   non-sensitive payload fields remain byte-stable. Reads of an erased field
   return a redacted marker instead of plaintext.

### Payload-shape rule (consequence of this decision)

Sensitive fields are declared **per event type, in the catalog, in
`packages/ledger`** — one declaration site, alongside the zod payload schema.
The adapter is the only component that encrypts/decrypts; core stays pure and
never touches keys or `node:crypto` for key material. Projections rebuild from
events with the sensitive fields either decrypted (key present) or shown as the
redacted marker (key erased) — the projection logic is identical either way, so
projection purity is preserved.

## Consequences

**Positive**

- Fully compatible with AD-4: no event row is ever mutated or deleted, yet
  erasure is real and irreversible.
- Erasure is O(1) — delete one key row — regardless of how many events
  reference the scope.
- Sensitive-field policy is declarative and centralized (the catalog), so a
  reviewer can audit exactly what is encrypted for each event type.
- "State served only from projections rebuilt from events" holds: projections
  never join a mutable redaction table; the payload is self-contained.

**Negative / trade-offs**

- Requires key management: a master key in config and a per-scope wrapped-key
  table. Losing `LEDGER_MASTER_KEY` renders all sensitive fields unreadable
  (this is by design for erasure, but it means the master key must be backed up
  as carefully as the database).
- Encrypted fields are opaque to SQL — they cannot be indexed or queried by
  content. Acceptable: sensitive fields (e.g. a commitment title) are not query
  keys; context/status/timestamps stay in the clear.
- Decryption cost on read. Negligible at MVP volumes; projections can cache.

## Alternatives considered (rejected)

- **Redactable-in-place payloads** — overwrite the sensitive field in the event
  row with a tombstone on erasure. *Rejected:* this is an `UPDATE` on an event
  table, a direct violation of AD-4's absolute no-mutation rule (and of the
  DB-level `BEFORE UPDATE OR DELETE` trigger that enforces it).

- **Plaintext payload + separate redaction sidecar** — store plaintext in the
  event, and record "field X of event Y is erased" in a mutable sidecar table
  that projections must consult. *Rejected:* it splits the payload across two
  tables and forces every projection to join a mutable table, weakening the
  invariant that current state is rebuilt purely from self-contained events; it
  also leaves the original plaintext physically present (only hidden), which is
  not true erasure.
