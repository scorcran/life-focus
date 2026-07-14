
## Deferred from: code review of spec-1-1-project-scaffold-and-development-environment (2026-07-13)

- `.npmrc` legacy-peer-deps=true globally disables peer-dependency resolution for every install — introduced to work around the @typescript-eslint × TypeScript 7 peer conflict. Revisit and remove when @typescript-eslint publishes TS 7 peer support; until then genuinely-broken peer combos install silently.

## Deferred from: code review of spec-1-2-sign-in-to-a-themed-accessible-shell (2026-07-13)

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-sign-in-to-a-themed-accessible-shell.md`
  summary: The single-user sign-up gate has no DB-level backstop; two concurrent first-time sign-ups could both pass the count-then-insert check (TOCTOU) and create two users, weakening AD-6's "one app user" invariant.
  evidence: `isSignUpOpen` does a `SELECT count` and the `user.create.before` hook (confirmed to abort on `false` at better-auth `db/with-hooks.mjs:17`) only refuses when it reads a non-empty table; the count and the insert are not atomic and there is no partial-unique/singleton constraint on the `user` table. Practically unreachable for a single human operator doing one-time onboarding (hence deferred, not patched), but the correct hardening is a partial unique index enforcing at most one row plus an advisory lock around count+insert. Not applied now because the migration is non-trivial to regenerate cleanly in the current drizzle-kit setup (drizzle.config requires a populated env to run generate).

## Deferred from: code review of spec-1-3-the-event-ledger-small-but-final (2026-07-14)

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-the-event-ledger-small-but-final.md`
  summary: The derived erasure scope `commitment:<id>` has no context component, so two commitments sharing a commitmentId across work/personal would share one AES data key and one `ledger_erasure_key` row (coupling the privacy boundary and enabling over-erasure).
  evidence: `store.ts append()` derives `erasureScope = commitment:${commitmentId}` with no `context`; nothing enforces id uniqueness across contexts. Practically unreachable because commitment ids are application-generated UUIDv7 (collision-free), hence deferred — but the correct hardening is to qualify the scope by context (and, when it exists, the data-subject) once the Person/subject model lands in Epic 2.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-the-event-ledger-small-but-final.md`
  summary: The incremental commitment projection is not serialized per commitment (no `SELECT ... FOR UPDATE`/ordering), so genuinely concurrent appends for the same commitmentId could apply out of `event_seq` order (e.g. an Undone then a re-Captured racing), diverging from a strict rebuild.
  evidence: `applyCommitmentProjection` reads the current row then upserts/deletes without row-lock or event_seq ordering; identity `event_seq` values can also commit out of order under concurrency. Low frequency for a single-user MVP and self-correcting via `projectCommitments` rebuild-from-events (the source of truth); worth a row-lock or ordered-apply when write concurrency becomes real.

## Deferred from: follow-up code review of spec-1-3-the-event-ledger-small-but-final (2026-07-14)

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-the-event-ledger-small-but-final.md`
  summary: Envelope encryption uses AES-256-GCM with a random IV but no Additional Authenticated Data, so nothing cryptographically binds an `EncryptedField` (or a wrapped data key) to the event id / erasure_scope / field path it belongs to.
  evidence: `crypto.ts encryptField`/`wrapDataKey` pass no AAD; all events under one scope share one data key, so a party with write access to `ledger_event` could copy a `{__enc,iv,tag}` envelope from event A into event B's payload and it decrypts as authentic. The append-only trigger blunts the in-DB variant, but GCM integrity is scoped to "some value under this key," not "this field of this event." Binding erasure_scope + field-path as AAD would close it. Deferred as a crypto-format change beyond the minimal demonstrator.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-the-event-ledger-small-but-final.md`
  summary: The `LEDGER_MASTER_KEY` decoder guesses hex-then-base64 rather than requiring an explicit format prefix, so certain key strings are ambiguously interpreted.
  evidence: `config/src/index.ts decodeKeyBytes` tries hex first, then base64; a key whose characters are all hex digits at a colliding length decodes to different bytes than the operator intended. Because the same decoder is used at validation and at unwrap it won't surface as a startup error — it silently maps to the wrong bytes, and any tool using a different heuristic would render every field undecryptable (indistinguishable from erasure). Correct hardening is an explicit `base64:`/`hex:` prefix; deferred as a config-contract change.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-the-event-ledger-small-but-final.md`
  summary: An entity's `context` is not immutable — a second `CommitmentCaptured` for an existing commitmentId under a different context would silently move it across the SEC-2 privacy boundary.
  evidence: `reduceCommitment` on `CommitmentCaptured` overwrites `context` from the event and `applyCommitmentProjection` upserts via `onConflictDoUpdate` (which sets `context`); no `(id)` uniqueness/immutability guard exists. For an append-only ledger an entity's context should be immutable after creation. Not reachable via the current single-capture demonstrator flow; deferred pending a context-immutability guard (or an explicit re-capture policy).

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-the-event-ledger-small-but-final.md`
  summary: The erase projection-cascade and append-time encryption are hardcoded to `commitment.title` and two event types instead of being driven by the sensitive-field catalog + a general event→projection map.
  evidence: `erase()` does `set({ title: REDACTED_MARKER })` and re-derives commitment ids via an inline `CommitmentCaptured`/`CommitmentCaptureUndone` switch (a third copy of `commitmentIdOf`); `append` derives `event:<id>` scopes with no projection-redaction path; re-capturing a scope after erasure mints a fresh key, leaving mixed live/redacted state under one scope string. Any future sensitive projected field or event type would survive erasure in plaintext. Correct within the minimal Commitment demonstrator, but the generalization (single core helper + catalog-driven projection redaction) is deferred to when the second sensitive field/projection lands.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-the-event-ledger-small-but-final.md`
  summary: Any decryption failure on the read path degrades to the same `REDACTED_MARKER` used for lawful erasure, so tamper, corruption, and botched key rotation are indistinguishable from erasure with no signal.
  evidence: `store.ts` read path catches `decryptField` throws (wrong master key / GCM auth failure / tamper) and substitutes `REDACTED_MARKER`, the identical marker a lawfully-erased field yields; there is no log, metric, or distinct marker. For a crypto-shred system "cannot decrypt because tampered" and "cannot decrypt because erased" should not be the same observable outcome. Deferred as an observability enhancement.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-the-event-ledger-small-but-final.md`
  summary: `readEvents` with no filter issues an unbounded SELECT and decrypts the entire append-only log into one in-memory array — no LIMIT or pagination.
  evidence: `store.ts readEvents` builds a filtered/unfiltered select with no `.limit()` and maps every row through decryption; unbounded memory/latency growth as the immutable log accumulates. Fine at MVP scale (rebuild/tests); deferred pending pagination or a streaming read when the log grows.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-the-event-ledger-small-but-final.md`
  summary: The committed dev `LEDGER_MASTER_KEY` default is wired as the compose default for the migrate/web/worker services, so a misconfigured non-dev deploy comes up green with a repo-visible erasure key.
  evidence: `.env.example` and `docker-compose.yml` use `${LEDGER_MASTER_KEY:-<committed constant>}`; a deploy that forgets to override it silently substitutes a known key, and all "erased" data (whose only protection is that key's secrecy) becomes trivially decryptable by anyone with the repo. Matches the existing `BETTER_AUTH_SECRET` pattern, but the erasure-key stakes are higher; deferred as a deployment-hardening change (require the value with no default in prod-oriented compose / fail fast when unset).
